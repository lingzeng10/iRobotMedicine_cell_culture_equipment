@echo off
chcp 65001 >nul
echo ============================================
echo 啟動後端服務（僅後端）
echo ============================================
echo.

REM 檢查端口 5000 是否已被占用
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo 警告：端口 5000 已被占用！
    echo 正在查找占用進程...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
        echo 找到進程 ID: %%a
        tasklist /FI "PID eq %%a" /FO LIST
    )
    echo.
    set /p KILL="是否要終止占用端口的進程？(Y/N): "
    if /i "!KILL!"=="Y" (
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
            echo 正在終止進程 %%a...
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
    )
)
echo.

REM 切換到 server 目錄
cd /d "%~dp0server"
if not exist "package.json" (
    echo 錯誤：找不到 server/package.json
    echo 請確認您在正確的目錄下執行此腳本。
    pause
    exit /b 1
)

echo 正在啟動後端服務...
echo 服務地址: http://localhost:5000
echo 健康檢查: http://localhost:5000/health
echo.
echo 按 Ctrl+C 可以停止服務
echo.

REM 啟動後端服務
npm run dev

pause

