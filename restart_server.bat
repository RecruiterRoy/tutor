@echo off
echo Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul
echo.
echo Waiting 3 seconds...
timeout /t 3 /nobreak >nul
echo.
echo Starting server...
node server.js
pause

