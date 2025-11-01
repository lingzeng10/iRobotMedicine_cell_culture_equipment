@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 啟動工單管理系統（外部分享模式）
echo ========================================
echo.

REM 獲取本機 IP 地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set LOCAL_IP=%%a
    goto :ip_found
)
:ip_found
REM 清理IP地址（移除空格）
set LOCAL_IP=%LOCAL_IP: =%

echo 📍 檢測到本機 IP 地址: %LOCAL_IP%
echo.

REM 設定環境變數
set HOST=0.0.0.0
set PORT=3000
set REACT_APP_API_URL=http://%LOCAL_IP%:5000/api

echo ✅ 環境變數已設定:
echo    HOST=%HOST%
echo    PORT=%PORT%
echo    REACT_APP_API_URL=%REACT_APP_API_URL%
echo.

echo 🔧 啟動後端服務...
start "後端服務" cmd /k "cd /d %~dp0server && npm run dev"

echo 等待後端服務啟動...
timeout /t 5 /nobreak >nul

echo 🌐 啟動前端服務（允許外部訪問）...
start "前端服務" cmd /k "cd /d %~dp0client && set HOST=0.0.0.0 && set REACT_APP_API_URL=%REACT_APP_API_URL% && npm start"

echo.
echo ========================================
echo ✅ 服務啟動完成！
echo ========================================
echo.
echo 📱 分享給朋友的訪問地址：
echo    前端網頁: http://%LOCAL_IP%:3000
echo    後端API: http://%LOCAL_IP%:5000
echo.
echo 💻 本機訪問地址：
echo    前端網頁: http://localhost:3000
echo    後端API: http://localhost:5000
echo.
echo ========================================
echo 📋 分享說明：
echo ========================================
echo 1. 確保你的電腦和朋友的設備在同一網路
echo    或在同一個 WiFi 下
echo.
echo 2. 分享給朋友以下網址：
echo    http://%LOCAL_IP%:3000
echo.
echo 3. 如果無法訪問，請檢查：
echo    - Windows 防火牆是否允許 Node.js 訪問
echo    - 路由器是否允許內網訪問
echo    - 兩個設備是否在同一網路
echo.
echo 4. 防火牆設定方法：
echo    控制台 ^> 系統與安全性 ^> Windows Defender 防火牆
echo    ^> 允許應用程式通過防火牆
echo    勾選 Node.js 的「私人網路」選項
echo.
echo ========================================
echo.
echo 按任意鍵關閉此視窗...
pause >nul

