import net from "net";
import { fileURLToPath } from "url";
import path from "node:path"
import { sendResponse, log } from "./utils.js";
import { handleMessage } from "./messageHandler.js";
import {pending, progressHandlers} from "./state.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PIPE_NAME = '\\\\.\\pipe\\defender-mcp';

const __logFile = path.resolve(__dirname, "mcp-server.log");
const __log = (msg) => {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    process.stderr.write(line);
    try { fs.appendFileSync(__logFile, line); } catch(_){}
};

let SOURCE = path.relative(process.cwd(), fileURLToPath(import.meta.url));

const pipeClients = new Set();

export function broadcastToMCP(msg){
    const line = JSON.stringify(msg) + '\n';
    for (const client of pipeClients){
        try{
            client.write(line);
        } catch(_){
            pipeClients.delete(client);
            client.destroy();
        }
    }
}

setInterval(()=> {
    sendResponse({
        source: SOURCE,
        type: 'pipe_client_success',
        data: pipeClients.size
    })
    __log(JSON.stringify(
        {
        source: SOURCE,
        type: 'pipe_client_success',
        data: pipeClients.size
    }
    ))
}, 5000);

export function startPipeServer(pipeName=PIPE_NAME){
    const pipeServer = net.createServer(
        (socket)=> {
            pipeClients.add(socket);
            sendResponse({
                source: SOURCE,
                type: 'pipe_client_connected',
                data: `Client ${pipeClients.size} connected`
            });  

            let buffer = '';
            socket.setKeepAlive(true, 5000);
            socket.on('data', async(data)=> {
                buffer += data.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop();
                for (const line of lines){
                    if (!line.trim()) continue;
                    try{
                        const msg = JSON.parse(line);

                        if (msg.type === 'progress') {
                            progressHandlers.get(msg.requestId)?.(msg);
                            continue;
                        }
                        
                        const output = await handleMessage(msg);        //from childHandlers
                        if (output) {
                            output.requestId = msg.requestId;
                            socket.write(JSON.stringify(output) + '\n');        // to pipeClient.js
                        }
                            
                    } catch(e){
                        socket.write(JSON.stringify({source: SOURCE, type: 'error', message: String(e)}) + '\n');
                    }
                }
            });

            socket.on('close', () =>{
                pipeClients.delete(socket);
                socket.destroy();
                __log({source: SOURCE, type : 'pipe_client_disconnected'});
                sendResponse({source: SOURCE, type : 'pipe_client_disconnected'});
            });

            socket.on('error', ()=> {
                pipeClients.delete(socket);
                socket.destroy();
                __log({source: SOURCE, type: 'pipe_socket_error'});
                sendResponse({source: SOURCE, type: 'pipe_socket_error'});
            });
    });

    pipeServer.on('error', (err)=> {
        sendResponse({
            source: SOURCE,
            type: 'pipe_error',
            message: String(err)
        })
    });

    pipeServer.listen(pipeName, ()=> {
        sendResponse({
            source: SOURCE,
            type: 'pipe_ready',
            message: pipeName
        })
    });

return pipeServer;
}



