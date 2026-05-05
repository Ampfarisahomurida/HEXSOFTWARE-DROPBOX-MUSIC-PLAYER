@echo off
REM DROPBOX MUSIC PLAYER - Startup Script for Windows
echo.
echo ==================================
echo   DROPBOX MUSIC PLAYER
echo   Starting Server...
echo ==================================
echo.

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: npm install failed
        pause
        exit /b 1
    )
)

REM Check if .env exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create .env file by copying .env.example
    pause
    exit /b 1
)

echo.
echo ✅ All checks passed!
echo.
echo Starting DROPBOX MUSIC PLAYER server...
echo.
echo 📍 Access the app at: http://localhost:5000
echo 🔗 Health check: http://localhost:5000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

pause
