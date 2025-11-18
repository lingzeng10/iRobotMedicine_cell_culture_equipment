@echo off
chcp 65001 >nul
echo 測試前端啟動...
echo.
cd /d "%~dp0client"
echo 當前目錄: %CD%
echo.
echo 檢查 node_modules...
if not exist "node_modules" (
    echo [錯誤] node_modules 不存在，請先運行: npm install
    pause
    exit /b 1
)
echo [✓] node_modules 存在
echo.
echo 啟動前端服務...
echo 按 Ctrl+C 停止
echo.
npm start
