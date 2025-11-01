@echo off
echo 正在獲取您的IP地址...
echo.

REM 獲取主要網路介面的IP地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set ip=%%a
    goto :found
)

:found
REM 清理IP地址（移除空格）
set ip=%ip: =%

echo ========================================
echo 🚀 工單管理系統訪問資訊
echo ========================================
echo.
echo 📱 手機/平板訪問地址:
echo    http://%ip%:3000
echo.
echo 💻 電腦訪問地址:
echo    http://localhost:3000
echo    http://%ip%:3000
echo.
echo 🔧 後端API地址:
echo    http://%ip%:5000
echo.
echo ========================================
echo 📋 使用說明:
echo 1. 確保手機和電腦在同一WiFi網路
echo 2. 在手機瀏覽器輸入: http://%ip%:3000
echo 3. 如果無法訪問，請檢查防火牆設定
echo ========================================
echo.
pause
