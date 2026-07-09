import {pendingSessionData} from "./sentinel-apiproxy";

console.log('[background.js] native-message.ts loaded');

let nativePort: chrome.runtime.Port|null = null;
export const PORT_NAME = 'com.defender.mcp_server';

/* let pingInterval:number = 0;
let statusCheck: number = 0;
let flushSessionData : number = 0; */

const PING_ALARM = 'mcp-ping';
const STATUS_ALARM = 'mcp-status-check';
const FLUSH_ALARM = 'mcp-flush-session';

const PING_PERIOD_MIN = 0.1;
const STATUS_PERIOD_MIN = 0.08;
const FLUSH_PERIOD_MIN = 0.5;

const BACKOFF_BASE_MS = 1000;
const BACKOFF_MAX_MS = 30000;

let reconnectAttempt = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

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

async function setShouldStayConnected(value: Boolean){
    await chrome.storage.session.set({shouldStayConnected: value});
}

async function getShouldStayConnected() : Promise<boolean>{
    const result = await chrome.storage.session.get('shouldStayConnected');

    return !!result.shouldStayConnected;
}

chrome.alarms.onAlarm.addListener((alarm)=> {
    if (alarm.name === PING_ALARM) {
        sendPing();
    } else if (alarm.name === STATUS_ALARM){
        sendStatus();
    } else if (alarm.name === FLUSH_ALARM){
        sendSessionData();
    }
})

function startAlarm(){
    chrome.alarms.create(PING_ALARM, {periodInMinutes: PING_PERIOD_MIN});
    chrome.alarms.create(STATUS_ALARM, {periodInMinutes: STATUS_PERIOD_MIN});
    chrome.alarms.create(FLUSH_ALARM, {periodInMinutes: FLUSH_PERIOD_MIN});
}

function stopAlarm(){
    chrome.alarms.clear(PING_ALARM);
    chrome.alarms.clear(STATUS_ALARM);
    chrome.alarms.clear(FLUSH_ALARM);
}

function scheduledReconnect(){
    if (reconnectTimer) return;
    const delay = Math.min(BACKOFF_BASE_MS * Math.pow(2, reconnectAttempt), BACKOFF_MAX_MS);
    reconnectAttempt++;

    chrome.runtime.sendMessage({
        source: `[background.js] native-messaging.ts`,
        type: 'reconnect_attempt',
        data: {attempt: reconnectAttempt, delayMs: delay}
    }).catch(()=> {});

    reconnectTimer = setTimeout(async()=>{
        reconnectTimer = null;
        const shouldStay = await getShouldStayConnected();
        if (shouldStay){
            connectToNativePort(PORT_NAME);
        }
    }, delay)
}

function connectToNativePort(name:string){
    if (!nativePort){
        try {
            nativePort = chrome.runtime.connectNative(name);

            startAlarm();
            reconnectAttempt = 0;

/*             pingInterval = setInterval(sendPing, 10000);
            statusCheck = setInterval(sendStatus, 3000);
            flushSessionData = setInterval(sendSessionData, 30000);
 */

            serverStatus.connected = true;

            nativePort.onDisconnect.addListener((_port)=> {
                const error = chrome.runtime.lastError;
                console.log(`disconnected`, error?.message ?? '');
//                if (port?.name === "") 
//                    nativePort = null;

                stopAlarm();
/*                 clearInterval(pingInterval);
                clearInterval(statusCheck);
                clearInterval(flushSessionData); */
                serverStatus.connected = false;
                serverStatus.clientSize = 0;
/*                 pingInterval = 0;
                statusCheck = 0;
                flushSessionData = 0; */
                nativePort = null;

                getShouldStayConnected().then((shouldStay)=> {
                    if (shouldStay) scheduledReconnect();
                })
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

async function maybeAutoConnect(){
    const shouldStay = await getShouldStayConnected();
    if (shouldStay){
        connectToNativePort(PORT_NAME);
    }
}

chrome.runtime.onStartup.addListener(maybeAutoConnect);
chrome.runtime.onInstalled.addListener(maybeAutoConnect);

chrome.runtime.onMessage.addListener((msg, sender, sendResponse)=> {

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
            setShouldStayConnected(false);
            if (reconnectTimer){clearTimeout(reconnectTimer); reconnectTimer = null;}
            reconnectAttempt = 0;

            if (!nativePort) {
                sendResponse(true);
            } else {
                nativePort.disconnect();
                nativePort = null;

                stopAlarm();
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
