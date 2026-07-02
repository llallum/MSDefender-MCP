
import net from "net";
import path from "path";
import { stderr } from "process";
import { fileURLToPath } from "url";

import { Defender } from "../core/defender.js";
import { startPipeServer } from "../utils/pipeServer.js";
import {
    sendResponse,
    saveToJson,
    readJson,
    log,
    __log
  } from "../utils/utils.js";
import { handleMessage, handleMcpMessage } from "../utils/messageHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFENDER_JSON = path.resolve(path.join(__dirname, '..'), 'defender.json');

let SOURCE = path.resolve(__dirname, __filename);
let defenderInstance = null;
let inMemoryHeader = null;

export function setInMemoryHeaders(headers=null){
  __log(`[child.js] called setInMemoryHeaders`);
  inMemoryHeader = headers;
//  defenderInstance = null;
}

export async function getDefender() {
  __log("[child.js] called getDefender");
  try {
    // Prefer in-memory headers (fresh from browser extension) over stale file
    const data = inMemoryHeader ?? await readJson(DEFENDER_JSON);

    if (!data) {
      __log(`[child.js] No session available`);
      throw new Error("No session available");
    }

    if (!defenderInstance) {
      // First-time instantiation
      __log('[child.js] defenderInstance instantiated');
      defenderInstance = new Defender(data);
      __log(`[child.js] Defender Instance is created`);
    } else if (defenderInstance.expired) {
      if (inMemoryHeader) {
        // Refresh with latest in-memory headers
        __log(`[child.js] Session expired — refreshing using inMemoryHeader`);
        defenderInstance.refreshSession(inMemoryHeader);
      } else {
        // No in-memory headers available; re-instantiate from file
        __log(`[child.js] Session expired — re-instantiating from file`);
        defenderInstance = new Defender(data);
      }
    }

    return defenderInstance;
  } catch(e){
    __log(`[child.js] Error calling getDefender: ${e}`);
    sendResponse({source: SOURCE, type: "error", message: `${e}`});
    throw new Error('Error calling getDefender');
  }
}

process.on('message', async(msg) => {
  // Ignore JSON-RPC 2.0 protocol messages (e.g. initialize from MCP client)
  // These are handled by mcp-server.js via the MCP SDK, not here.
  if (msg?.jsonrpc) return;
 // __log(JSON.stringify(msg));
  const result = await handleMessage(msg);
  if (result) sendResponse(result);
})

if (!process.send){     //if child.js is run as standalone then it uses stdin for testing.
  process.stdin.on('data', async (data) => {
    try{
       // if (msg?.jsonrpc) return;
      const msg = JSON.parse(data.toString());
      return await handleMcpMessage(msg);     //for testing only
    } catch(e){
      sendResponse({source: SOURCE, type: "error", message: `Error parsing message: ${e}`});
    }

  });
}

process.on('uncaughtException', (err)=>{
  process.send?.({
    source: SOURCE, 
    type: 'exception', 
    message: err?.message || String(err),
    stack: err?.stack || ''});
});

process.on('unhandledRejection', (reason, promise)=> {
  process.send?.({
    source: SOURCE,
    type: 'exception',
    message: reason?.message || String(reason),
    stack: reason?.stack || ''
  })
})

startPipeServer();            // Initialize Pipe Server where MCP server will connects
__log(`[child.js] Started Pipe Server`);
