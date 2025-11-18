@echo off
REM ========================================
REM 工單管理系統 - 自動啟動腳本（任務計劃程序專用）
REM ========================================

setlocal ENABLEDELAYEDEXPANSION
chcp 65001 >nul
title Work Order Management - Auto Starter

REM 等待系統完全啟動（30秒，確保網路和服務已就緒）
timeout /t 30 /nobreak >nul

REM 切換到專案目錄（使用絕對路徑）
cd /d "C:\iRobotMedicine_cell culture equipment"

REM 執行啟動腳本
call "%~dp0start-server-fixed.bat"

REM 記錄啟動日誌
echo [%date% %time%] 工單管理系統已自動啟動 >> "%~dp0startup.log"

REM 腳本執行完畢（不顯示窗口）
exit /b 0

