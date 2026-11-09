@echo off
title Spelling Bee Championship 2026 Stage System
echo ==============================================================
echo    Starting Spelling Bee Championship 2026 Presentation System
echo ==============================================================
echo.
python server.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Python was not found in PATH or an error occurred.
    echo Attempting to launch index.html directly in your default browser...
    start "" "index.html"
)
pause
