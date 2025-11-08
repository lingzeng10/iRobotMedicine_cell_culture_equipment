@echo off
chcp 65001 > nul

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║          啟動 Ollama AI Agent 服務                           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

echo 1. 檢查 Ollama 是否已安裝...
where ollama >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo    ✗ Ollama 未安裝
    echo.
    echo    請先安裝 Ollama:
    echo    1. 訪問 https://ollama.ai/download
    echo    2. 下載 Windows 版本並安裝
    echo    3. 重新執行此腳本
    echo.
    pause
    EXIT /B 1
)
echo    ✓ Ollama 已安裝
echo.

echo 2. 檢查模型是否已下載...
ollama list | findstr llama3.2 >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo    ⚠ 模型未下載，正在下載 llama3.2（這可能需要幾分鐘）...
    ollama pull llama3.2
    IF %ERRORLEVEL% NEQ 0 (
        echo    ✗ 下載模型失敗
        pause
        EXIT /B 1
    )
) ELSE (
    echo    ✓ 模型已下載
)
echo.

echo 3. 啟動 Ollama 服務...
start "Ollama 服務" cmd /k "ollama serve"

timeout /t 5 /nobreak >nul

echo 4. 檢查 Ollama 服務狀態...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:11434/api/tags' -UseBasicParsing -TimeoutSec 5 | Out-Null; Write-Output '✓ Ollama 服務已啟動' } catch { Write-Output '✗ Ollama 服務啟動失敗' }"
echo.

echo 5. 啟動後端服務...
cd /d "%~dp0server"
start "後端服務" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo 6. 啟動前端服務...
cd /d "%~dp0client"
start "前端服務" cmd /k "npm start"

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║          服務啟動完成！                                       ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Ollama API: http://localhost:11434
echo 後端 API: http://localhost:5000
echo 前端: http://localhost:3000
echo.
echo 使用說明：
echo 1. 等待前端服務啟動完成（約 30 秒）
echo 2. 在網頁右上角點擊 AI 圖示開啟 AI 助手
echo 3. 開始與 AI 對話，例如：「查詢所有 AOI 工單」
echo.
pause

