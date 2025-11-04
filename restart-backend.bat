@echo off
chcp 65001 >nul
echo ============================================
echo 重新啟動後端服務
echo ============================================
echo.

REM 檢查並停止占用端口 5000 的進程
echo 檢查端口 5000...
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo 找到占用端口 5000 的進程，正在停止...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
        echo 停止進程 PID: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
) else (
    echo 端口 5000 未被占用
)
echo.

REM 切換到 server 目錄
cd /d "%~dp0server"
if not exist "package.json" (
    echo 錯誤：找不到 server/package.json
    pause
    exit /b 1
)

REM 確認 Prisma Client 已生成
echo 確認 Prisma Client 已生成...
if not exist "node_modules\.prisma\client\query_engine-windows.dll.node" (
    echo 警告：Prisma Client 可能未正確生成
    echo 正在重新生成 Prisma Client...
    call npm run db:generate
    if %errorlevel% neq 0 (
        echo 錯誤：Prisma Client 生成失敗
        pause
        exit /b 1
    )
)
echo.

echo 正在啟動後端服務...
echo 服務地址: http://localhost:5000
echo 健康檢查: http://localhost:5000/health
echo.
echo 按 Ctrl+C 可以停止服務
echo.

REM 啟動後端服務
npm run dev

pause

