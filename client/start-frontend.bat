@echo off
REM 前端服務啟動腳本
REM 此腳本由 start-server-fixed.bat 調用

cd /d "%~dp0"

REM 設置環境變數（從參數接收）
set "HOST=%~1"
set "REACT_APP_API_URL=%~2"

REM 清理變數值（移除可能的空格）
set "HOST=%HOST: =%"
set "REACT_APP_API_URL=%REACT_APP_API_URL: =%"

REM 顯示環境變數（用於調試）
echo.
echo ========================================
echo  Frontend Service Starting
echo ========================================
echo HOST=%HOST%
echo REACT_APP_API_URL=%REACT_APP_API_URL%
echo ========================================
echo.

REM 啟動前端服務
npm start

