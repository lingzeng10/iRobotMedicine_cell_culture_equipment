@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 啟動工單管理系統（自訂 IP 模式）
echo ========================================
echo.

REM 讀取自訂 IP 設定檔（如果存在）
if exist "ip-config.txt" (
    for /f "tokens=*" %%a in (ip-config.txt) do set CUSTOM_IP=%%a
    echo 📍 讀取自訂 IP 設定: %CUSTOM_IP%
) else (
    REM 如果沒有設定檔，自動偵測
    for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
        set CUSTOM_IP=%%a
        goto :ip_found
    )
    :ip_found
    REM 清理IP地址（移除空格）
    set CUSTOM_IP=%CUSTOM_IP: =%
    echo 📍 自動偵測到 IP 地址: %CUSTOM_IP%
)

echo.

REM 設定環境變數
set HOST=0.0.0.0
set PORT=3000
set REACT_APP_API_URL=http://%CUSTOM_IP%:5000/api

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
echo    前端網頁: http://%CUSTOM_IP%:3000
echo    後端API: http://%CUSTOM_IP%:5000
echo.
echo 💻 本機訪問地址：
echo    前端網頁: http://localhost:3000
echo    後端API: http://localhost:5000
echo.
echo ========================================
echo 💡 提示：
echo ========================================
echo 如果想使用不同的 IP，請：
echo 1. 建立 ip-config.txt 檔案
echo 2. 在第一行輸入您要使用的 IP 地址
echo 3. 例如：192.168.1.100
echo 4. 重新執行此腳本
echo.
echo ========================================
echo.
echo 按任意鍵關閉此視窗...
pause >nul

