# Browser Session Cookie Utility for Defender — Installation Guide

This guide covers how to install the Chrome extension and configure the Windows Registry for Native Messaging so the MCP server can communicate with the extension.

---

## Prerequisites

- **Node.js** >= 14.0.0
- **npm** >= 6.0.0
- **Google Chrome** (latest)
- **Windows** (Registry setup is Windows-specific)
- The MCP native host executable (the server-side binary that the extension talks to via `com.defender.mcp_server`)

---

## Step 1 — Build the Extension

```bash
# Install dependencies
npm install

# Build the extension
npm run build
```

This runs Webpack and outputs the compiled extension files into the `dist/` folder (or your configured output directory).

---

## Step 2 — Load the Extension in Chrome

1. Open Chrome and navigate to: `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **"Load unpacked"**
4. Select the **`dist/`** folder (the build output directory)
5. The extension **"Browser Session Cookie Utility for Defender Only"** will appear in the list

### Your Extension ID Is Fixed

This extension ships with a pinned RSA `"key"` field in [`manifest.json`](../manifest.json), so Chrome always assigns it the **same Extension ID**, no matter which path you load it from or how many times you rebuild/reload it:

```
kfbgidbhjkpipnhihmidgjiclfkiedff
```

You do **not** need to look this up or copy/paste it anywhere — `native-messaging/manifest.json` and the installer (`native-messaging/install.js`) already reference this fixed ID.

You can still verify it any time via:

```javascript
chrome.runtime.id
```

or by clicking **"Details"** on the extension card in `chrome://extensions/` — the URL will show:
```
chrome://extensions/?id=kfbgidbhjkpipnhihmidgjiclfkiedff
```

---

## Step 3 — Re-Keying the Extension (Only If Needed)

You normally **do not need this step** — the extension already has a fixed ID via the committed `"key"` in `manifest.json`, backed by the private key at [`dist.pem`](../dist.pem).

Only follow this if you intentionally want to **rotate the signing key** (e.g. the private key was compromised):

1. Go to `chrome://extensions/`
2. Click **"Pack extension"**
3. Set the **Extension root directory** to your `dist/` folder
4. Leave the **Private key file** blank to generate a brand-new key pair
5. Click **"Pack Extension"** — Chrome generates:
   - `dist.crx` — the packed extension
   - `dist.pem` — your new private key (keep this safe! back it up, do not commit it to source control)
6. Extract the public key from the new `dist.pem` (base64, SPKI/DER format) and set it as the `"key"` field in [`manifest.json`](../manifest.json):

```json
{
  "manifest_version": 3,
  "name": "Browser Session Cookie Utility for Defender Only",
  "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...(your new key here)...",
  ...
}
```

7. Rebuild (`npm run build`) and reload the extension — Chrome will now assign a **new, different** Extension ID
8. Update the `EXTENSION_ID` constant in `native-messaging/install.js` and `allowed_origins` in `native-messaging/manifest.json` to match the new ID, then re-run `install.bat`

---

## Step 4 — Windows Registry Setup for Native Messaging

The extension connects to the native MCP server using the port name **`com.defender.mcp_server`** (defined in [`src/background/native-messaging.ts`](../src/background/native-messaging.ts)).

Chrome requires a **Native Messaging Host manifest** registered in the Windows Registry.

### 4a — Create the Native Host Manifest JSON

The repository already ships a ready-to-use manifest at [`native-messaging/manifest.json`](../../native-messaging/manifest.json), pre-configured with the fixed Extension ID:

```json
{
  "name": "com.defender.mcp_server",
  "description": "MCP Server Native Messaging Host",
  "path": "",
  "type": "stdio",
  "allowed_origins": [
    "chrome-extension://kfbgidbhjkpipnhihmidgjiclfkiedff/"
  ]
}
```

Running `native-messaging/install.bat` automatically fills in the `path` field with the absolute path to `src/server/main.js` — no manual editing required. If you are configuring this by hand instead, replace the `path` value with the actual path to your MCP server executable.

### 4b — Register in Windows Registry

Open **Command Prompt as Administrator** and run:

```cmd
REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.defender.mcp_server" /ve /t REG_SZ /d "C:\mcp-server\com.defender.mcp_server.json" /f
```

Or manually via **Registry Editor (`regedit`)**:

| Field | Value |
|---|---|
| **Key path** | `HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.defender.mcp_server` |
| **Value name** | *(Default)* |
| **Value type** | `REG_SZ` |
| **Value data** | `C:\mcp-server\com.defender.mcp_server.json` |

> **Note:** Use `HKEY_LOCAL_MACHINE` instead of `HKEY_CURRENT_USER` if you want the registration to apply to **all users** on the machine (requires admin rights).

### 4c — Verify the Registry Entry

```cmd
REG QUERY "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.defender.mcp_server"
```

Expected output:
```
HKEY_CURRENT_USER\Software\Google\Chrome\NativeMessagingHosts\com.defender.mcp_server
    (Default)    REG_SZ    C:\mcp-server\com.defender.mcp_server.json
```

---

## Step 5 — Start the MCP Server

Start your native MCP server executable before using the extension:

```cmd
C:\mcp-server\defender-mcp-server.exe
```

The extension will automatically attempt to connect to the native host when you click **"Start Server"** in the extension UI.

---

## Step 6 — Verify the Connection

1. Open Chrome and navigate to `https://security.microsoft.com`
2. Click the extension icon or open the side panel
3. Click **"Start Server"**
4. The extension background script ([`src/background/native-messaging.ts`](../src/background/native-messaging.ts)) will:
   - Connect to `com.defender.mcp_server` via `chrome.runtime.connectNative()`
   - Send a **ping** every 10 seconds
   - Flush **session data** (cookies + request headers) every 15 seconds
   - Report **health status** every 5 seconds

If the connection is successful, the status indicator in the UI will show as connected.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Extension ID changes after reload | This should no longer happen — the `"key"` field in `manifest.json` fixes the ID to `kfbgidbhjkpipnhihmidgjiclfkiedff`. If it still changes, confirm the `"key"` field is present in your loaded `dist/manifest.json` |
| Native host not found | Verify the Registry path and JSON file path are correct |
| `allowed_origins` mismatch | Ensure `native-messaging/manifest.json` references `chrome-extension://kfbgidbhjkpipnhihmidgjiclfkiedff/` exactly (re-run `install.bat` to fix automatically) |
| Connection drops immediately | Check that the MCP server executable is running and the path in the JSON is correct |
| Cookies not captured | Make sure you are logged into `https://security.microsoft.com` before starting the server |

---

## File Reference

| File | Purpose |
|---|---|
| [`manifest.json`](../manifest.json) | Extension manifest — permissions, native messaging declaration |
| [`src/background/native-messaging.ts`](../src/background/native-messaging.ts) | Handles `connectNative()`, ping/pong, session data flush |
| [`src/background/sentinel-apiproxy.ts`](../src/background/sentinel-apiproxy.ts) | Intercepts `security.microsoft.com` requests, captures cookies + headers |
| [`src/background/index.ts`](../src/background/index.ts) | Background service worker entry point |
| `com.defender.mcp_server.json` | Native Messaging Host manifest (you create this) |
