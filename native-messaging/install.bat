@echo off
echo ============================================================
echo  Defender MCP Server -- Installer
echo ============================================================
echo.

:: Check Node.js is available
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [XX] Node.js not found. Please install Node.js v20+ from https://nodejs.org/
    pause
    exit /b 1
)

:: Skip npm install if node_modules is already bundled (e.g. the
:: "with-runtime" release package ships node_modules pre-installed so
:: this step can be skipped entirely, including on machines with no
:: internet access).
if exist "%~dp0node_modules" (
    echo [OK] node_modules already present - skipping npm install.
) else (
    echo [..] Installing npm dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [!!] npm install failed. This can happen if there is no internet
        echo [!!] connection available. If you downloaded the "with-runtime"
        echo [!!] release package, node_modules should already be bundled and
        echo [!!] this step is not required.
        echo [!!] Continuing with installation anyway...
        echo.
    )
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
