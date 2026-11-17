@echo off
setlocal
title StatePulse Launcher
color 0B
cd /d "%~dp0"

echo ==============================================================================
echo       STARTING STATEPULSE (OPTIMIZED STATE SELECTOR TERMINAL)
echo ==============================================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [ERROR] Node.js is not found in PATH!
    echo Please install Node.js from https://nodejs.org/ and try again.
    pause
    exit /b 1
)

:: 2. Automatically install dependencies if node_modules is missing
if not exist "node_modules\" (
    echo [*] First time setup: Installing dependencies...
    echo [*] Please wait a moment...
    call npm.cmd install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully!
    echo.
)

:: 3. Start development server and open browser
echo [*] Launching StatePulse development server...
echo [*] Opening browser at http://localhost:5173/ ...
echo [*] (Press Ctrl+C in this terminal window anytime to stop the server)
echo.

start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5173/"
call npm.cmd run dev

pause
