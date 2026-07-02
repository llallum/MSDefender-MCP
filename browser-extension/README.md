# Defender MCP — Browser Extension

This Chrome extension captures your active **Microsoft Defender XDR** session and forwards the authentication headers to the native messaging host (`native-messaging/`), enabling the MCP server to make authenticated API calls on your behalf.

---

## How It Works

1. You log in to [Microsoft Defender XDR](https://security.microsoft.com) in Chrome as you normally would
2. The extension intercepts your session cookies and request headers
3. It sends them to the native messaging host via Chrome's Native Messaging API
4. The MCP server uses those headers to call Defender APIs — **no API token or app registration needed**

---

## Installation

### Prerequisites

- Google Chrome browser
- The `native-messaging/` host must be installed first (see [native-messaging/README.md](../native-messaging/README.md) or run `install.bat`)

### Load the Extension

1. Open Chrome and navigate to `chrome://extensions`
2. Enable **Developer Mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select this `browser-extension/` folder
5. The extension icon will appear in your Chrome toolbar

---

## Usage

1. Navigate to [https://security.microsoft.com](https://security.microsoft.com) and sign in
2. Click the **Defender MCP** extension icon in the toolbar
3. The extension will capture your session and send it to the native host
4. You should see a confirmation that the session was sent successfully
5. The MCP tools in VSCode will now be authenticated and ready to use

---

## Session Refresh

Microsoft Defender session tokens expire periodically. When your session expires:

1. Refresh the Defender page in Chrome (or re-navigate to `security.microsoft.com`)
2. Click the extension icon again to re-send the updated session headers
3. The native host will automatically use the new session

---

## Security Notes

- Session headers are sent **only** to the locally installed native messaging host — they never leave your machine
- The native host stores credentials in `src/defender.json` on your local filesystem
- No credentials are transmitted to any external server
- The extension only activates on `https://security.microsoft.com/*`

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Extension icon is greyed out | Make sure you are on `https://security.microsoft.com` |
| "Native host not found" error | Run `install.bat` in the `native-messaging/` folder |
| Session not being captured | Try refreshing the Defender page and clicking the icon again |
| MCP tools return auth errors | Your session may have expired — click the extension icon to refresh |

---

## Native Messaging Host ID

The extension communicates with the native host using the ID:

```
com.defender.mcp_server
```

This must match the `name` field in `native-messaging/manifest.json`.
