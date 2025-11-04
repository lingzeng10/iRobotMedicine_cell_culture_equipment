@echo off
chcp 65001 > nul

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║          匯出資料到 Excel                                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

SET "SERVER_DIR=%~dp0server"

echo 正在執行匯出...
cd /d "%SERVER_DIR%"
node export-to-excel.js

echo.
pause

