import fs from "fs";
import path from "path";
import { fork } from "child_process";
import { fileURLToPath } from "url";

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { TOOLS, TOOLS_BY_NAME } from "./core/tools.js";
import {sendToPipe} from "./utils/pipeClient.js";              //Connect to Pipe Server
import { __log } from "./utils/utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//const child = fork(path.resolve(__dirname, 'child.js'), [], {});

//const pipeServer = connectToPipe(pipeName, 5, 1000);
if (process.ppid) {
    const parentPid = process.ppid;
    const watcher = setInterval(()=> {
        try {
            process.kill(parentPid, 0);
        } catch(_){
            clearInterval(watcher);
            process.exit(0);
        }
    }, 3000);
    watcher.unref();
}

const server = new Server({
    name: "defender-mcp",
    version: "1.0.0"
}, {
    capabilities: {tools: {}}
});

server.setRequestHandler(ListToolsRequestSchema, async()=> {
    return {tools: TOOLS.map(({name, description, inputSchema}) => 
        ({name, description, inputSchema}))}
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const progressToken = request.params?._meta?.progressToken;
    const requestId = crypto.randomUUID();

    const tool = TOOLS_BY_NAME[toolName];
    if (!tool) {
        return { content: 
            [{ type: "text", text: `Tool not found: ${toolName}` }], 
            isError: true };
    }

    __log(`[tool-call] ${toolName} | progressToken: ${progressToken ?? '(none)'}`);

    const onProgress = (p)=> {
        const token = progressToken ?? requestId;
        __log(`[progress] token=${token} ${p.progress}/${p.total} - ${p.message}`);
        try {
            server.notification({
                method: "notifications/progress",
                params: {
                    progressToken: token,
                    progress: p.progress,
                    total: p.total,
                    message: p.message
                }
            });
        } catch(_){}
    }

    try {
        const result = await sendToPipe(
            {
                requestId,
                name: request?.params?.name,
                progressToken,
                ...tool.buildPayload({...request.params.arguments, requestId} || {})
            }, 
            onProgress,
            );
            __log(`[mcp-server.js] Called sendToPipe`);
        return {content: [{
                    type: "text",
                    text: result?.data !== undefined && result?.data !== null
                        ? JSON.stringify(result.data, null, 2)
                        : "No data returned."
                }]} 
    } catch(err){
        __log(`[mcp-server.js] Error ${toolName}: ${err}`);
        return {
            content: [{
                type: "text",
                text: `Error message: ${err}`
            }]
        }
    }

});

const transport = new StdioServerTransport();
await server.connect(transport);
__log(`[startup] MCP server started`);


if (process.argv.includes("--debug-tool")) {

    const tool = TOOLS_BY_NAME["get_chunked_device_timeline"];

    const request = {
        params: {
            name: "get_chunked_device_timeline",
            arguments: {
                search: "test",
                senseMachineId: "machine-1",
                fromDate: "2026-01-01",
                toDate: "2026-01-02",
                pageSize: 100
            },
            _meta: {
                progressToken: "debug"
            }
        }
    };

    server._requestHandler(
        CallToolRequestSchema,
        request
    );
}
