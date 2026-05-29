@echo off
title RCCG S&P Parish Local Server
echo ====================================================================
echo   RCCG S&P Parish - Local Web Server
echo ====================================================================
echo   YouTube's security policy requires a valid Web Origin (http://localhost)
echo   to embed videos, which is why opening files directly via file:///
echo   displays "Error 153: Video player configuration error."
echo.
echo   This script starts a lightweight local server to preview the site.
echo ====================================================================
echo.

:: Open the browser first
echo Opening browser to http://localhost:8000/sermons.html...
start "" "http://localhost:8000/sermons.html"

:: Try running Python 3 server
python -m http.server 8000
if %ERRORLEVEL% neq 0 (
    :: Try running Python launcher
    py -m http.server 8000
)

if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Python was not found on your system.
    echo.
    echo To resolve Error 153 during development, either:
    echo 1. Install Python and run this script again.
    echo 2. If using VS Code, right-click sermons.html and select "Open with Live Server".
    echo.
    pause
)
