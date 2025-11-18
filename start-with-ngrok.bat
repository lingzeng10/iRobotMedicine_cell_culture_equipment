@echo off
setlocal ENABLEDELAYEDEXPANSION
chcp 65001 >nul
title Work Order Management - ngrok Starter

echo.
echo ========================================
echo 工單管理系統 - ngrok 啟動腳本
echo ========================================
echo.

REM ============================
REM 1) 讀取 ngrok 配置文件
REM ============================
if not exist "ngrok-config.txt" (
    echo [錯誤] 找不到 ngrok-config.txt 配置文件！
    echo.
    echo 請先創建 ngrok-config.txt 文件，格式如下：
    echo FRONTEND_URL=https://您的固定域名.ngrok.dev
    echo BACKEND_URL=https://您的固定域名.ngrok.dev
    echo.
    pause
    exit /b 1
)

REM 讀取配置
for /f "tokens=2 delims==" %%a in ('findstr "FRONTEND_URL" ngrok-config.txt') do set FRONTEND_URL=%%a
for /f "tokens=2 delims==" %%a in ('findstr "BACKEND_URL" ngrok-config.txt') do set BACKEND_URL=%%a

REM 清理可能的引號和空格
set FRONTEND_URL=%FRONTEND_URL:"=%
set BACKEND_URL=%BACKEND_URL:"=%
set FRONTEND_URL=!FRONTEND_URL: =!
set BACKEND_URL=!BACKEND_URL: =!

if not defined FRONTEND_URL (
    echo [錯誤] 無法讀取 FRONTEND_URL 配置
    pause
    exit /b 1
)

if not defined BACKEND_URL (
    echo [錯誤] 無法讀取 BACKEND_URL 配置
    pause
    exit /b 1
)

echo 配置讀取成功：
echo   前端 URL: %FRONTEND_URL%
echo   後端 URL: %BACKEND_URL%
echo.

REM ============================
REM 2) 檢查 ngrok 是否安裝
REM ============================
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] 找不到 ngrok，請先安裝 ngrok！
    echo 下載：https://ngrok.com/download
    echo 安裝後請確保 ngrok 在系統 PATH 中
    echo.
    pause
    exit /b 1
)

echo [✓] ngrok 已安裝
echo.

REM ============================
REM 3) 檢查端口是否被佔用
REM ============================
echo 檢查端口狀態...
netstat -ano | findstr ":3000.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [警告] 端口 3000 已被佔用
    echo 請關閉佔用該端口的程序，或等待 10 秒後繼續...
    timeout /t 10 /nobreak >nul
)

netstat -ano | findstr ":5000.*LISTENING" >nul 2>&1
if %errorlevel% equ 0 (
    echo [警告] 端口 5000 已被佔用
    echo 請關閉佔用該端口的程序，或等待 10 秒後繼續...
    timeout /t 10 /nobreak >nul
)

echo [✓] 端口檢查完成
echo.

REM ============================
REM 4) 啟動後端服務
REM ============================
echo 啟動後端服務（端口 5000）...
start "後端服務" cmd /k "cd /d ""%~dp0server"" && echo ======================================== && echo Backend Service Starting && echo ======================================== && set PORT=5000 && npm run dev"

REM 等待後端就緒
set /a "BACKEND_TRY=0"
set /a "BACKEND_MAX=30"
echo 等待後端就緒...

:wait_backend
set /a BACKEND_TRY+=1
if %BACKEND_TRY% GTR %BACKEND_MAX% (
    echo [警告] 後端在預期時間內未就緒，但將繼續...
    goto :start_frontend
)

powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 -Uri 'http://localhost:5000/health'; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %errorlevel%==0 (
    echo [✓] 後端已就緒
    goto :start_frontend
)

timeout /t 2 >nul
goto :wait_backend

:start_frontend
REM ============================
REM 5) 設置環境變數並啟動前端
REM ============================
set REACT_APP_API_URL=%BACKEND_URL%/api
echo.
echo 設置環境變數：
echo   REACT_APP_API_URL=%REACT_APP_API_URL%
echo.

echo 啟動前端服務（端口 3000）...
start "前端服務" cmd /k "cd /d ""%~dp0client"" && echo ======================================== && echo Frontend Service Starting && echo REACT_APP_API_URL=%REACT_APP_API_URL% && echo ======================================== && set DANGEROUSLY_DISABLE_HOST_CHECK=true && set REACT_APP_API_URL=%REACT_APP_API_URL% && npm start"

REM 等待前端就緒
set /a "FRONTEND_TRY=0"
set /a "FRONTEND_MAX=60"
echo 等待前端就緒（這可能需要 30-60 秒）...

:wait_frontend
set /a FRONTEND_TRY+=1
if %FRONTEND_TRY% GTR %FRONTEND_MAX% (
    echo [警告] 前端在預期時間內未就緒，但將繼續啟動 ngrok...
    goto :start_ngrok
)

REM 檢查端口是否監聽
netstat -ano | findstr ":3000.*LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 >nul
    goto :wait_frontend
)

REM 端口已監聽，檢查 HTTP 響應
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 -Uri 'http://localhost:3000'; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %errorlevel%==0 (
    echo [✓] 前端已就緒
    goto :start_ngrok
)

timeout /t 2 >nul
goto :wait_frontend

:start_ngrok
REM ============================
REM 6) 啟動 ngrok tunnels
REM ============================
echo.
echo ========================================
echo 啟動 ngrok tunnels...
echo ========================================
echo.

REM 提取域名部分（移除 https:// 前綴）
set FRONTEND_DOMAIN=%FRONTEND_URL:https://=%
set BACKEND_DOMAIN=%BACKEND_URL:https://=%

REM 清理可能的尾部斜線
set FRONTEND_DOMAIN=!FRONTEND_DOMAIN:/=!
set BACKEND_DOMAIN=!BACKEND_DOMAIN:/=!

echo 前端 tunnel: localhost:3000 -> %FRONTEND_DOMAIN%
echo 後端 tunnel: localhost:5000 -> %BACKEND_DOMAIN%
echo.

REM 啟動前端 ngrok tunnel
echo 啟動前端 ngrok tunnel...
start "ngrok-前端" cmd /k "cd /d ""%~dp0"" && echo ======================================== && echo ngrok Frontend Tunnel && echo Domain: %FRONTEND_DOMAIN% && echo ======================================== && ngrok http 3000 --domain=%FRONTEND_DOMAIN% --host-header=localhost:3000"

timeout /t 3 >nul

REM 啟動後端 ngrok tunnel
echo 啟動後端 ngrok tunnel...
start "ngrok-後端" cmd /k "cd /d ""%~dp0"" && echo ======================================== && echo ngrok Backend Tunnel && echo Domain: %BACKEND_DOMAIN% && echo ======================================== && ngrok http 5000 --domain=%BACKEND_DOMAIN%"

timeout /t 3 >nul

REM ============================
REM 7) 驗證 ngrok tunnels
REM ============================
echo.
echo 驗證 ngrok tunnels 狀態...
echo.

set /a "NGROK_TRY=0"
set /a "NGROK_MAX=20"

:verify_ngrok
set /a NGROK_TRY+=1
if %NGROK_TRY% GTR %NGROK_MAX% (
    echo [警告] ngrok tunnels 驗證超時
    echo 請檢查 "ngrok-前端" 和 "ngrok-後端" 視窗查看錯誤訊息
    goto :show_summary
)

REM 檢查前端 ngrok URL
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 -Uri '%FRONTEND_URL%'; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
set "FRONTEND_OK=%errorlevel%"

REM 檢查後端 ngrok URL
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 -Uri '%BACKEND_URL%/health'; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
set "BACKEND_OK=%errorlevel%"

if %FRONTEND_OK%==0 if %BACKEND_OK%==0 (
    echo [✓] ngrok tunnels 已成功啟動並驗證
    goto :show_summary
)

echo 等待 ngrok tunnels 啟動... (第 %NGROK_TRY%/%NGROK_MAX% 次)
timeout /t 3 >nul
goto :verify_ngrok

:show_summary
echo.
echo ========================================
echo 🚀 服務啟動完成！
echo ========================================
echo.
echo 🌐 分享給朋友的網址：
echo    %FRONTEND_URL%
echo.
echo 💻 本機訪問：
echo    前端: http://localhost:3000
echo    後端: http://localhost:5000
echo.
echo 🔧 ngrok URLs：
echo    前端: %FRONTEND_URL%
echo    後端: %BACKEND_URL%
echo.
echo 📋 服務狀態：
if %FRONTEND_OK%==0 (
    echo    [✓] 前端 ngrok tunnel: 正常
) else (
    echo    [✗] 前端 ngrok tunnel: 未就緒（請檢查 ngrok-前端 視窗）
)
if %BACKEND_OK%==0 (
    echo    [✓] 後端 ngrok tunnel: 正常
) else (
    echo    [✗] 後端 ngrok tunnel: 未就緒（請檢查 ngrok-後端 視窗）
)
echo.
echo 💡 提示：
echo    1. 如果 ngrok tunnels 未就緒，請檢查：
echo       - ngrok 是否已登入（執行: ngrok config add-authtoken YOUR_TOKEN）
echo       - 域名是否正確配置
echo       - 防火牆是否允許 ngrok 連接
echo    2. 前端頁面會自動在瀏覽器打開
echo    3. 可以直接分享前端 URL 給朋友訪問
echo    4. 所有 API 請求會自動使用後端 ngrok URL
echo.
echo ========================================
echo.

REM 自動打開前端頁面
timeout /t 2 >nul
start "" "%FRONTEND_URL%"

echo 按任意鍵關閉此視窗...
echo (服務會繼續在背景運行)
pause >nul

exit /b 0
