#!/usr/bin/env node
/**
 * install.js
 * Automatically installs the Defender MCP Server by:
 *  1. Updating manifest.json to use the correct absolute path to src/main.js
 *  2. Writing the Chrome Native Messaging Host registry entry
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_DIR    = __dirname;
const MAIN_JS        = path.join(PROJECT_DIR, 'src', 'main.js');
const MCP_SERVER     = path.join(PROJECT_DIR, 'src', 'mcp-server.js');
const MANIFEST       = path.join(PROJECT_DIR, 'manifest.json');
const EXTENSION_DIR  = path.join(PROJECT_DIR, '..', 'extension');

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
  console.log('\n[1/2] Updating manifest.json...');

  if (!fs.existsSync(MAIN_JS)) {
    fail(`src/main.js not found at: ${MAIN_JS}`);
    fail('Make sure you are running this installer from the project root directory.');
    process.exit(1);
  }

  if (!fs.existsSync(MCP_SERVER)) {
    fail(`src/mcp-server.js not found at: ${MCP_SERVER}`);
    fail('Make sure you are running this installer from the project root directory.');
    process.exit(1);
  }

  const manifest = readJson(MANIFEST);
  const oldPath  = manifest.path;
  manifest.path  = MAIN_JS;
  writeJson(MANIFEST, manifest);

  if (oldPath !== MAIN_JS) {
    log(`manifest.json path updated:`);
    log(`  was: ${oldPath || '(empty)'}`);
    log(`  now: ${MAIN_JS}`);
  } else {
    log('manifest.json path already correct.');
  }
}

// ─── Step 2: Write Windows Registry entry ───────────────────────────────────

function registerNativeHost() {
  console.log('\n[2/2] Registering Chrome Native Messaging Host...');

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

// ─── Main ────────────────────────────────────────────────────────────────────

console.log('============================================================');
console.log(' Defender MCP Server -- Installer');
console.log('============================================================');
console.log(`\n  Project directory : ${PROJECT_DIR}`);
console.log(`  Extension folder  : ${EXTENSION_DIR}`);

if (!fs.existsSync(EXTENSION_DIR)) {
  warn(`Extension folder not found at: ${EXTENSION_DIR}`);
  warn('Expected folder structure:');
  warn('  <root>/');
  warn('    extension/   <- Chrome extension dist');
  warn('    defender-mcp/ <- this installer');
} else {
  log(`Extension folder found: ${EXTENSION_DIR}`);
}

updateManifest();
registerNativeHost();

console.log('\n============================================================');
console.log(' Installation complete!');
console.log('============================================================');
console.log(`
  Next steps:
  1. In Chrome, go to chrome://extensions → Enable Developer Mode →
     Load unpacked → select the 'extension' folder.
  2. Restart Google Chrome for the Native Messaging Host to take effect.
  3. In VSCode, open the Roo or Cline MCP settings and add:

     {
       "mcpServers": {
         "defender-mcp": {
           "command": "node",
           "args": ["${MCP_SERVER.replace(/\\/g, '\\\\')}"]
         }
       }
     }

  4. Reload VSCode for the MCP tools to appear.
`);
