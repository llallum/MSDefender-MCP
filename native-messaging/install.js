#!/usr/bin/env node
/**
 * install.js
 * Automatically installs the Defender MCP Server by:
 *  1. Updating manifest.json to use the correct absolute path (main.js)
 *     and the fixed Chrome extension ID (allowed_origins)
 *  2. Writing the Chrome Native Messaging Host registry entry
 *  3. Configuring Claude Desktop MCP config (claude_desktop_config.json)
 *  4. Printing the MCP server JSON config block for other MCP clients
 *     (Zoo Code / Roo, Cline, etc.) to copy/paste manually
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_DIR = __dirname;
const MAIN_JS    = path.join(PROJECT_DIR, 'src', 'server', 'main.js');
const MANIFEST   = path.join(PROJECT_DIR, 'manifest.json');
const MCP_SERVER = path.join(PROJECT_DIR, 'src', 'client', 'mcp-server.js');

// The Chrome extension ID is fixed via the "key" field in
// browser-extension/manifest.json, so it no longer changes between
// unpacked loads/rebuilds. Keep this in sync with that key.
const EXTENSION_ID = 'kfbgidbhjkpipnhihmidgjiclfkiedff';

const CLAUDE_CONFIG_DIR  = path.join(os.homedir(), 'AppData', 'Roaming', 'Claude');
const CLAUDE_CONFIG_FILE = path.join(CLAUDE_CONFIG_DIR, 'claude_desktop_config.json');

const REG_KEY = 'HKCU\\SOFTWARE\\Google\\Chrome\\NativeMessagingHosts\\com.defender.mcp_server';

// ─── Helpers ────────────────────────────────────────────────────────────────

function log(msg)  { console.log(`  [OK]  ${msg}`); }
function warn(msg) { console.warn(`  [!!]  ${msg}`); }
function fail(msg) { console.error(`  [XX]  ${msg}`); }

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

// ─── Step 1: Update manifest.json ───────────────────────────────────────────

function updateManifest() {
  console.log('\n[1/4] Updating manifest.json...');

  if (!fs.existsSync(MAIN_JS)) {
    fail(`main.js not found at: ${MAIN_JS}`);
    process.exit(1);
  }

  const manifest = readJson(MANIFEST);
  const oldPath  = manifest.path;
  manifest.path  = MAIN_JS;

  const expectedOrigin = `chrome-extension://${EXTENSION_ID}/`;
  const oldOrigins = manifest.allowed_origins || [];
  manifest.allowed_origins = [expectedOrigin];

  writeJson(MANIFEST, manifest);

  if (oldPath !== MAIN_JS) {
    log(`manifest.json path updated:`);
    log(`  was: ${oldPath}`);
    log(`  now: ${MAIN_JS}`);
  } else {
    log('manifest.json path already correct.');
  }

  if (oldOrigins.length !== 1 || oldOrigins[0] !== expectedOrigin) {
    log(`manifest.json allowed_origins updated to fixed extension ID:`);
    log(`  now: ${expectedOrigin}`);
  } else {
    log('manifest.json allowed_origins already correct.');
  }
}

// ─── Step 2: Write Windows Registry entry ───────────────────────────────────

function registerNativeHost() {
  console.log('\n[2/4] Registering Chrome Native Messaging Host...');

  try {
    execSync(
      `REG ADD "${REG_KEY}" /ve /t REG_SZ /d "${MANIFEST}" /f`,
      { stdio: 'pipe' }
    );
    log(`Registry key written: ${REG_KEY}`);
    log(`Value: ${MANIFEST}`);
  } catch (e) {
    fail('Failed to write registry entry.');
    fail(e.message);
    warn('You may need to run this script as Administrator, or add the key manually:');
    warn(`  Key:   ${REG_KEY}`);
    warn(`  Value: ${MANIFEST}`);
  }
}

// ─── Step 3: Configure Claude Desktop ───────────────────────────────────────

function configureClaudeDesktop() {
  console.log('\n[3/4] Configuring Claude Desktop MCP...');

  // Ensure the Claude config directory exists
  if (!fs.existsSync(CLAUDE_CONFIG_DIR)) {
    fs.mkdirSync(CLAUDE_CONFIG_DIR, { recursive: true });
    log(`Created directory: ${CLAUDE_CONFIG_DIR}`);
  }

  // Read existing config or start fresh
  let config = {};
  if (fs.existsSync(CLAUDE_CONFIG_FILE)) {
    try {
      config = readJson(CLAUDE_CONFIG_FILE);
      log('Existing claude_desktop_config.json found — merging.');
    } catch {
      warn('Existing claude_desktop_config.json is invalid JSON — overwriting.');
      config = {};
    }
  } else {
    log('No existing Claude Desktop config found — creating new one.');
  }

  if (!config.mcpServers) config.mcpServers = {};

  config.mcpServers['defender-mcp'] = {
    command: 'node',
    args: [MCP_SERVER]   // points to src/client/mcp-server.js
  };

  writeJson(CLAUDE_CONFIG_FILE, config);
  log(`Claude Desktop config saved: ${CLAUDE_CONFIG_FILE}`);
}

// ─── Step 4: Print MCP config for other clients (Roo/Cline/etc.) ────────────

function printMcpConfig() {
  console.log('\n[4/4] MCP server configuration for other MCP clients...');

  const mcpConfigBlock = {
    mcpServers: {
      'defender-mcp': {
        command: 'node',
        args: [MCP_SERVER]
      }
    }
  };

  const jsonOutput = JSON.stringify(mcpConfigBlock, null, 2);

  console.log(`
  For Zoo Code (Roo) or Cline in VSCode, or any other MCP-compatible
  client, copy the JSON block below into your MCP settings file:

------------------------------------------------------------
${jsonOutput}
------------------------------------------------------------
`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log('============================================================');
console.log(' Defender MCP Server -- Installer');
console.log('============================================================');
console.log(`\n  Project directory: ${PROJECT_DIR}`);

updateManifest();
registerNativeHost();
configureClaudeDesktop();
printMcpConfig();

console.log('============================================================');
console.log(' Installation complete!');
console.log('============================================================');
console.log(`
  Next steps:
  1. Restart Google Chrome for the Native Messaging Host to take effect.
  2. Restart Claude Desktop for the MCP server to appear (config was
     applied automatically).
  3. For Zoo Code (Roo), Cline, or other MCP clients, copy the JSON
     config block printed above into your MCP settings file.
`);
