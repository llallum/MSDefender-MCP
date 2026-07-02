import { useEffect, useState } from "react";
import { Wifi } from "lucide-react";
import { Label , DefaultButton} from "@fluentui/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const App =() => {

    const [scrResponse, setScrResponse] = useState<string | null>(null);
    const [status, setStatus] = useState<boolean>(false);
    const [serverStatus, setServerStatus] = useState<boolean>(false);
    const [clients, setClients] = useState<number>(0);

    const startServer = async() => {
        if (!serverStatus) {
            try {
                chrome.runtime.sendMessage({
                    source: '[App.tsx]',
                    type: 'start_server',
                    data: 'Starting the server'
                },  response => {
                    setServerStatus(response);
                })
            } catch(err) {
                console.error('[App.tsx] error: ', err);
            }
        } else {
            chrome.runtime.sendMessage({
                source: '[App.tsx]',
                type: 'stop_server',
                data: 'Stopping the server'
            }, response => {
                if (response) setServerStatus(false);
            });
        }
    }
    
    useEffect(()=>{

        chrome.runtime.sendMessage({type: 'get_status'}, (response)=> {
            if (response){
                setServerStatus(response.connected);
                setClients(response.clientSize);
            }
        })

        const listener = (msg: any) =>{
            if (msg.type === 'health_check'){
                const {clientSize, connected} = msg.data;

                setClients(clientSize);
                setServerStatus(connected);
            }
        }

        chrome.runtime.onMessage.addListener(listener);

        return () => {
            chrome.runtime.onMessage.removeListener(listener);
        }
    }, [])

    const markDown = `
## Installation Guide

This guide covers how to install the Chrome extension and configure the Windows Registry for Native Messaging so the MCP server can communicate with the extension.

---

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 6.0.0
- **Google Chrome** (latest)
- **Windows** (Registry setup is Windows-specific)
- The MCP native host executable (the server-side binary that the extension talks to via \`com.defender.mcp_server\`)

---

### Step 1 — Load the Extension in Chrome

1. Open Chrome and navigate to: \`chrome://extensions/\`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the **\`dist/\`** folder (the build output directory)
5. The extension **"Browser Session Cookie Utility for Defender Only"** will appear in the list

---

### Step 2 — Your Extension ID

After loading, your Extension ID is shown under the extension name on the extensions page.

> **4Extension ID:** **\`${chrome.runtime.id}\`**

Copy this ID — you will need it for the Registry setup in Step 3.

---

### Step 3 — Windows Registry Setup for Native Messaging

#### 3a — Create the Native Host Manifest JSON

Create a file named \`manifest.json\` in a permanent location (e.g., \`C:\\\\mcp-server\\\\client\\\\\`):

\`\`\`json
{
  "name": "com.defender.mcp_server",
  "description": "MCP Server for Microsoft Defender Session Bridge",
  "path": "C:\\\\mcp-server\\\\client\\\\main.js",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://${chrome.runtime.id}/"
  ]
}
\`\`\`

#### 3b — Register in Windows Registry

Open **Command Prompt as Administrator** and run:

\`\`\`cmd
REG ADD "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\com.defender.mcp_server" /ve /t REG_SZ /d "C:\\mcp-server\\manifest.json" /f
\`\`\`

| Field | Value |
|---|---|
| **Key path** | \`HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\com.defender.mcp_server\` |
| **Value name** | *(Default)* |
| **Value type** | \`REG_SZ\` |
| **Value data** | \`C:\\mcp-server\\manifest.json\` |

#### 3c — Verify the Registry Entry

\`\`\`cmd
REG QUERY "HKCU\\Software\\Google\\Chrome\\NativeMessagingHosts\\com.defender.mcp_server"
\`\`\`

---

### Step 4 — Start the MCP Server

Click the Start button in the sidepanel:

Once started, if this is the initial execution of native messaging, a prompt that ask to execute the main.js. By default, Windows system uses the wscript.exe as a runtime program, we need to replace it by using the node.exe instead of wscript.exe. You can locate it in the Program Files.

You many now connect the Claude / Cline / Zoo Code in VSCode. 

---

### Troubleshooting

| Problem | Solution |
|---|---|
| Native host not found | Verify the Registry path and JSON file path are correct |
| \`allowed_origins\` mismatch | Ensure the Extension ID in the JSON matches the ID shown above |
| Connection drops immediately | Check that the MCP server executable is running |
| Cookies not captured | Make sure you are logged into \`https://security.microsoft.com\` first |

`

    return (
        <main>
            
            <h1>MCP Server for MS Defender XDR</h1>
            <div style={{display: "flex", alignItems: "center", gap: "8px"}}>
                <Wifi color={serverStatus ? "green" : "red"}/>
                <Label>{serverStatus ? "Connected" : "Disconnected"}</Label>
            </div>
            <DefaultButton onClick={startServer}>{serverStatus ? "Stop" :  "Start"}</DefaultButton>
            <Label>Clients connected: {serverStatus ? clients : 0}</Label>
            <div>
                <Markdown remarkPlugins={[remarkGfm]}>{markDown}</Markdown>
            </div>
        </main>
    )
}

export default App;