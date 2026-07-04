#!/usr/bin/env node
/**
 * install.js
 * Automatically installs the Defender MCP Server by:
 *  1. Updating manifest.json to use the correct absolute path (main.js)
 *  2. Writing the Chrome Native Messaging Host registry entry
 *  3. Configuring Claude Desktop MCP config (claude_desktop_config.json)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_DIR = __dirname;
const MAIN_JS    = path.join(PROJECT_DIR, 'src', 'main.js');
const MANIFEST   = path.join(PROJECT_DIR, 'manifest.json');
const MCP_SERVER = path.join(PROJECT_DIR, 'src', 'mcp-server.js');

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
  console.log('\n[1/3] Updating manifest.json...');

  if (!fs.existsSync(MAIN_JS)) {
    fail(`main.js not found at: ${MAIN_JS}`);
    process.exit(1);
  }

  const manifest = readJson(MANIFEST);
  const oldPath  = manifest.path;
  manifest.path  = MAIN_JS;
  writeJson(MANIFEST, manifest);

  if (oldPath !== MAIN_JS) {
    log(`manifest.json path updated:`);
    log(`  was: ${oldPath}`);
    log(`  now: ${MAIN_JS}`);
  } else {
    log('manifest.json path already correct.');
  }
}

// ─── Step 2: Write Windows Registry entry ───────────────────────────────────

function registerNativeHost() {
  console.log('\n[2/3] Registering Chrome Native Messaging Host...');

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
  console.log('\n[3/3] Configuring Claude Desktop MCP...');

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
    args: [MCP_SERVER]   // points to src/mcp-server.js
  };

  writeJson(CLAUDE_CONFIG_FILE, config);
  log(`Claude Desktop config saved: ${CLAUDE_CONFIG_FILE}`);
  log(`MCP entry: { command: "node", args: ["${MCP_SERVER}"] }`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

console.log('============================================================');
console.log(' Defender MCP Server -- Installer');
console.log('============================================================');
console.log(`\n  Project directory: ${PROJECT_DIR}`);

updateManifest();
registerNativeHost();
configureClaudeDesktop();

console.log('\n============================================================');
console.log(' Installation complete!');
console.log('============================================================');
console.log(`
  Next steps:
  1. Run 'npm install' if you haven't already.
  2. Restart Google Chrome for the Native Messaging Host to take effect.
  3. Restart Claude Desktop for the MCP server to appear.
`);
