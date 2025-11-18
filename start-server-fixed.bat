@echo off
setlocal ENABLEDELAYEDEXPANSION
chcp 65001 >nul
title Work Order Management - Auto Starter

echo.
echo ========================================
echo  工單管理系統 - 自動啟動腳本
echo ========================================
echo.

REM ============================
REM 0) 預先讀取 ngrok 配置（如果存在）
REM ============================
set "FRONTEND_URL="
set "BACKEND_URL="
if exist "%~dp0ngrok-config.txt" (
  echo [0/6] 讀取 ngrok 配置...
  for /f "tokens=2 delims==" %%a in ('findstr "FRONTEND_URL" "%~dp0ngrok-config.txt"') do set FRONTEND_URL=%%a
  for /f "tokens=2 delims==" %%a in ('findstr "BACKEND_URL" "%~dp0ngrok-config.txt"') do set BACKEND_URL=%%a
  set FRONTEND_URL=!FRONTEND_URL:"=!
  set BACKEND_URL=!BACKEND_URL:"=!
  set FRONTEND_URL=!FRONTEND_URL: =!
  set BACKEND_URL=!BACKEND_URL: =!
  if defined FRONTEND_URL if defined BACKEND_URL (
    echo [✓] ngrok 配置已讀取
    echo   前端: !FRONTEND_URL!
    echo   後端: !BACKEND_URL!
  )
)
echo.

REM ============================
REM 1) 啟動後端（port 5000）
REM ============================
echo [1/6] 啟動後端服務...
start "Backend Service" cmd /k "cd /d ""%~dp0server"" && echo ======================================== && echo Backend Service Starting && echo ======================================== && set PORT=5000 && npm run dev"

REM 等待後端就緒
set /a "BACKEND_TRY=0"
set /a "BACKEND_MAX=30"
echo 等待後端就緒（端口 5000）...

:wait_backend
set /a BACKEND_TRY+=1
if %BACKEND_TRY% GTR %BACKEND_MAX% (
  echo [警告] 後端在預期時間內未就緒，但將繼續啟動前端...
  goto :start_frontend
)
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 -Uri 'http://localhost:5000/health'; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %errorlevel%==0 (
  echo [✓] 後端已就緒
  goto :start_frontend
)
timeout /t 2 >nul
goto :wait_backend

:start_frontend
REM ============================
REM 2) 啟動前端（設置正確的 API URL）
REM ============================
echo.
echo [2/6] 啟動前端服務...
echo 注意：前端編譯可能需要 30-90 秒，請耐心等待...
echo.

REM 初始化端口變數
set "FRONTEND_PORT=3000"
set "PORT_CHANGED=0"

REM 檢查 client 目錄和 package.json
if not exist "%~dp0client\package.json" (
  echo [錯誤] 找不到 client\package.json，請確認目錄結構正確
  goto :end
)

REM 設置 API URL（優先使用 ngrok 後端 URL）
if defined BACKEND_URL (
  set "REACT_APP_API_URL=!BACKEND_URL!/api"
  echo [✓] 使用 ngrok 後端 URL: !REACT_APP_API_URL!
  echo [提示] 前端將通過 ngrok 連接到後端
) else (
  set "REACT_APP_API_URL=http://localhost:5000/api"
  echo [✓] 使用本地 API URL: !REACT_APP_API_URL!
  echo [提示] 前端將使用本地後端服務
)
echo.

REM 創建臨時批處理文件來啟動前端（確保環境變數正確傳遞）
set "TEMP_FRONTEND_BAT=%~dp0temp-start-frontend.bat"
REM 將環境變數值存儲到臨時變數中（避免擴展問題）
set "TEMP_API_URL=!REACT_APP_API_URL!"
(
  echo @echo off
  echo setlocal
  echo cd /d "%~dp0client"
  echo echo ========================================
  echo echo Frontend Service Starting
  echo echo ========================================
  echo echo Directory: %%CD%%
  echo echo REACT_APP_API_URL=%TEMP_API_URL%
  echo echo ========================================
  echo echo.
  echo set REACT_APP_API_URL=%TEMP_API_URL%
  echo npm start
) > "%TEMP_FRONTEND_BAT%"

REM 啟動前端服務（使用臨時批處理文件）
start "Frontend Service" cmd /k ""%TEMP_FRONTEND_BAT%""

REM 等待前端端口就緒
set /a "TRY=0"
set /a "MAX=150"
echo 等待前端就緒 (port %FRONTEND_PORT%)...
echo 這可能需要 30-90 秒（首次啟動更久）...
echo.
echo [提示] 請查看 "Frontend Service" 視窗確認啟動狀態
echo.

:wait_tcp
set /a TRY+=1
if %TRY% GTR %MAX% (
  echo.
  echo [錯誤] 前端在預期時間內未就緒（已等待 %MAX% 次，約 %MAX% 秒）
  echo.
  echo 請檢查以下項目：
  echo 1. 查看 "Frontend Service" 視窗是否有錯誤訊息
  echo 2. 檢查端口 3000 是否被其他程序佔用
  echo 3. 確認 node_modules 已安裝（運行: cd client ^&^& npm install）
  echo 4. 手動測試: cd client ^&^& npm start
  echo.
  REM 清理臨時文件
  if exist "%TEMP_FRONTEND_BAT%" del "%TEMP_FRONTEND_BAT%" >nul 2>&1
  goto :verify_connection
)

REM 每 15 次顯示進度
set /a "MOD=TRY %% 15"
if %MOD%==0 (
  echo 等待中... (已等待 %TRY%/%MAX% 次，約 %TRY% 秒)
)

REM 檢查端口是否監聽（使用 netstat）
netstat -ano | findstr ":%FRONTEND_PORT%.*LISTENING" >nul 2>&1
if %errorlevel% neq 0 (
  timeout /t 2 >nul
  goto :wait_tcp
)

REM 端口已監聽，等待更長時間讓服務完全啟動
if %TRY% LSS 30 (
  timeout /t 2 >nul
  goto :wait_tcp
)

echo 端口 %FRONTEND_PORT% 已監聽，等待服務完全啟動...
timeout /t 10 >nul

REM 多次檢查 HTTP 響應，確保服務真正就緒
set "HTTP_OK=0"
for /L %%i in (1,1,5) do (
  powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 -Uri 'http://localhost:%FRONTEND_PORT%'; if ($r.StatusCode -eq 200 -and $r.Content -notmatch '\"success\":\s*true' -and ($r.Content -match '<html' -or $r.Content -match 'react' -or $r.Content -match 'root' -or $r.Content -match 'DOCTYPE')) { exit 0 } else { exit 1 } } catch { exit 1 }"
  if !errorlevel!==0 (
    set "HTTP_OK=1"
    goto :frontend_ready
  )
  timeout /t 3 >nul
)

:frontend_ready
if !HTTP_OK!==1 (
  echo [✓] 前端已就緒
  REM 清理臨時文件
  if exist "%TEMP_FRONTEND_BAT%" del "%TEMP_FRONTEND_BAT%" >nul 2>&1
  goto :verify_connection
)

REM HTTP 檢查失敗，但端口已監聽，可能是還在編譯中
echo 服務正在啟動中，繼續等待...
timeout /t 5 >nul
goto :wait_tcp

:verify_connection
echo.
echo [4/6] 驗證前後端連線...
echo.

REM 驗證後端健康（支援 /health 與 /api/health）
powershell -NoProfile -Command ^
  "foreach ($u in @('http://localhost:5000/health','http://localhost:5000/api/health')) { try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 -Uri $u; if ($r.StatusCode -eq 200) { exit 0 } } catch {} } ; exit 1"
if %errorlevel%==0 (
  echo [✓] 後端 API 連線正常
  set "BACKEND_CONNECTED=1"
) else (
  echo [✗] 後端 API 連線失敗
  set "BACKEND_CONNECTED=0"
)

REM 驗證前端
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 3 -Uri 'http://localhost:!FRONTEND_PORT!'; if ($r.StatusCode -eq 200 -and ($r.Content -match '<!DOCTYPE html>' -or $r.Content -match 'React')) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %errorlevel%==0 (
  echo [✓] 前端服務連線正常（端口 !FRONTEND_PORT!）
  set "FRONTEND_CONNECTED=1"
) else (
  echo [✗] 前端服務連線失敗
  set "FRONTEND_CONNECTED=0"
)

REM 若任一失敗就跳過 ngrok
if !BACKEND_CONNECTED!==0 (
  echo [警告] 後端連線失敗，跳過 ngrok
  goto :open_browser
)
if !FRONTEND_CONNECTED!==0 (
  echo [警告] 前端連線失敗，跳過 ngrok
  goto :open_browser
)

echo [✓] 前後端連線驗證完成
echo.

:open_browser
echo [5/6] 開啟瀏覽器...
start "" "http://localhost:!FRONTEND_PORT!"
echo [✓] 瀏覽器已開啟（端口 !FRONTEND_PORT!）
if !PORT_CHANGED!==1 echo [提示] 注意：前端使用端口 !FRONTEND_PORT! 而不是 3000
echo.

:check_ngrok
REM ============================
REM 5) 檢查並啟動 ngrok（可選）
REM ============================
echo [5/6] 檢查 ngrok 配置...

REM 檢查是否有 ngrok 配置
if not defined FRONTEND_URL (
  echo [提示] 未找到 ngrok 配置，跳過 ngrok 啟動
  echo 如需使用 ngrok，請創建 ngrok-config.txt 文件
  goto :show_summary
)

if not defined BACKEND_URL (
  echo [警告] 無法讀取 BACKEND_URL 配置，跳過 ngrok 啟動
  goto :show_summary
)

REM 檢查 ngrok 是否安裝
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
  echo [警告] 找不到 ngrok，跳過 ngrok 啟動
  echo 如需使用 ngrok，請先安裝：https://ngrok.com/download
  goto :show_summary
)

echo [✓] ngrok 已安裝
echo 配置：
echo   前端 URL: !FRONTEND_URL!
echo   後端 URL: !BACKEND_URL!
echo.

REM 提取域名部分（移除 https:// 前綴）
set FRONTEND_DOMAIN=!FRONTEND_URL:https://=!
set BACKEND_DOMAIN=!BACKEND_URL:https://=!

REM 清理可能的尾部斜線
set FRONTEND_DOMAIN=!FRONTEND_DOMAIN:/=!
set BACKEND_DOMAIN=!BACKEND_DOMAIN:/=!

REM 啟動前端 ngrok tunnel
echo 啟動前端 ngrok tunnel（端口 !FRONTEND_PORT!）...
start "ngrok-前端" cmd /k "cd /d ""%~dp0"" && echo ======================================== && echo ngrok Frontend Tunnel && echo Domain: !FRONTEND_DOMAIN! && echo Port: !FRONTEND_PORT! && echo ======================================== && ngrok http !FRONTEND_PORT! --domain=!FRONTEND_DOMAIN! --host-header=localhost:!FRONTEND_PORT!"

timeout /t 3 >nul

REM 啟動後端 ngrok tunnel
echo 啟動後端 ngrok tunnel...
start "ngrok-後端" cmd /k "cd /d ""%~dp0"" && echo ======================================== && echo ngrok Backend Tunnel && echo Domain: !BACKEND_DOMAIN! && echo ======================================== && ngrok http 5000 --domain=!BACKEND_DOMAIN!"

timeout /t 3 >nul

REM 驗證 ngrok tunnels
echo.
echo [6/6] 驗證 ngrok tunnels 狀態...
set /a "NGROK_TRY=0"
set /a "NGROK_MAX=20"
set "FRONTEND_NGROK_OK=0"
set "BACKEND_NGROK_OK=0"

:verify_ngrok
set /a NGROK_TRY+=1
if %NGROK_TRY% GTR %NGROK_MAX% (
  echo [警告] ngrok tunnels 驗證超時
  echo 請檢查 "ngrok-前端" 和 "ngrok-後端" 視窗查看錯誤訊息
  goto :show_summary
)

REM 檢查前端 ngrok URL
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 -Uri '!FRONTEND_URL!'; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %errorlevel%==0 (
  set "FRONTEND_NGROK_OK=1"
)

REM 檢查後端 ngrok URL
powershell -NoProfile -Command "try { $r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 5 -Uri '!BACKEND_URL!/health'; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %errorlevel%==0 (
  set "BACKEND_NGROK_OK=1"
)

if !FRONTEND_NGROK_OK!==1 if !BACKEND_NGROK_OK!==1 (
  echo [✓] ngrok tunnels 已成功啟動並驗證
  goto :show_summary
)

echo 等待 ngrok tunnels 啟動... (第 %NGROK_TRY%/%NGROK_MAX% 次)
timeout /t 3 >nul
goto :verify_ngrok

:show_summary
echo.
echo ========================================
echo  🚀 服務啟動完成！
echo ========================================
echo.
echo 💻 本機訪問：
echo    前端: http://localhost:!FRONTEND_PORT!
echo    後端: http://localhost:5000
if !PORT_CHANGED!==1 (
  echo.
  echo [提示] 前端使用端口 !FRONTEND_PORT! 而不是 3000（因為端口 3000 被佔用）
)
echo.

if defined FRONTEND_URL (
  echo 🌐 ngrok URLs：
  echo    前端: !FRONTEND_URL!
  echo    後端: !BACKEND_URL!
  echo.
  echo 📋 ngrok 狀態：
  if !FRONTEND_NGROK_OK!==1 (
    echo    [✓] 前端 ngrok tunnel: 正常
  ) else (
    echo    [✗] 前端 ngrok tunnel: 未就緒（請檢查 ngrok-前端 視窗）
  )
  if !BACKEND_NGROK_OK!==1 (
    echo    [✓] 後端 ngrok tunnel: 正常
  ) else (
    echo    [✗] 後端 ngrok tunnel: 未就緒（請檢查 ngrok-後端 視窗）
  )
  echo.
  echo 💡 重要提示：
  echo    - 前端已設置 REACT_APP_API_URL=!BACKEND_URL!/api
  echo    - 通過 ngrok 訪問時，前端會自動使用後端 ngrok URL
  echo    - 可以直接分享前端 ngrok URL 給朋友訪問
  echo    - 所有 API 請求會自動使用後端 ngrok URL
  echo.
)

echo 💡 提示：
echo    - 所有服務已啟動，可以在瀏覽器中訪問
echo    - 如需停止服務，請關閉對應的命令視窗
echo.
echo ========================================
echo.

:end
exit /b 0
