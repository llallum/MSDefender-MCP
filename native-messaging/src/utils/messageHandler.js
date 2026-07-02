import { sendResponse, errorLog } from "./utils.js";
import { CHILD_MESSAGE_HANDLER } from "../core/toolHandler.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
let SOURCE = path.relative(process.cwd(), __filename);

export async function handleMessage(msg) {
  await errorLog(msg);
  let type = msg?.name || msg?.type;
  let msgHandler = CHILD_MESSAGE_HANDLER[type];
  if (!msgHandler) {
    let errorMessage = {
      source: SOURCE,
      type: "error",
      message: `No handler found for message type: ${msg?.params?.name}`,
    };
    await errorLog(errorMessage);
    return errorMessage;
  }
  try {
    const result = await msgHandler(msg);
    sendResponse(result); // Send to browser extension
    return result; // To MCP server
  } catch (err) {
    await errorLog(err, `handleMessage(${msg.type})`);
    const errorMessage =
      err instanceof Error
        ? `${err.message}`
        : typeof err === "object"
        ? JSON.stringify(err)
        : String(err);
    sendResponse({ source: SOURCE, type: "error", message: errorMessage });
  }
}

export async function handleMcpMessage(msg) {
  // this will only be used for testing
  await errorLog(msg);
  let msgHandler = CHILD_MESSAGE_HANDLER[msg.params.name];
  if (!msgHandler) {
    let errorMessage = {
      source: SOURCE,
      type: "error",
      message: `No handler found for message type: ${msg.params.name}`,
    };
    await errorLog(errorMessage);
    return errorMessage;
  }
  try {
    const result = await msgHandler(msg);
    sendResponse(result); // Send to browser extension
    return result; // To MCP server
  } catch (err) {
    await errorLog(err, `handleMessage(${msg.type})`);
    const errorMessage =
      err instanceof Error
        ? `${err.message}`
        : typeof err === "object"
        ? JSON.stringify(err)
        : String(err);
    sendResponse({ source: SOURCE, type: "error", message: errorMessage });
  }
}
