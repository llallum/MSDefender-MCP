import { spawn } from "child_process";

const server = spawn("node", ["src/client/mcp-server.js"], {
    stdio: ["pipe", "pipe", "pipe"]
});

server.stdout.on("data", (data) => {
    console.log("SERVER:", data.toString());
});

server.stderr.on("data", (data) => {
    console.error("ERR:", data.toString());
});

const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
        _meta: {
            progressToken: "abcd",
        },
        name: "get_associated_devices_by_incident_id",
        arguments: {
            "incidentId": 98682
            }
    }
};

server.stdin.write(JSON.stringify(request) + "\n");
