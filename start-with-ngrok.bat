@echo off
chcp 65001 >nul
echo ========================================
echo 工單管理系統 - ngrok 啟動腳本
echo ========================================
echo.

REM 讀取 ngrok 配置文件
if not exist "ngrok-config.txt" (
    echo [錯誤] 找不到 ngrok-config.txt 配置文件！
    echo.
    echo 請先創建 ngrok-config.txt 文件，格式如下：
    echo FRONTEND_URL=https://您的固定域名.ngrok.io
    echo BACKEND_URL=https://您的固定域名.ngrok.io
    echo.
    pause
    exit /b 1
)

REM 讀取配置
for /f "tokens=2 delims==" %%a in ('findstr "FRONTEND_URL" ngrok-config.txt') do set FRONTEND_URL=%%a
for /f "tokens=2 delims==" %%a in ('findstr "BACKEND_URL" ngrok-config.txt') do set BACKEND_URL=%%a

REM 清理可能的引號
set FRONTEND_URL=%FRONTEND_URL:"=%
set BACKEND_URL=%BACKEND_URL:"=%

echo 前端 URL: %FRONTEND_URL%
echo 後端 URL: %BACKEND_URL%
echo.

REM 檢查 ngrok 是否安裝
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo [錯誤] 找不到 ngrok，請先安裝 ngrok！
    echo 下載：https://ngrok.com/download
    echo.
    pause
    exit /b 1
)

echo 正在檢查服務狀態...
echo.

REM 檢查端口 3000 和 5000 是否已被佔用
netstat -ano | findstr ":3000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [警告] 端口 3000 已被佔用，請先關閉佔用該端口的程序
)

netstat -ano | findstr ":5000" >nul 2>&1
if %errorlevel% equ 0 (
    echo [警告] 端口 5000 已被佔用，請先關閉佔用該端口的程序
)

REM 設置環境變數
set REACT_APP_API_URL=%BACKEND_URL%/api
echo.
echo 環境變數已設置:
echo   REACT_APP_API_URL=%REACT_APP_API_URL%
echo.

echo.
echo 啟動後端服務...
start "後端服務" cmd /k "cd /d %~dp0server && npm run dev"

echo 等待後端服務啟動...
timeout /t 5 /nobreak >nul

echo.
echo 啟動前端服務...
start "前端服務" cmd /k "cd /d %~dp0client && set HOST=0.0.0.0 && set PORT=3000 && set DANGEROUSLY_DISABLE_HOST_CHECK=true && set REACT_APP_API_URL=%REACT_APP_API_URL% && npm start"

echo 等待前端服務啟動...
echo (這可能需要 15-30 秒，請稍候...)
timeout /t 15 /nobreak >nul

echo.
echo 檢查本地服務狀態...
echo (確認端口 3000 和 5000 是否正常運行)
timeout /t 3 /nobreak >nul

echo.
echo 啟動 ngrok tunnels...
echo.

REM 提取域名部分（移除 https:// 前綴）
set FRONTEND_DOMAIN=%FRONTEND_URL:https://=%
set BACKEND_DOMAIN=%BACKEND_URL:https://=%

REM 使用 ngrok 的固定域名啟動
REM 添加 --host-header 參數來避免 "Invalid Host header" 錯誤
echo 前端 tunnel (端口 3000) -> %FRONTEND_DOMAIN%
start "ngrok-前端" cmd /k "ngrok http 3000 --domain=%FRONTEND_DOMAIN% --host-header=localhost:3000"

timeout /t 2 /nobreak >nul

echo 後端 tunnel (端口 5000) -> %BACKEND_DOMAIN%
start "ngrok-後端" cmd /k "ngrok http 5000 --domain=%BACKEND_DOMAIN%"

echo 等待 ngrok tunnels 啟動...
timeout /t 5 /nobreak >nul

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
echo 💡 提示：
echo    1. 請等待所有服務完全啟動（約 30 秒）
echo    2. 前端頁面會自動在瀏覽器打開
echo    3. 可以直接分享前端 URL 給朋友訪問
echo    4. 所有 API 請求會自動使用後端 ngrok URL
echo.
echo ========================================
echo.
echo 按任意鍵關閉此視窗...
echo (服務會繼續在背景運行)
pause >nul

