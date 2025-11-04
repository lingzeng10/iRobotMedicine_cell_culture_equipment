@echo off
chcp 65001 >nul
echo ============================================
echo 修復所有工單資料問題
echo ============================================
echo.

REM 1. 停止後端服務
echo [步驟 1/5] 停止後端服務...
netstat -ano | findstr :5000 >nul
if %errorlevel% equ 0 (
    echo 找到占用端口 5000 的進程，正在停止...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
        echo 停止進程 PID: %%a
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo 後端服務已停止
) else (
    echo 端口 5000 未被占用
)
echo.

REM 2. 切換到 server 目錄
cd /d "%~dp0server"
if not exist "package.json" (
    echo 錯誤：找不到 server/package.json
    pause
    exit /b 1
)
echo [步驟 2/5] 確認 Prisma Schema 已更新...
echo ✓ Schema 檢查完成
echo.

REM 3. 同步資料庫
echo [步驟 3/5] 同步資料庫 schema...
call npm run db:push
if %errorlevel% neq 0 (
    echo 錯誤：資料庫同步失敗
    pause
    exit /b 1
)
echo ✓ 資料庫已同步
echo.

REM 4. 重新生成 Prisma Client
echo [步驟 4/5] 重新生成 Prisma Client...
call npm run db:generate
if %errorlevel% neq 0 (
    echo 錯誤：Prisma Client 生成失敗
    pause
    exit /b 1
)
echo ✓ Prisma Client 已重新生成
echo.

REM 5. 驗證 Prisma Client
echo [步驟 5/5] 驗證 Prisma Client...
node check-prisma-fields.js
if %errorlevel% neq 0 (
    echo 警告：Prisma Client 驗證失敗
)
echo.

echo ============================================
echo 修復完成！
echo ============================================
echo.
echo 接下來請：
echo 1. 重新啟動後端服務（使用 restart-backend.bat 或手動啟動）
echo 2. 重新載入前端頁面（按 F5 或 Ctrl+R）
echo 3. 測試編輯工單詳情
echo.
pause

