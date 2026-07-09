import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { request } from "http";
import {pending, progressHandlers} from "./state.js";
import { __log } from "./utils.js";

let PIPE_NAME = '\\\\.\\pipe\\defender-mcp';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

let pipeClient = null;
let isConnected = false;
let isReconnecting = false;
let reconnectAttempt = 0;
let pipeBuffer = '';

async function connectToPipe(retries= 10, delayMs= 1500){
  for (let i=0; i < retries; i++){
    try{
      const socket = await new Promise((resolve, reject)=> {
        const s = net.connect(PIPE_NAME);
        s.once('connect', ()=> resolve(s));
        s.once('error', (err)=>reject(err));  
      })
      return socket;
    }catch(_){
      if (i < retries - 1) await new Promise(r => setTimeout(r, delayMs));
    }
  }
  return null;
}

function rejectAllPending(reason){
    for (const [requestId, resolve] of pending.entries()){
        pending.delete(requestId);
        progressHandlers.delete(requestId);
        resolve({type: 'error', message: reason})
    }
}

function attachToSocket(socket){

    socket.on('data', (data) => {
    pipeBuffer += data.toString();
    const lines = pipeBuffer.split('\n');
    pipeBuffer = lines.pop();
    for (const line of lines){
        if (!line.trim()) continue;
        try {
                const msg = JSON.parse(line);

                if (msg?.type === 'progress'){
                    //const handler  = 
                    progressHandlers.get(msg.requestId)?.(msg);
                // handler?.(msg);
                    continue;
                }

                //console.error(msg);
                const resolve = pending.get(msg.requestId);
                if(resolve) {
                    pending.delete(msg.requestId); 
                    resolve(msg);
                }
            } catch(_){}
        }
    })

    const handleDrop = (reason)=> {
        if (pipeClient != socket) return;
    
        __log(`[pipeClient.js] ${reason}`);
        //process.stderr.write(`${label}\n`);
        isConnected = false;
        rejectAllPending(`[pipeClient.js] Native host has lost connection ${reason}. Reconnecting...`);
        scheduledReconnect();
    }

    socket.on('close', ()=> handleDrop('PIPE_CLOSED\n'));
    socket.on('end', ()=> handleDrop('PIPE_ENDED\n'));
    socket.on('error', ()=> handleDrop('PIPE_ERROR\n'));

}

function scheduledReconnect(){
    if (isReconnecting) return;
    isReconnecting = true;

    const delay = Math.min(RECONNECT_BASE_MS * Math.pow(2, reconnectAttempt), RECONNECT_MAX_MS);

    reconnectAttempt ++;

    __log(`[pipeClient.js] Reconnecting in ${delay}ms (attempt ${reconnectAttempt})`);

    setTimeout(async()=> {
        const socket = await connectToPipe();
        isReconnecting = false;
    
        if (!socket){
            scheduledReconnect();
            return;
        }
        
        pipeClient = socket;
        isConnected = true;
        reconnectAttempt = 0;
        pipeBuffer = '';
        attachToSocket(socket);
        __log(`[pipeClient.js] Successfully reconnected to pipeServer.`);
    }, delay);
}

export function isPipeConnected(){
        return isConnected && !!pipeClient;
}

export async function connectToServer(){
    pipeClient = await connectToPipe();

    if (!pipeClient){
        __log('[pipeClient.js] Failed to connect to PipeServer');
        process.stderr.write('Failed to connect to Server');
        scheduledReconnect();
    //    process.exit(1);
    }else {
        isConnected = true;
        attachToSocket(pipeClient);
    }
}

export async function sendToPipe(       // to child.js
            request, //resultType, 
            onProgress, 
            timeoutMs = 300_000){

    if (!isPipeConnected()){
        return Promise.resolve({
            type: 'error',
            message: '[pipeClient.js] Native host disconnected, reconnecting... please retry shortly.'
        })
    }

    return new Promise((resolve, reject)=> {

//        const requestId = crypto.randomUUID();
//        msg.requestId = requestId;

        if (!request?.requestId) {
            throw new Error("No request ID");
        }

        const {requestId} = request;

        const timer = (setTimeout(()=> {
            pending.delete(requestId);
            progressHandlers.delete(requestId);
            reject(new Error(`[pipeClient.js] Timeout waiting for ${requestId}`));
        }, timeoutMs));

        pending.set(requestId, (result)=> {
            clearTimeout(timer);
            pending.delete(requestId);
            progressHandlers.delete(requestId); 
            resolve(result);
        });

       if (onProgress){
           progressHandlers.set(requestId, onProgress);
       }

       __log(`[pipeClient.js] Sending request to pipeServer`);
        __log(`[pipeClient.js] ${JSON.stringify(request)}`);
        pipeClient.write(JSON.stringify(request) + '\n');   //to pipeServer.js under child.js
    })
}


if (process.argv[1]?.endsWith('pipeClient.js')){
    try {
        const result = await sendToPipe({source: 'pipeClient', type: 'get_incidents', lookBackInDays: 30}, 'incidents_result');
        console.log(result);
    } catch(e){

    }
} 
