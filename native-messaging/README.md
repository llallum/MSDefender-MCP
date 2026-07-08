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
│   └── src/
│       ├── server/
│       │   ├── main.js       ← Native Messaging Host entry point
│       │   └── child.js      ← Child process (Defender client)
│       ├── client/
│       │   └── mcp-server.js ← MCP Server entry point (stdio transport)
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

> **Prefer a pre-built package?** Instead of cloning and building from source, grab the latest release from the [Releases page](../../releases). Each release ships three assets: the browser extension zip, a `native-messaging` **source-only** zip, and a `native-messaging` **with-runtime** zip that already includes `node_modules` — use the *with-runtime* package if you want to skip `npm install` entirely (handy on machines with restricted or no internet access). Extract the package(s) you need and continue from Step 1 below.

### Step 1 — Load the Chrome Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer Mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `browser-extension/dist/` folder (the built output directory)

> **Fixed Extension ID:** This extension ships with a pinned `"key"` field in its manifest (`browser-extension/manifest.json`), so it always loads with the same Extension ID — **`kfbgidbhjkpipnhihmidgjiclfkiedff`** — no matter where you load it from or how many times you rebuild/reload it. You do **not** need to look up or copy the ID yourself.

### Step 2 — Install the Native Messaging Host

Navigate to the `native-messaging/` folder and run:

```cmd
install.bat
```

This will:
1. Run `npm install` to install Node.js dependencies
2. Update `manifest.json` with the correct absolute path to `src/server/main.js`
3. Set `allowed_origins` in `manifest.json` to `chrome-extension://kfbgidbhjkpipnhihmidgjiclfkiedff/` (the fixed Extension ID)
4. Write the Chrome Native Messaging Host registry key

> **Note:** If the registry step fails, right-click `install.bat` → **Run as administrator**.
>
> **If you re-key the extension:** should you ever regenerate `browser-extension/dist.pem` (and therefore change the `"key"` in `browser-extension/manifest.json`), the Extension ID will change too. In that case, update the `EXTENSION_ID` constant in `native-messaging/install.js` and re-run `install.bat`.

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

## Available MCP Tools (45 tools)

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

### Email Investigation & Remediation

| Tool | Description |
|------|-------------|
| `submit_email_to_analysis` | Submit an email (by NetworkMessageId) to Microsoft as Phishing/Malware/Spam/Not Junk, with False Positive/Negative reason and confidence level |

### Hunting & Investigation

| Tool | Description |
|------|-------------|
| `get_defender_hunting_query_schemas` | List available Advanced Hunting tables |
| `get_defender_table_documentation` | Get schema and examples for a specific table |
| `run_defender_hunting_query` | Run a KQL query in Advanced Hunting |
| `get_azure_datalake_workspaces` | List Azure Data Lake workspaces (databases) available for hunting |
| `get_azure_datalake_db_entities` | List tables available in each Azure Data Lake workspace/database |
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
| `run_av_scan` | Trigger a Quick or Full antivirus scan on a device |
| `get_action_response_status` | Get the live status of response actions (AV scan, isolation, investigation package, etc.) for a device |

### Identity & Users

| Tool | Description |
|------|-------------|
| `search_mdi_identities` | Search Microsoft Defender for Identity users |
| `search_mdi_identity_by_radius_user_id` | Look up identity by Radius user ID |
| `get_mdi_service_accounts_list` | List Active Directory service accounts |
| `msgraph_get_users` | Search Azure AD users with OData filter support |
| `msgraph_get_groups` | Search Azure AD groups |
| `msgraph_get_user_group` | List the Azure AD/Entra groups a user transitively belongs to |
| `msgraph_get_user_ca_policies` | Get Conditional Access policies scoped to a user's security groups |
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
| Chrome extension not connecting | Ensure `manifest.json` path points to `src/server/main.js` and the registry key is set. Re-run `install.bat`. |
| Registry write failed | Run `install.bat` as Administrator |
| `defender.json` not found | Open Defender in Chrome and click the extension icon to send credentials |
| Node.js version errors | This project requires **Node.js v20**. Run `node --version` to check |
| MCP tools not appearing | Reload VSCode after updating MCP config. Confirm `node src/client/mcp-server.js` runs without errors |
| Credentials expired | Re-authenticate via the Chrome extension to refresh the session |

---

## Roadmap

- **License-aware tool loading (`TenantContext`)** — introduce a `TenantContext` module that queries the connected tenant's active Microsoft 365 / Defender licenses (e.g. Defender for Endpoint P1/P2, Defender for Office 365 P1/P2, Defender for Identity, Defender for Cloud Apps) during session initialization. `TOOLS` served via `ListToolsRequestSchema` in `src/client/mcp-server.js` would then be filtered against the detected entitlements before being advertised to the MCP client — so tools that depend on an unlicensed product (e.g. `search_mdi_identities` without Defender for Identity, `sec4ai_get_local_agents` without the relevant add-on) are never exposed or invoked in the first place.
- **Per-tool capability metadata** — tag each entry in `src/core/tools.js` with the product/license it requires (MDE, MDO, MDI, MCAS, AAD, MS Graph, Sec4AI, etc.), so `TenantContext` can do a simple lookup instead of hardcoding per-tool rules.
- **Graceful degradation** — when a tool is filtered out due to licensing, surface a clear, actionable error/explanation instead of a generic API failure if a client attempts to call it directly.
- **Response-action expansion** — extend the Device Management response actions (isolate device, restrict app execution, collect investigation package) beyond the current `run_av_scan` / `get_action_response_status` pair.
- **Automated email remediation** — follow-up actions after `submit_email_to_analysis`, such as bulk sender/domain blocking for a defined time window (already noted as planned in the tool's description).

---

## License

MIT

---

## Changelog

### v1.0.6 *(2026-07-08)*

- feat: `sources/mdo.js` — exported `MDOClass`; added `reportEmailViaNetworkMessageId()` to submit an email (by `networkMessageId`) to Microsoft's Report Submission API as Not Junk / Spam / Phishing / Malware, with False Positive/Negative reason and confidence level; email metadata (recipient, sender, subject) is auto-resolved via `getEmailMetadata()` before submission
- feat: `defender.js` — wired up `mdoClass` (`MDOClass`) alongside the existing `mdeClass`, `msGraph`, and `mdiClass` instances
- feat: `endpoints.js` — added `MDO_SUBMIT_NETWORK_MSG_ID`, `DEVICE_RESPONSE_STATUS`, `DEVICE_AUTOMATED_IR`, `MSGRAPH_USER_GROUPS`, and `MSGRAPH_USER_CA_POLICIES` endpoint constants
- feat: `sources/mde.js` — reworked device response actions: `createResponseAction` replaced by `runAVScan()` which checks `ScanRequest` permission via `getResponsePermissions()` before submitting a Quick/Full AV scan request; added `getActionCenterStatus()` to poll the live status of response actions on a device
- feat: `sources/msgraph.js` — added `getUserGroups()` (transitive group membership) and `getUserConditionalAccessPolicies()` (Conditional Access policies scoped to a user's security-enabled groups)
- feat: `toolHandler.js` / `tools.js` — added new tools `run_av_scan`, `get_action_response_status`, `submit_email_to_analysis`, `msgraph_get_user_group`, and `msgraph_get_user_ca_policies` (45 tools total)
- feat: `sources/enums.js` — new file with shared email-submission enums (`EmailSubmissionReason`, `EmailSubmissionCategory`, `EmailSubmissionType`, `EmailSubmissionObjectType`, `EmailSubmissionConfidenceLevel`)
- fix: `mcp-server.js` — tool call results with `type: "error"` from the child process are now surfaced back to the MCP client as an explicit error response instead of being silently returned as normal content
- fix: `messageHandler.js` — corrected `No handler found for message type` log to reference the resolved `type` variable instead of `msg?.params?.name`; `handleMessage()` now returns the error response object on failure instead of implicitly returning `undefined`
- docs: added Roadmap section outlining planned `TenantContext` license-aware tool filtering
- docs: updated Available MCP Tools tables and tool count (45 tools) in both README files
- chore: bumped `native-messaging` package version to `1.0.6`

### v1.0.5 *(2026-07-06)*

- feat: `browser-extension` — pinned a fixed RSA `"key"` in `manifest.json` so the extension always loads with the same Extension ID (`kfbgidbhjkpipnhihmidgjiclfkiedff`), regardless of the unpacked folder path or how many times it's reloaded/rebuilt
- feat: `native-messaging/manifest.json` — `allowed_origins` now references the fixed Extension ID by default
- feat: `native-messaging/install.js` — installer now automatically writes `allowed_origins` with the fixed Extension ID (no more manual copy/paste step)
- docs: removed the "copy your Extension ID and edit manifest.json" manual step from the Quick Install guide, since the ID is now fixed
- docs: added missing `get_azure_datalake_workspaces` and `get_azure_datalake_db_entities` tools to the Available MCP Tools table
- chore: bumped `browser-extension` manifest and package version to `1.0.3`

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
