import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import { request } from "http";
import {pending, progressHandlers} from "./state.js";
import { __log } from "./utils.js";

let PIPE_NAME = '\\\\.\\pipe\\defender-mcp';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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


let pipeClient = await connectToPipe();

if (!pipeClient){
    process.stderr.write('Failed to connect to Server');
    process.exit(1);
}

let pipeBuffer = '';
pipeClient.on('data', (data) => {
    pipeBuffer += data.toString();
    const lines = pipeBuffer.split('\n');
    pipeBuffer = lines.pop();
    for (const line of lines){
        if (!line.trim()) continue;
        try{
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

pipeClient.on('close', ()=> process.stderr.write('PIPE_CLOSED\n'));
pipeClient.on('end', ()=> process.stderr.write('PIPE_ENDED\n'));
pipeClient.on('error', ()=> process.stderr.write('PIPE_ERROR\n'));

export async function sendToPipe(       // to child.js
            request, //resultType, 
            onProgress, 
            timeoutMs = 300_000){
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
