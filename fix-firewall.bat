@echo off
chcp 65001 >nul
echo ========================================
echo 🔥 Windows 防火牆快速設定
echo ========================================
echo.
echo 此腳本將為 Node.js 添加防火牆規則
echo 允許端口 3000 和 5000 的入站連線
echo.
echo ⚠️  需要管理員權限執行！
echo.
echo 按任意鍵繼續，或按 Ctrl+C 取消...
pause >nul
echo.

echo 正在添加防火牆規則...
echo.

REM 添加 Node.js 前端服務規則 (端口 3000)
netsh advfirewall firewall add rule name="Node.js Frontend (Port 3000)" dir=in action=allow protocol=TCP localport=3000 profile=private >nul 2>&1
if %errorlevel%==0 (
    echo ✅ 已添加端口 3000 的防火牆規則
) else (
    echo ❌ 添加端口 3000 規則失敗
    echo    請確認以管理員權限執行此腳本
)
echo.

REM 添加 Node.js 後端服務規則 (端口 5000)
netsh advfirewall firewall add rule name="Node.js Backend (Port 5000)" dir=in action=allow protocol=TCP localport=5000 profile=private >nul 2>&1
if %errorlevel%==0 (
    echo ✅ 已添加端口 5000 的防火牆規則
) else (
    echo ❌ 添加端口 5000 規則失敗
    echo    請確認以管理員權限執行此腳本
)
echo.

echo ========================================
echo 防火牆規則設定完成！
echo ========================================
echo.
echo 現在請讓朋友重新嘗試訪問：
echo   http://192.168.0.186:3000
echo.
echo 如果仍無法訪問，請確認：
echo   1. 朋友的設備與您的電腦在同一 WiFi 網路
echo   2. 服務正在運行（使用 check-connection.bat 檢查）
echo   3. 防火牆規則已正確添加（檢查 Windows Defender 防火牆設定）
echo.
echo 按任意鍵關閉此視窗...
pause >nul

