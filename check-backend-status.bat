@echo off
chcp 65001 >nul
echo ============================================
echo 檢查後端服務狀態
echo ============================================
echo.

echo 1. 檢查端口 5000 是否被占用:
netstat -ano | findstr :5000
if %errorlevel% equ 0 (
    echo    ✓ 端口 5000 正在使用中
) else (
    echo    ✗ 端口 5000 未被占用（後端服務未運行）
)
echo.

echo 2. 測試健康檢查端點:
curl -s http://localhost:5000/health
if %errorlevel% equ 0 (
    echo    ✓ 健康檢查成功
) else (
    echo    ✗ 健康檢查失敗（無法連接到後端服務）
)
echo.

echo 3. 測試 API 端點:
curl -s http://localhost:5000/api/tickets
if %errorlevel% equ 0 (
    echo    ✓ API 端點可訪問
) else (
    echo    ✗ API 端點無法訪問
)
echo.

echo ============================================
echo 檢查完成
echo ============================================
pause

