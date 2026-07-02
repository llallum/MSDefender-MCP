# MSDefender-MCP

A **Model Context Protocol (MCP) server** that integrates with **Microsoft Defender XDR** and **Microsoft Graph** APIs — **no API token required**. Authentication is handled via a Chrome browser extension that captures your active Defender session cookies.

> **Compatible with:** [Zoo Code (Roo)](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline) · [Cline](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev) · [Claude Desktop](https://claude.ai/download) · [Claude.ai Console](https://console.anthropic.com) · Any MCP-compatible AI client

---

## How It Works

```
Chrome Browser                    Your Machine
┌─────────────────┐              ┌──────────────────────────────────────┐
│ browser-        │  Native      │ native-messaging/                    │
│ extension/      │◄────────────►│   src/main.js    (entry point)       │
│                 │  Messaging   │   src/child.js   (Defender client)   │
│ Captures your   │              │   src/mcp-server.js (MCP server)     │
│ Defender session│              └──────────────────────────────────────┘
│ cookies & sends │                          │
│ them to the     │                          │ MCP Protocol (stdio)
│ native host     │                          ▼
└─────────────────┘              ┌──────────────────────────────────────┐
                                 │ Any MCP Client:                      │
                                 │  • Zoo Code (Roo) in VSCode          │
                                 │  • Cline in VSCode                   │
                                 │  • Claude Desktop                    │
                                 │  • Claude.ai Console                 │
                                 └──────────────────────────────────────┘
```

The Chrome extension intercepts your authenticated Defender session and forwards the session headers to the native messaging host. The MCP server then uses those headers to make API calls to Microsoft Defender XDR on your behalf.

---

## Repository Structure

```
MSDefender-MCP/
├── native-messaging/     ← MCP Server + Native Messaging Host (Node.js)
│   ├── install.bat       ← Double-click installer (Windows)
│   ├── install.js        ← Installer script
│   ├── manifest.json     ← Chrome Native Messaging Host manifest
│   ├── package.json      ← Node.js dependencies
│   ├── run.bat           ← Launcher wrapper
│   └── src/
│       ├── main.js           ← Native Messaging Host entry point
│       ├── mcp-server.js     ← MCP Server entry point
│       ├── child.js          ← Child process (Defender client)
│       ├── core/
│       │   ├── defender.js       ← Defender class (all API methods)
│       │   ├── endpoints.js      ← API endpoint URL constants
│       │   ├── tools.js          ← MCP tool definitions
│       │   ├── toolHandler.js    ← Tool call → Defender method mapping
│       │   ├── alertTypes.js     ← Alert type constants
│       │   └── alertAnalyzer/
│       │       ├── alertIdPatterns.js  ← Alert ID → source detection
│       │       ├── mde.js              ← MDE alert analyzer + device timeline
│       │       ├── mdi.js              ← MDI alert analyzer
│       │       ├── mdo.js              ← MDO email threat analyzer
│       │       ├── mcas.js             ← MCAS cloud app threat analyzer
│       │       ├── aad.js              ← AAD alert analyzer
│       │       └── msgraph.js          ← MS Graph user/identity queries
│       └── utils/
│           ├── httpClient.js       ← HTTP client (cookie-based auth)
│           ├── nativeMessaging.js  ← Chrome Native Messaging protocol
│           ├── pipeClient.js       ← Named pipe client
│           ├── pipeServer.js       ← Named pipe server
│           ├── messageHandler.js   ← Message routing
│           ├── state.js            ← Shared state (pending requests)
│           ├── duckdbClient.js     ← DuckDB client for timeline analysis
│           ├── timelineStorage.js  ← Device timeline JSONL storage
│           ├── incidentStatusValues.js ← Incident status enums
│           └── utils.js            ← General utilities
│
└── browser-extension/    ← Chrome Extension source (TypeScript + React)
    ├── manifest.json         ← Chrome extension manifest (MV3)
    ├── package.json          ← Node.js dependencies (TypeScript, Webpack, React)
    ├── tsconfig.json         ← TypeScript configuration
    ├── webpack.config.js     ← Webpack bundler config
    ├── plans/
    │   └── INSTALLATION.md   ← Extension installation guide
    └── src/
        ├── index.html            ← Side panel HTML shell
        ├── background/
        │   ├── index.ts              ← Background service worker entry
        │   ├── native-messaging.ts   ← Chrome Native Messaging bridge
        │   ├── sentinel-apiproxy.ts  ← Defender session header capture
        │   └── sidepanel.ts          ← Side panel message handler
        ├── content/
        │   └── index.ts              ← Content script (page-level injection)
        └── react/
            ├── index.tsx             ← React app entry point
            └── components/
                └── App.tsx           ← Main React UI component
```

---

## Prerequisites

- **Node.js v20** — [Download](https://nodejs.org/)
- **Google Chrome** browser
- **Microsoft Defender XDR** access (any licensed user)
- **One of the following MCP clients:**
  - [Zoo Code (Roo)](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline) — VSCode extension
  - [Cline](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev) — VSCode extension
  - [Claude Desktop](https://claude.ai/download) — Desktop app
  - [Claude.ai Console](https://console.anthropic.com) — Web-based (requires MCP proxy)

---

## Quick Install

### Step 1 — Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `browser-extension/` folder

### Step 2 — Install the Native Messaging Host

Navigate to the `native-messaging/` folder and run:

```cmd
install.bat
```

This will:
1. Run `npm install` to install Node.js dependencies
2. Update `manifest.json` with the correct absolute path to `src/main.js`
3. Write the Chrome Native Messaging Host registry key

> **Note:** If the registry step fails, right-click `install.bat` → **Run as administrator**.

### Step 3 — Configure Your MCP Client

#### Zoo Code (Roo) or Cline — VSCode

Open the VSCode Command Palette (`Ctrl+Shift+P`) → **"Roo: Open MCP Settings"** (or **"Cline: MCP Servers"**) and add:

```json
{
  "mcpServers": {
    "defender-mcp": {
      "command": "node",
      "args": ["C:\\path\\to\\native-messaging\\src\\mcp-server.js"]
    }
  }
}
```

#### Claude Desktop

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "defender-mcp": {
      "command": "node",
      "args": ["C:\\path\\to\\native-messaging\\src\\mcp-server.js"]
    }
  }
}
```

Restart Claude Desktop after saving.

#### Claude.ai Console

The Claude.ai web console supports MCP via the **MCP Remote** proxy. Run the MCP server locally and expose it via `mcp-remote` or a compatible tunnel, then add the remote URL in the Claude console settings.

> **Note:** Update all paths above to match your actual installation directory.

### Step 4 — Authenticate

1. Open Chrome and navigate to [Microsoft Defender XDR](https://security.microsoft.com)
2. Sign in with your Microsoft account
3. Click the **Defender MCP** extension icon — it will capture your session and send it to the native host
4. The MCP tools will now be available in VSCode

---

## Available MCP Tools

### Incident Management

| Tool | Description |
|------|-------------|
| `get_defender_incidents` | Get incidents with filtering by date, severity, machine ID, IP, URL, hash |
| `get_defender_incident_by_id` | Get full details of a specific incident |
| `get_defender_incident_audit_logs` | Get audit log history for an incident |
| `get_defender_associated_alerts_count` | Get alert count for one or more incidents |
| `get_defender_associated_alerts` | Get paginated alerts for an incident |
| `update_defender_incident_status` | Update incident status, severity, classification |
| `set_defender_incident_comment` | Post a comment to one or more incidents |

### Alert Management

| Tool | Description |
|------|-------------|
| `get_defender_alert_info` | Deep-analyze an alert by ID (auto-detects MDE/MDI/MDO/MCAS/AAD) |
| `set_defender_alert_comment` | Post a comment to a specific alert |
| `link_alert_to_incident` | Link alerts to an incident with a reason |

### Hunting & Investigation

| Tool | Description |
|------|-------------|
| `get_defender_hunting_query_schemas` | List available Advanced Hunting tables |
| `get_defender_table_documentation` | Get schema and examples for a specific table |
| `run_defender_hunting_query` | Run a KQL query in Advanced Hunting |
| `run_azure_datalake_hunting_query` | Run a KQL query against Azure Data Lake |

### Device Timeline & Forensics

| Tool | Description |
|------|-------------|
| `search_device_timeline` | Search device timeline events with filters |
| `download_raw_device_timeline` | Download full device timeline to local JSONL storage |
| `init_duckdb` | Initialize DuckDB for local timeline analysis |
| `create_duckdb_table` | Create a DuckDB table from downloaded timeline data |
| `get_raw_table_summary` | Get summary/schema of a DuckDB timeline table |
| `run_sql_query` | Run SQL queries against local DuckDB timeline data |
| `mark_device_timeline_event` | Mark/unmark a timeline event as notable |

### Device Management

| Tool | Description |
|------|-------------|
| `get_device_info_by_senseMachineId` | Look up a device by SenseMachineId or hostname |
| `get_associated_devices_by_incident_id` | Get all devices associated with an incident |
| `get_device_inventory_by_category` | Get device inventory by category (Endpoint, IoT, OT, etc.) |
| `get_software_inventory_by_device_id` | Get software inventory for a device |

### Identity & Users

| Tool | Description |
|------|-------------|
| `search_mdi_identities` | Search Microsoft Defender for Identity users |
| `search_mdi_identity_by_radius_user_id` | Look up identity by Radius user ID |
| `get_mdi_service_accounts_list` | List Active Directory service accounts |
| `msgraph_get_users` | Search Azure AD users with OData filter support |
| `msgraph_get_groups` | Search Azure AD groups |
| `msgraph_get_user_authentication_methods` | Get MFA/auth methods for a user |

### Threat Intelligence

| Tool | Description |
|------|-------------|
| `get_threat_analytics` | Get threat analytics reports with filtering |
| `get_threat_analytics_report_by_id` | Get full threat analytics report details |
| `get_url_overview_information` | Get domain/URL threat intelligence |

### AI Security

| Tool | Description |
|------|-------------|
| `sec4ai_get_local_agents` | List local AI agents (Copilot, Claude, etc.) on devices |
| `sec4ai_get_local_agent_info` | Get details of a specific local AI agent |

---

## Alert Source Detection

The `get_defender_alert_info` tool automatically identifies the alert source from the alert ID prefix:

| Source | Prefix | Analyzer |
|--------|--------|----------|
| **MDE** (Microsoft Defender for Endpoint) | `da`, `ed` | `alertAnalyzer/mde.js` |
| **MDI** (Microsoft Defender for Identity) | `aa` | `alertAnalyzer/mdi.js` |
| **MDO** (Microsoft Defender for Office 365) | `fa` | `alertAnalyzer/mdo.js` |
| **MCAS** (Microsoft Defender for Cloud Apps) | `ca`, `ma` | `alertAnalyzer/mcas.js` |
| **AAD** (Azure AD Identity Protection) | `ib` | `alertAnalyzer/aad.js` |

---

## Architecture

The server uses a **named pipe IPC** architecture:

```
Chrome Extension
      │ Native Messaging
      ▼
  main.js  ──fork──►  child.js  ◄──── defender.json (session)
                          │
                    pipeServer.js  (named pipe: \\.\pipe\defender-mcp)
                          │
                    pipeClient.js
                          │
                    mcp-server.js  ◄──── VSCode / AI Client
```

- **`main.js`** — Native Messaging Host; receives session headers from Chrome extension and forwards messages to `child.js`
- **`child.js`** — Spawned child process; holds the Defender session and handles all API calls
- **`mcp-server.js`** — MCP SDK server; connects to `child.js` via named pipe and exposes tools to AI clients
- **`pipeServer.js`** / **`pipeClient.js`** — Named pipe IPC between `child.js` and `mcp-server.js`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Chrome extension not connecting | Ensure `manifest.json` path points to `src/main.js` and the registry key is set. Re-run `install.bat`. |
| Registry write failed | Run `install.bat` as Administrator |
| `defender.json` not found | Open Defender in Chrome and click the extension icon to send credentials |
| Node.js version errors | This project requires **Node.js v20**. Run `node --version` to check |
| MCP tools not appearing | Reload VSCode after updating MCP config. Confirm `node src/mcp-server.js` runs without errors |
| Credentials expired | Re-authenticate via the Chrome extension to refresh the session |

---

## License

MIT
