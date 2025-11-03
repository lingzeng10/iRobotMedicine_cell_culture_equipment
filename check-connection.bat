@echo off
chcp 65001 >nul
echo ========================================
echo 🔍 連線問題診斷工具
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

echo 📍 本機 IP 地址: %LOCAL_IP%
echo.

echo ========================================
echo 1. 檢查服務狀態
echo ========================================
echo.

echo 檢查端口 3000 (前端服務)...
netstat -an | findstr ":3000" >nul
if %errorlevel%==0 (
    echo ✅ 端口 3000 正在監聽
    netstat -an | findstr ":3000"
) else (
    echo ❌ 端口 3000 未運行！
    echo    請確保前端服務已啟動
)
echo.

echo 檢查端口 5000 (後端服務)...
netstat -an | findstr ":5000" >nul
if %errorlevel%==0 (
    echo ✅ 端口 5000 正在監聽
    netstat -an | findstr ":5000"
) else (
    echo ❌ 端口 5000 未運行！
    echo    請確保後端服務已啟動
)
echo.

echo ========================================
echo 2. 檢查監聽地址
echo ========================================
echo.

netstat -an | findstr ":3000" | findstr "0.0.0.0" >nul
if %errorlevel%==0 (
    echo ✅ 前端服務已設定為允許外部訪問 (0.0.0.0:3000)
) else (
    echo ❌ 前端服務可能只監聽 localhost
    echo    需要設定 HOST=0.0.0.0 才能外部訪問
)
echo.

netstat -an | findstr ":5000" | findstr "0.0.0.0" >nul
if %errorlevel%==0 (
    echo ✅ 後端服務已設定為允許外部訪問 (0.0.0.0:5000)
) else (
    echo ❌ 後端服務可能只監聽 localhost
    echo    後端應該已經設定為 0.0.0.0，請檢查
)
echo.

echo ========================================
echo 3. 防火牆檢查
echo ========================================
echo.
echo ⚠️  請手動檢查防火牆設定：
echo    控制台 → 系統與安全性 → Windows Defender 防火牆
echo    → 允許應用程式通過防火牆
echo    → 找到 Node.js 並勾選「私人網路」
echo.

echo ========================================
echo 4. 測試連線
echo ========================================
echo.
echo 正在測試本地連線...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ 本地連線正常 (http://localhost:3000)
) else (
    echo ❌ 本地無法連線！請確認服務正在運行
)
echo.

curl -s http://%LOCAL_IP%:3000 >nul 2>&1
if %errorlevel%==0 (
    echo ✅ IP 地址連線正常 (http://%LOCAL_IP%:3000)
) else (
    echo ❌ IP 地址無法連線
    echo    這可能是防火牆問題
)
echo.

echo ========================================
echo 5. 解決方案建議
echo ========================================
echo.
echo 如果朋友無法訪問，請依序檢查：
echo.
echo [1] 確認服務正在運行
echo     檢查是否有兩個命令視窗在運行：
echo     - 後端服務 (server)
echo     - 前端服務 (client)
echo.
echo [2] 確認使用正確的啟動方式
echo     使用 start-for-sharing.bat 啟動服務
echo     或手動設定：HOST=0.0.0.0
echo.
echo [3] 檢查防火牆設定
echo     方法一（控制台）：
echo     控制台 → 系統與安全性 → Windows Defender 防火牆
echo     → 允許應用程式通過防火牆
echo     → 找到「Node.js」或「Node.exe」
echo     → 勾選「私人網路」
echo.
echo     方法二（PowerShell 管理員）：
echo     執行以下命令：
echo     New-NetFirewallRule -DisplayName "Node.js Server" ^
echo       -Direction Inbound -Protocol TCP -LocalPort 3000,5000 ^
echo       -Action Allow -Profile Private
echo.
echo [4] 確認網路連線
echo     - 您的電腦和朋友的手機必須連接到同一個 WiFi
echo     - 檢查朋友的 WiFi 名稱是否與您相同
echo     - 嘗試 ping %LOCAL_IP% (從朋友的設備)
echo.
echo [5] 重新檢查 IP 地址
echo     如果重新連接 WiFi，IP 地址可能已改變
echo     重新執行 get-ip.bat 獲取當前 IP
echo.
echo ========================================
echo 📱 分享給朋友的網址應該是：
echo    http://%LOCAL_IP%:3000
echo ========================================
echo.
echo 按任意鍵關閉此視窗...
pause >nul

