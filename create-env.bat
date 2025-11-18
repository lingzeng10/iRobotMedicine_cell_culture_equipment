@echo off
REM 創建 .env 文件

if not exist "client\.env" (
    echo 建立 .env 檔...
    (
        echo REACT_APP_API_URL=http://localhost:5000/api
        echo HOST=localhost
    ) > "client\.env"
    echo .env 文件已創建！
) else (
    echo 已偵測到 .env 檔，略過建立。
)

echo.
echo .env 文件內容：
type "client\.env"
echo.
pause

