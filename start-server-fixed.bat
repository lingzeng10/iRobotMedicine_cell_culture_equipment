@echo off
chcp 65001 >nul
echo Starting Work Order Management System...
echo.

REM Auto-detect IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set LOCAL_IP=%%a
    goto :ip_found
)
:ip_found
REM Clean IP address (remove spaces)
set LOCAL_IP=%LOCAL_IP: =%

echo Detected IP address: %LOCAL_IP%
echo.

REM Set environment variables
set HOST=0.0.0.0
set PORT=3000
set REACT_APP_API_URL=http://%LOCAL_IP%:5000/api

echo Environment variables set:
echo HOST=%HOST%
echo PORT=%PORT%
echo REACT_APP_API_URL=%REACT_APP_API_URL%
echo.

echo Starting backend service...
start "Backend Service" cmd /k "cd /d %~dp0server && npm run dev"

echo Waiting for backend service to start...
timeout /t 5 /nobreak >nul

echo Starting frontend service...
start "Frontend Service" cmd /k "cd /d %~dp0client && set HOST=0.0.0.0 && set REACT_APP_API_URL=%REACT_APP_API_URL% && npm start"

echo.
echo ========================================
echo Service startup completed!
echo ========================================
echo.
echo Mobile/Tablet access:
echo    http://%LOCAL_IP%:3000
echo.
echo Computer access:
echo    http://localhost:3000
echo    http://%LOCAL_IP%:3000
echo.
echo Backend API:
echo    http://%LOCAL_IP%:5000
echo.
echo ========================================
echo Usage instructions:
echo 1. Ensure mobile and computer are on same WiFi
echo 2. Enter in mobile browser: http://%LOCAL_IP%:3000
echo 3. If cannot access, check firewall settings
echo ========================================
echo.
echo Press any key to close this window...
pause >nul
