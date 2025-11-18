@echo off
setlocal ENABLEDELAYEDEXPANSION
chcp 65001 >nul
title Frontend Diagnosis Tool

echo.
echo ========================================
echo  前端服務診斷工具
echo ========================================
echo.

REM 1. 檢查目錄結構
echo [1/6] 檢查目錄結構...
if exist "client\package.json" (
  echo [✓] client\package.json 存在
) else (
  echo [✗] client\package.json 不存在
  goto :end
)
echo.

REM 2. 檢查 node_modules
echo [2/6] 檢查 node_modules...
if exist "client\node_modules" (
  echo [✓] node_modules 目錄存在
  dir "client\node_modules" | findstr /C:"個檔案" >nul 2>&1
  if !errorlevel!==0 (
    echo [✓] node_modules 不為空
  ) else (
    echo [警告] node_modules 可能為空，請運行: cd client ^&^& npm install
  )
) else (
  echo [✗] node_modules 目錄不存在
  echo [提示] 請運行: cd client ^&^& npm install
)
echo.

REM 3. 檢查端口 3000 是否被佔用
echo [3/6] 檢查端口 3000 狀態...
netstat -ano | findstr ":3000.*LISTENING" >nul 2>&1
if !errorlevel!==0 (
  echo [警告] 端口 3000 已被佔用
  echo 佔用端口的進程：
  for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do (
    tasklist /FI "PID eq %%a" /FO LIST | findstr "映像名稱"
  )
  echo.
  echo [提示] 請關閉佔用端口的程序，或使用其他端口
) else (
  echo [✓] 端口 3000 未被佔用
)
echo.

REM 4. 檢查 Node.js 和 npm
echo [4/6] 檢查 Node.js 和 npm...
where node >nul 2>&1
if !errorlevel!==0 (
  for /f "tokens=*" %%a in ('node --version') do echo [✓] Node.js 版本: %%a
) else (
  echo [✗] Node.js 未安裝或不在 PATH 中
  goto :end
)

where npm >nul 2>&1
if !errorlevel!==0 (
  for /f "tokens=*" %%a in ('npm --version') do echo [✓] npm 版本: %%a
) else (
  echo [✗] npm 未安裝或不在 PATH 中
  goto :end
)
echo.

REM 5. 檢查 package.json 中的腳本
echo [5/6] 檢查 package.json 配置...
findstr /C:"react-scripts" "client\package.json" >nul 2>&1
if !errorlevel!==0 (
  echo [✓] react-scripts 已配置
) else (
  echo [✗] react-scripts 未找到
)
findstr /C:"\"start\"" "client\package.json" >nul 2>&1
if !errorlevel!==0 (
  echo [✓] start 腳本已配置
) else (
  echo [✗] start 腳本未找到
)
echo.

REM 6. 嘗試手動啟動（僅檢查，不實際啟動）
echo [6/6] 檢查環境變數...
if defined REACT_APP_API_URL (
  echo [✓] REACT_APP_API_URL 已設置: %REACT_APP_API_URL%
) else (
  echo [提示] REACT_APP_API_URL 未設置（將使用默認值）
)
echo.

echo ========================================
echo  診斷完成
echo ========================================
echo.
echo 建議操作：
echo 1. 如果 node_modules 不存在或為空，運行: cd client ^&^& npm install
echo 2. 如果端口 3000 被佔用，關閉佔用端口的程序
echo 3. 手動測試前端啟動: cd client ^&^& npm start
echo 4. 查看 "Frontend Service" 視窗中的錯誤訊息
echo.
echo ========================================
echo.

:end
pause

