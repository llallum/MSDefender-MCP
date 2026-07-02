# Defender MCP Server

A **Model Context Protocol (MCP) server** that integrates with **Microsoft Defender** and **Microsoft Graph** APIs. It supports two modes of operation:

1. **Native Messaging Host** — communicates with a Chrome extension via Chrome's Native Messaging API
2. **MCP Server** — exposes Defender tools directly to MCP-compatible AI clients (e.g., VSCode with Roo/Cline)

---

## Prerequisites

- [Node.js](https://nodejs.org/) **v20** (v20 is the tested and recommended version; other versions may not work correctly)
- A **Microsoft Defender** tenant with API access
- A **Chrome browser** (if using the Native Messaging Host mode)
- **[Visual Studio Code](https://code.visualstudio.com/)** with the [Roo](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline) or [Cline](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev) extension (if using MCP Server mode)

---

## Folder Structure

This release contains two folders:

```
<release-root>/
├── extension\       ← Chrome extension (load unpacked in Chrome)
└── defender-mcp\    ← MCP server (run install.bat from here)
```

---

## Quick Install (Recommended)

The installer automatically:

1. Runs `npm install` to install dependencies
2. Updates `manifest.json` with the correct absolute path to `src/main.js`
3. Writes the Chrome Native Messaging Host registry key under `HKCU\SOFTWARE\Google\Chrome\NativeMessagingHosts\`

### Steps

1. **Load the Chrome extension** — open `chrome://extensions`, enable **Developer Mode**, click **Load unpacked**, and select the `extension\` folder.

2. **Run the installer** — double-click `install.bat` inside the `defender-mcp\` folder, or run it from the terminal:

```cmd
install.bat
```

3. **Restart Chrome** for the Native Messaging Host registry entry to take effect.

4. **Configure VSCode MCP** — see [Manual Installation step 4](#4-configure-vscode-mcp-roo--cline) below.

That's it! The installer handles everything else automatically.

> **Note:** If the registry step fails, try running `install.bat` as Administrator (right-click → *Run as administrator*).

---

## Manual Installation

If you prefer to set things up manually, follow the steps below.

### 1. Install dependencies

```bash
npm install
```

### 2. Update `manifest.json`

Update the `path` field in `manifest.json` to the absolute path of `src/main.js` on your machine:

```json
{
  "name": "com.defender.mcp_server",
  "description": "MCP Server Native Messaging Host",
  "path": "C:\\path\\to\\mcp\\src\\main.js",
  "type": "stdio",
  "allowed_origins": ["chrome-extension://nlgipginfcfjbkeilighikmiekfhfkpf/"]
}
```

> The installer (`install.js`) sets this automatically.

### 3. Register the Chrome Native Messaging Host

Create a `.reg` file with the following content and double-click to import it:

```reg
Windows Registry Editor Version 5.00

[HKEY_CURRENT_USER\SOFTWARE\Google\Chrome\NativeMessagingHosts\com.defender.mcp_server]
@="C:\\path\\to\\mcp\\manifest.json"
```

> Update the value to match the actual path to your `manifest.json`. Restart Chrome after importing.

### 4. Configure VSCode MCP (Roo / Cline)

Open the VSCode Command Palette (`Ctrl+Shift+P`) and search for **"Roo: Open MCP Settings"** (or **"Cline: Open MCP Settings"**). Add the `defender-mcp` entry to the `mcpServers` object:

```json
{
  "mcpServers": {
    "defender-mcp": {
      "command": "node",
      "args": ["C:\\path\\to\\mcp\\src\\mcp-server.js"]
    }
  }
}
```

> Update the path to match your actual project directory. Reload VSCode after saving — the Defender tools will appear automatically in the MCP tools list.

---

## Configuration

### Defender Credentials

The server reads Defender API credentials from `src/defender.json`. This file is populated automatically when the Chrome extension sends headers via Native Messaging.

---

## Available MCP Tools

Once connected via MCP, the following tools are available:

### Incident Management

| Tool | Description |
|------|-------------|
| `get_defender_incidents` | Get Defender incidents; supports lookback days, date range, pagination, and machine ID filtering |
| `get_defender_incident_by_id` | Get full details of a specific incident by ID |
| `get_defender_incident_audit_logs` | Get audit log history for an incident |
| `get_defender_incident_associated_alerts_cnt` | Get the count of alerts associated with one or more incidents |
| `get_defender_incident_associated_alerts` | Get paginated alerts associated with a specific incident |
| `set_defender_incident_comment` | Post a comment (text or HTML) to one or more incidents |

### Alert Management

| Tool | Description |
|------|-------------|
| `analyze_alert_by_id` | Deep-analyze a Defender alert by ID — auto-detects source (MDE, MDI, MDO, MCAS) and returns structured details |
| `set_defender_alert_comment` | Post a text comment to a specific alert |

### Hunting & Investigation

| Tool | Description |
|------|-------------|
| `run_defender_hunting_query` | Run a KQL query in Microsoft Defender Advanced Hunting with configurable time range and record limit |

### Device Management

| Tool | Description |
|------|-------------|
| `get_associated_devices_by_incident_id` | Get full device details for all devices associated with an incident |
| `get_device_info_by_sense_machine_id_or_hostname` | Look up a device by its 40-char hex SenseMachineId, hostname, or IP address |
| `get_device_inventory_by_category` | Get device inventory totals filtered by category (Endpoint, IoT, OT, NetworkDevice, Medical, BMS, Unknown) |
| `get_software_inventory_by_device_id` | Get paginated software inventory for a specific device |

### Microsoft Graph (Users & Identity)

| Tool | Description |
|------|-------------|
| `msgraph_get_users` | Search Azure AD users with OData `$filter` and `$select` support; includes pagination via skip token |
| `msgraph_get_user_authentication_methods` | Get registered authentication methods for a user by their Azure AD object ID (GUID) |

---

## Alert Source Detection

The `analyze_alert_by_id` tool automatically identifies the alert source from the alert ID prefix and routes to the appropriate analyzer:

| Source | Prefix Pattern | Analyzer |
|--------|---------------|----------|
| **MDE** (Microsoft Defender for Endpoint) | `da` / `ed` | `alertAnalyzer/mde.js` |
| **MDI** (Microsoft Defender for Identity) | `aa` | `alertAnalyzer/mdi.js` |
| **MDO** (Microsoft Defender for Office 365) | `fa` | `alertAnalyzer/mdo.js` |
| **MCAS** (Microsoft Defender for Cloud Apps) | `ca` / `ma` | `alertAnalyzer/mcas.js` |
| **MS Graph** | — | `alertAnalyzer/msgraph.js` |

---

## Project Structure

```
mcp/
├── install.bat                  # Double-click installer (Windows)
├── install.js                   # Installer script (Node.js)
├── run.bat                      # Launcher wrapper for Chrome Native Messaging
├── manifest.json                # Chrome Native Messaging Host manifest
├── package.json                 # Node.js dependencies
├── src/
│   ├── main.js                  # Native Messaging Host entry point
│   ├── mcp-server.js            # MCP Server entry point
│   ├── child.js                 # Child process — initializes Defender client
│   ├── defender.json            # Defender API credentials (auto-generated)
│   ├── core/
│   │   ├── defender.js          # Defender class — all API methods
│   │   ├── endpoints.js         # API endpoint URL constants
│   │   ├── tools.js             # MCP tool definitions (schema + payload builders)
│   │   ├── toolHandler.js       # Message handlers — maps tool calls to Defender methods
│   │   ├── kusto.js             # Azure Data Explorer (Kusto) client
│   │   ├── alertTypes.js        # Alert type constants and mappings
│   │   └── alertAnalyzer/
│   │       ├── alertIdPatterns.js   # Alert ID prefix → source detection
│   │       ├── mde.js               # MDE alert analyzer + device inventory/software
│   │       ├── mdi.js               # MDI alert analyzer (SAMR, DCSync, etc.)
│   │       ├── mdo.js               # MDO alert analyzer (email threats)
│   │       ├── mcas.js              # MCAS alert analyzer (cloud app threats)
│   │       └── msgraph.js           # MS Graph user/identity queries
│   └── utils/
│       ├── httpClient.js            # HTTP client (GET/POST/PATCH with cookie auth)
│       ├── nativeMessaging.js       # Chrome Native Messaging protocol framing
│       ├── browserMessages.js       # Browser message type definitions
│       ├── pipeClient.js            # Named pipe client utility
│       ├── pipeServer.js            # Named pipe server utility
│       └── utils.js                 # General utilities (JSON I/O, logging)
```

---

## Troubleshooting

- **Chrome extension not connecting** — Make sure `manifest.json` points to `src/main.js` and the registry key is correctly set. Run `install.bat` to fix this automatically.
- **Registry write failed** — Run `install.bat` as Administrator (right-click → *Run as administrator*).
- **`defender.json` not found** — Ensure the Chrome extension has sent credentials at least once. The file is created automatically on first use.
- **Node.js version errors** — This project requires **Node.js v20**. Run `node --version` to check. Other versions (including v18, v22) may not work correctly.
- **MCP tools not appearing in VSCode** — Reload VSCode (or restart the Roo/Cline extension) after updating the MCP config, and confirm `node src/mcp-server.js` runs without errors.
- **Credentials expired** — Defender session tokens expire. Re-authenticate via the Chrome extension to refresh `src/defender.json`.
