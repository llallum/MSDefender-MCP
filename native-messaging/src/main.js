import { sendMessage, encodeMessage , getMessage} from "./utils/nativeMessaging.js";
const {  dirname,  filename, url } = import.meta;
const { exit, argv: args } = process;
import path from 'path';
import { fork } from "child_process";
import { fileURLToPath } from "url";
//import { nativeMessages } from "./utils/browserMessages.js";
import { encode } from "punycode";
//import { __log } from "./utils/utils.js";
//import { CHILD_MESSAGE_HANDLER } from "./core/toolHandler.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let SOURCE = __filename;

//console.log(path.resolve(__dirname, 'child.js'));

export const runChildProcess = () => {

  const child = fork(path.resolve(__dirname, 'child.js'), [], {
    cwd: process.cwd(),
    detached: false,
    stdio: ['pipe', 'pipe', 'pipe', 'ipc'], // important: need 'ipc' for fork
    windowsHide: false,
  });

  child.on('message', (msg)=> {
    //__log(msg)
    sendMessage(encodeMessage(msg));    //sendback the message to browser

  })
  child.on('error', msg=>{
    sendMessage(encodeMessage(msg));    //sendback the error message to browser
  });
  
  return child;
};

let subprocess = runChildProcess();   //spawn child.js

function shutdown(){
  try{ subprocess.kill();} catch(_){}
  process.exit();
}

process.stdin.on('end', ()=> shutdown());
process.stdin.on('close', ()=> shutdown());

try {
    //await sendMessage(encodeMessage([{ dirname, filename, url}, ...args]));
    for await (const msg of getMessage()) {
      const decoded = String.fromCharCode.apply(null, msg);
      const {type, data} = JSON.parse(decoded);  //source
      
      try {
       // await sendMessage(encodeMessage({source: "Test", ...type, ...message}));
      // __log("testing from main.js");
        subprocess.send({type: type, data: data}); // data from browser will be sent to child.js
      } catch (e){
        await sendMessage(encodeMessage(e));
      }
    }
  } catch (e) {
    await sendMessage(encodeMessage(e));
  }
