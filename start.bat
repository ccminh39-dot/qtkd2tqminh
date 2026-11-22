@echo off
title Quang Minh AI Data Analyst Server
echo =======================================================
echo   Dang khoi chay Quang Minh AI Data Analyst...
echo   May chu se mo tai: http://localhost:8765
echo =======================================================
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8765
pause
   