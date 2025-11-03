@echo off
echo 正在啟動工單管理系統...
echo.

REM 讀取自訂 IP 設定檔（如果存在）
if exist "ip-config.txt" (
    for /f "tokens=*" %%a in (ip-config.txt) do set LOCAL_IP=%%a
    echo 使用配置文件中的 IP: %LOCAL_IP%
) else (
    REM 如果沒有設定檔，自動偵測 IP 地址
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
        set LOCAL_IP=%%a
        goto :ip_found
    )
    :ip_found
    REM 清理IP地址（移除空格）
    set LOCAL_IP=%LOCAL_IP: =%
    echo 自動偵測到 IP: %LOCAL_IP%
)
echo.

REM 設定環境變數
set HOST=0.0.0.0
set PORT=3000
set REACT_APP_API_URL=http://%LOCAL_IP%:5000/api

echo 環境變數已設定:
echo HOST=%HOST%
echo PORT=%PORT%
echo.

echo 啟動前端服務...
start "前端服務" cmd /k "cd client && set HOST=0.0.0.0 && set REACT_APP_API_URL=%REACT_APP_API_URL% && npm start"

echo 等待前端服務啟動...
timeout /t 5 /nobreak >nul

echo 啟動後端服務...
start "後端服務" cmd /k "cd server && npm run dev"

echo.
echo ========================================
echo 🚀 服務啟動完成！
echo ========================================
echo.
echo 📱 手機/平板訪問地址:
echo    http://%LOCAL_IP%:3000
echo.
echo 💻 電腦訪問地址:
echo    http://localhost:3000
echo    http://%LOCAL_IP%:3000
echo.
echo 🔧 後端API地址:
echo    http://%LOCAL_IP%:5000
echo.
echo ========================================
echo 📋 使用說明:
echo 1. 確保手機和電腦在同一WiFi網路
echo 2. 在手機瀏覽器輸入: http://%LOCAL_IP%:3000
echo 3. 如果無法訪問，請檢查防火牆設定
echo ========================================
echo.
echo 按任意鍵關閉此視窗...
pause >nul
