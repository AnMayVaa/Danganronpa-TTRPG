@echo off
title Danganronpa TRPG Web Minigame Server
cd /d "%~dp0"

echo ===================================================
echo   STARTING DANGANRONPA TRPG WEB MINIGAME SERVER...
echo ===================================================

if not exist node_modules (
    echo [INFO] Installing node dependencies...
    call npm install
)

echo [INFO] Launching server...
start "" http://localhost:3000
node server.js

pause
