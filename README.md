# MSDefender-MCP

A **Model Context Protocol (MCP) server** that integrates with **Microsoft Defender XDR** and **Microsoft Graph** APIs — **no API token required**. Authentication is handled via a Chrome browser extension that captures your active Defender session cookies.

> **Compatible with:** [Zoo Code (Roo)](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline) · [Cline](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev) · [Claude Desktop](https://claude.ai/download) · [Claude.ai Console](https://console.anthropic.com) · Any MCP-compatible AI client

---

## How It Works

```
+------------------+   Native Messaging   +----------------------------------------+   +------------------------------+
|  Chrome Browser  |  <================>  |  Your Machine (native-messaging/)      |   |  Microsoft Cloud             |
|                  |                      |                                        |   |                              |
|  browser-        |                      |  src/server/main.js  (entry point)     |   |  security.microsoft.com      |
|  extension/      |                      |  src/server/child.js (Defender client) +-->|  (Defender XDR API)          |
|                  |                      |  src/client/mcp-server.js (MCP server) +-->|  graph.microsoft.com         |
|  Captures your   |                      |                                        |   |  (Microsoft Graph API)       |
|  Defender session|                      |                                        +-->|  api.securitycenter.windows  |
|  cookies & sends |                      +--------------------+-------------------+   |  .com (MDE API)              |
|  them to the     |                                           |                       +------------------------------+
|  native host     |                                           | MCP Protocol (stdio)
+------------------+                                           v
                                               +----------------------------------+
                                               |  Any MCP Client                  |
                                               |  - Zoo Code (Roo) in VSCode      |
                                               |  - Cline in VSCode               |
                                               |  - Claude Desktop                |
                                               |  - Claude.ai Console             |
                                               +----------------------------------+
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
│   └── src/
│       ├── server/
│       │   ├── main.js       ← Native Messaging Host entry point
│       │   └── child.js      ← Child process (Defender client)
│       ├── client/
│       │   ├── mcp-server.js ← MCP Server entry point (stdio transport)
│       │   ├── test.js       ← Test script for child process / tool invocations
│       │   └── debug-client.js ← MCP JSON-RPC debug client
│       ├── core/
│       │   ├── defender.js       ← Defender class (all API methods)
│       │   ├── endpoints.js      ← API endpoint URL constants
│       │   ├── tools.js          ← MCP tool definitions
│       │   ├── toolHandler.js    ← Tool call → Defender method mapping
│       │   ├── alertTypes.js     ← Alert type constants
│       │   └── sources/
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
│           ├── qParser.js          ← Query parameter parsing utility
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
                ├── App.tsx           ← Main React UI component
                └── PingIndicator.tsx ← Animated ping/pong status indicator
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
4. Select the `browser-extension/dist/` folder (the built output directory)
5. The extension **"Browser Session Cookie Utility for Defender Only"** will appear in the list

### Step 2 — Get Your Extension ID and Update the Native Manifest

After loading the extension, Chrome assigns it a unique **Extension ID** (shown under the extension name on the extensions page).

1. Copy your **Extension ID** (e.g. `nlgipginfcfjbkeilighikmiekfhfkpf`)
2. Open `native-messaging/manifest.json` and update the `allowed_origins` field:

```json
{
  "name": "com.defender.mcp_server",
  "description": "MCP Server Native Messaging Host",
  "path": "",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://<YOUR_EXTENSION_ID>/"
  ]
}
```

Replace `<YOUR_EXTENSION_ID>` with the actual ID from Step 1.

> **Why?** Chrome uses this ID to verify that only your specific extension instance can communicate with the native host. If the ID does not match, the connection will be refused.

### Step 3 — Install the Native Messaging Host

Navigate to the `native-messaging/` folder and run:

```cmd
install.bat
```

This will:
1. Run `npm install` to install Node.js dependencies
2. Update `manifest.json` with the correct absolute path to `src/server/main.js`
3. Write the Chrome Native Messaging Host registry key pointing to the updated `manifest.json`

> **Note:** If the registry step fails, right-click `install.bat` → **Run as administrator**.

### Step 4 — Configure Your MCP Client

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

### Step 5 — Authenticate

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
| `run_azure_datalake_hunting_query` | Run a KQL query against Azure Data Lake (ARG/Entra tables) |

### Device Timeline & Forensics

| Tool | Description |
|------|-------------|
| `search_device_timeline` | Search device timeline events with filters |
| `download_raw_device_timeline` | Download full device timeline into local storage for DuckDB querying |
| `init_duckdb` | Initialize DuckDB for local timeline analysis |
| `create_duckdb_table` | Create a DuckDB table from downloaded timeline data |
| `get_raw_table_summary` | Get summary/schema of a DuckDB timeline table |
| `run_sql_query` | Run SQL queries against local DuckDB timeline data |
| `mark_device_timeline_event` | Mark/unmark a timeline event as notable |

### Device Management

| Tool | Description |
|------|-------------|
| `get_device_info_by_senseMachineId` | Look up a device by SenseMachineId |
| `get_associated_devices_by_incident_id` | Get all devices associated with an incident |
| `get_device_inventory_by_category` | Get device inventory by category (Endpoint, IoT, OT, etc.) |
| `get_device_software_inventory` | Get software inventory for a device |
| `get_device_missing_kbs` | Get missing security updates (KBs) for a device |
| `get_device_response_permissions` | Get response action permissions for a device |

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
| **MDE** (Microsoft Defender for Endpoint) | `da`, `ed` | `sources/mde.js` |
| **MDI** (Microsoft Defender for Identity) | `aa` | `sources/mdi.js` |
| **MDO** (Microsoft Defender for Office 365) | `fa` | `sources/mdo.js` |
| **MCAS** (Microsoft Defender for Cloud Apps) | `ca`, `ma` | `sources/mcas.js` |
| **AAD** (Azure AD Identity Protection) | `ib` | `sources/aad.js` |

---

## Architecture

The server uses a **named pipe IPC** architecture:

```
  Chrome Extension
        |
        |  Native Messaging (session headers)
        v
    main.js  --fork-->  child.js  <---- defender.json (session cache)
                            |                |
                            |                | HTTPS requests (cookie-based auth)
                            |                v
                            |     +---------------------------------------+
                            |     |       Microsoft Cloud APIs            |
                            |     |  - security.microsoft.com (XDR)      |
                            |     |  - graph.microsoft.com (Graph)       |
                            |     |  - api.securitycenter.windows.com    |
                            |     +---------------------------------------+
                            |
                      pipeServer.js  (named pipe: \\.\pipe\defender-mcp)
                            |
                      pipeClient.js
                            |
                      mcp-server.js  <---- VSCode / AI Client
                                                |
                                                |  tool call
                                                v
                                       AI sends request --> child.js
                                       calls Defender API --> returns
                                       result to AI client
```

- **`main.js`** — Native Messaging Host; receives session headers from Chrome extension and forwards messages to `child.js`
- **`child.js`** — Spawned child process; holds the Defender session and handles all API calls
- **`mcp-server.js`** — MCP SDK server; connects to `child.js` via named pipe and exposes tools to AI clients
- **`pipeServer.js`** / **`pipeClient.js`** — Named pipe IPC between `child.js` and `mcp-server.js`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Chrome extension not connecting | Ensure `manifest.json` path points to `src/server/main.js` and the registry key is set. Re-run `install.bat`. |
| Registry write failed | Run `install.bat` as Administrator |
| `defender.json` not found | Open Defender in Chrome and click the extension icon to send credentials |
| Node.js version errors | This project requires **Node.js v20**. Run `node --version` to check |
| MCP tools not appearing | Reload VSCode after updating MCP config. Confirm `node src/client/mcp-server.js` runs without errors |
| Credentials expired | Re-authenticate via the Chrome extension to refresh the session |

---

## License

MIT

---

## Changelog

### v1.0.4 *(2026-07-04)*

- refactor: renamed `core/alertAnalyzer/` folder to `core/sources/` for clarity
- feat: added `src/utils/qParser.js` — query parameter/filter string parser utility
- feat: `endpoints.js` — added `DEVICE_MISSING_KBS`, `DEVICE_RESPONSE_PERMISSIONS`, and `DEVICE_RESPONSE_ACTIONS` endpoint constants
- feat: `toolHandler.js` / `tools.js` — renamed `get_software_inventory_by_device_id` to `get_device_software_inventory`; added new tools `get_device_missing_kbs` and `get_device_response_permissions`
- fix: `run_azure_datalake_hunting_query` handler now correctly passes `workspace` parameter instead of an unused `maxRecordCount`
- fix: `get_device_info_by_senseMachineId` handler now references `args.senseMachineId` correctly (was `args.machineId`)
- fix: `defender.js` — `getIncidentAuditHistory` pagination now compares against the actual `pageSize` instead of a hardcoded `100`
- fix: `duckdbClient.js` — removed noisy `console.log` of DuckDB version/config on every instantiation
- chore: removed unused `src/utils/browserMessages.js`
- chore: removed `run.bat` launcher wrapper (no longer required)

### v1.0.3 *(2026-07-02)*

- fix: `native-messaging/src/utils/httpClient.js` — fixed double-consume bug in `post()` error handler where `res.json()` was called twice on the same `Response` body stream, causing the second call to throw and `errorBody` to always be `null`; error response body is now correctly returned

### v1.0.2 *(2026-07-02)*

- feat: `browser-extension` — added `PingIndicator` component with animated ping/pong status indicator
- feat: `browser-extension/App.tsx` — pong message listener now updates UI via `PingIndicator` (green pulse when pong received, resets after 5s)
- feat: `browser-extension/native-messaging.ts` — pong handler now forwards pong events to the React UI via `chrome.runtime.sendMessage`
- chore: bumped `browser-extension` manifest and package version to `1.0.2`

### v1.0.1 *(2026-07-02)*

- fix: `child.js` — added `NODE_TLS_REJECT_UNAUTHORIZED=0` to bypass TLS certificate validation for HTTPS requests
- fix: `child.js` — corrected `DEFENDER_JSON` path resolution (removed erroneous parent directory traversal)
- feat: added `src/client/test.js` — test script for child process pipe communication and tool invocations
- feat: added `src/client/debug-client.js` — MCP JSON-RPC debug client for local server testing
- security: all PII removed from test scripts (emails, IDs, hostnames replaced with placeholders)

### v1.0.0 — Initial Release *(2026-07-02)*

- Initial public release
- Native messaging host MCP server with 40+ Microsoft Defender XDR tools
- Chrome browser extension for session capture (TypeScript + React, Manifest V3)
- Named pipe IPC architecture (`server/main.js` ↔ `server/child.js` ↔ `client/mcp-server.js`)
- DuckDB integration for local device timeline analysis
- Alert source auto-detection (MDE, MDI, MDO, MCAS, AAD)
- Compatible with Zoo Code (Roo), Cline, Claude Desktop, and Claude.ai Console
- `src/` layout mirrors source: `server/`, `client/`, `core/`, `utils/` subfolders
