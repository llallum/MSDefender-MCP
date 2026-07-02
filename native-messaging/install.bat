@echo off
echo ============================================================
echo  Defender MCP Server -- Installer
echo ============================================================
echo.

:: Check Node.js is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [XX] Node.js not found. Please install Node.js v18+ from https://nodejs.org/
    pause
    exit /b 1
)

:: Change to the directory containing this script so npm finds package.json
cd /d "%~dp0"

:: Run npm install first
echo [..] Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [XX] npm install failed.
    pause
    exit /b 1
)

:: Run the installer script
echo.
echo [..] Running installer...
node "%~dp0install.js"

if %errorlevel% neq 0 (
    echo.
    echo [XX] Installation encountered errors. See above for details.
    pause
    exit /b 1
)

echo.
pause
