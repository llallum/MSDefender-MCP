import fs from "node:fs/promises"
import fsSync from "fs"
import { fileURLToPath } from "node:url";
import path from "node:path"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const __logFile = path.resolve(path.join(__dirname, "../"), "mcp-server.log");

let SOURCE = path.relative(process.cwd(), fileURLToPath(import.meta.url));
export async function saveToJson(filePath, data){
  __log(`[utils.js] called saveToJson`);
  try {
    const jsonData = JSON.stringify(data);
    await fs.writeFile(filePath, jsonData, 'utf-8');
    //console.log(`JSON written successfully to ${filePath}`);
   // log({source: SOURCE, type: "info", message: `JSON written successfully: ${filePath}`}, subprocess);
    return {source: SOURCE, type: "success_json", message: `[${(new Date()).toISOString()}][${SOURCE}]: JSON written successfully to ${filePath}`}
  } catch(e){
    return {source: SOURCE, type: "error", message: `Error writing JSON to file: ${e}`};
  }
}

export async function readJson(filePath){
  __log(`[utils.js] called readJson`);
  try{
    const jsonData = await fs.readFile(filePath);
    const parsedData = JSON.parse(jsonData);
    return parsedData;
  }catch(e){
    __log(JSON.stringify({source: SOURCE, type: "error", message: `Error reading JSON from file: ${e}`}));
    return null;
  }
}

export const __log = (msg) => {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    process.stderr.write(line);
    try { fsSync.appendFileSync(__logFile, line); } catch(err){
      process.stderr.write(`[${new Date().toISOString()}] Failed to write to log file: ${err}\n`);
    }
};

export function log(data, subprocess) {
    if (typeof subprocess?.send === 'function') {
        errorLog(data);
        subprocess.send(data);
    } else {
        console.log(JSON.stringify(data));
    }
}

export async function errorLog(err, context = "") {
    try {
      const timestamp = new Date().toISOString();
      
      const message = 
        err instanceof Error 
          ? `${err.name} : ${err?.message}\n ${err?.stack}`
          : JSON.stringify(err, null, 2);
    
      await fs.appendFile(
        "./error.log",
        `[${timestamp}]: ${context}\n ${message}\n`,
        "utf-8"
      )
    } catch(err) {
      console.error("Failed to write an error.log", err);
    }

}

export const sendResponse = (data) => {
  if (typeof process.send === 'function') {
    const json = JSON.stringify(data);
    const size = Buffer.byteLength(json);

    const MAX_SIZE = 1024 * 1024; //1MB
    if (size > MAX_SIZE) {
//      errorLog({source: SOURCE, data: "Buffer exceeds"});
      process.send({source: SOURCE, data: "Buffer exceeds"});
    } else {
//    errorLog(data);
    process.send(data);
    }

  } else {
//    console.log(JSON.stringify(data));
    __log(JSON.stringify(data));
//    process.stderr.write(JSON.stringify(data) + '\n');
  }
};


