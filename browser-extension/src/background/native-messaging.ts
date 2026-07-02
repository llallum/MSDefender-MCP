import {pendingSessionData} from "./sentinel-apiproxy";

console.log('[background.js] native-message.ts loaded');

let nativePort: chrome.runtime.Port|null = null;
export const PORT_NAME = 'com.defender.mcp_server';

let pingInterval:number = 0;
let statusCheck: number = 0;
let flushSessionData : number = 0;

let serverStatus:any= {
    clientSize: 0,
    connected: false
}

function sendStatus(){
    const msg = {
        source: 'background.js',
        type: 'health_check',
        data: serverStatus
    };
    console.log(msg);
    chrome.runtime.sendMessage(msg);
}

function sendPing(){
    const msg = {
        source: 'background.js', 
        type: 'ping', 
        data: Date.now().toString()};
    console.log(msg);
    nativePort?.postMessage(msg);
}

function sendSessionData(){

    const msg = {
        source: 'background.js',
        type: 'session_data',
        data: pendingSessionData
    }
    console.log(msg);
    nativePort?.postMessage(msg);
}

function connectToNativePort(name:string){
    if (!nativePort){
        try {
            nativePort = chrome.runtime.connectNative(name);

            pingInterval = setInterval(sendPing, 10000);
            statusCheck = setInterval(sendStatus, 3000);
            flushSessionData = setInterval(sendSessionData, 30000);


            serverStatus.connected = true;

            nativePort.onDisconnect.addListener((_port)=> {
                const error = chrome.runtime.lastError;
                console.log(`disconnected`, error?.message ?? '');
//                if (port?.name === "") 
//                    nativePort = null;

                clearInterval(pingInterval);
                clearInterval(statusCheck);
                clearInterval(flushSessionData);
                serverStatus.connected = false;
                serverStatus.clientSize = 0;
                pingInterval = 0;
                statusCheck = 0;
                flushSessionData = 0;
                nativePort = null;
            });


            nativePort.onMessage.addListener(
                function(msg){
                    if (msg?.type === 'pong'){
                        console.log(msg);
                        chrome.runtime.sendMessage({
                            source: '[background.js] native-messaging.ts',
                            type: 'pong',
                            data: msg.data
                        })
                    } else if (msg?.type === 'pipe_client_success'){
                        serverStatus.clientSize = msg.data;
                        chrome.runtime.sendMessage({
                            source: '[background.js] native-messaging.ts',
                            type: 'pipe_clients',
                            data: msg.data
                        })
                    } else if (msg?.type === 'session_data'){
                        console.log(msg);
                    }
            });

            return true;

        } catch(err){
            console.error('[background] native-messaging.ts: Failed to connect', err);
            return false;
        } 
    }
    return true;
}


chrome.runtime.onMessage.addListener((msg, sender, sendResponse)=> {
    const sendMessage = (port: chrome.runtime.Port)=> {
        port.postMessage({
            source: '[background.js]',
            type: msg?.type,
            data: msg?.data
        })
    }
//    connectToNativePort(PORT_NAME, sendMessage);
    if (msg.type === 'start_server'){
        try {
            const res = connectToNativePort(PORT_NAME);
            sendResponse(res);
        } catch(err){
            console.error(`[background] native-messaging.ts`, err);
            sendResponse(false);
        }
        sendResponse(true);
    } else if (msg.type === 'stop_server'){
        try {
            if (!nativePort) {
                sendResponse(true);
            } else {
                nativePort.disconnect();
                nativePort = null;
                clearInterval(pingInterval);
                clearInterval(statusCheck);
                clearInterval(flushSessionData);
                serverStatus.connected = false;
                sendResponse(true);
            }
        } catch(err){
            console.error('[background.js] native-messaging.ts', err);
            sendResponse(false);
        }
    } else if (msg.type === 'get_status'){
        sendResponse(serverStatus);
    }
    return true;
});


export {};
