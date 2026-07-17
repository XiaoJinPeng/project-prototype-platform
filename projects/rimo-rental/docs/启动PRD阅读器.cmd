@echo off
cd /d "%~dp0"
set PORT=8080
node "prd-viewer-server.js"
pause
