# 工單管理系統 API 文件

## 基礎資訊
- **Base URL**: `http://localhost:5000`
- **Content-Type**: `application/json`
- **認證**: 無需認證（開發環境）

## API 端點

### 1. 健康檢查
```http
GET /health
```

**回應範例**:
```json
{
  "status": "OK",
  "message": "工單管理系統後端服務正常運行",
  "timestamp": "2024-10-24T10:42:46.640Z"
}
```

### 2. 建立工單
```http
POST /api/tickets
```

**請求範例**:
```json
{
  "deviceId": "CELL-001",
  "imageId": "IMG-2024-001",
  "description": "細胞培養箱溫度異常，需要檢查溫控系統"
}
```

**回應範例**:
```json
{
  "success": true,
  "message": "工單建立成功",
  "data": {
    "id": "clx1234567890",
    "deviceId": "CELL-001",
    "imageId": "IMG-2024-001",
    "description": "細胞培養箱溫度異常，需要檢查溫控系統",
    "status": "OPEN",
    "createdAt": "2024-10-24T10:42:46.640Z",
    "updatedAt": "2024-10-24T10:42:46.640Z"
  }
}
```

### 3. 查詢工單列表
```http
GET /api/tickets?status=OPEN&deviceId=CELL-001&page=1&limit=10
```

**查詢參數**:
- `status` (可選): OPEN | CLOSED
- `deviceId` (可選): 設備 ID
- `page` (可選): 頁碼，預設 1
- `limit` (可選): 每頁數量，預設 10

**回應範例**:
```json
{
  "success": true,
  "message": "查詢工單列表成功",
  "data": {
    "tickets": [
      {
        "id": "clx1234567890",
        "deviceId": "CELL-001",
        "imageId": "IMG-2024-001",
        "description": "細胞培養箱溫度異常",
        "status": "OPEN",
        "createdAt": "2024-10-24T10:42:46.640Z",
        "updatedAt": "2024-10-24T10:42:46.640Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 4. 查詢工單詳情
```http
GET /api/tickets/{id}
```

**回應範例**:
```json
{
  "success": true,
  "message": "查詢工單詳情成功",
  "data": {
    "id": "clx1234567890",
    "deviceId": "CELL-001",
    "imageId": "IMG-2024-001",
    "description": "細胞培養箱溫度異常",
    "status": "OPEN",
    "createdAt": "2024-10-24T10:42:46.640Z",
    "updatedAt": "2024-10-24T10:42:46.640Z"
  }
}
```

### 5. 更新工單
```http
PUT /api/tickets/{id}
```

**請求範例**:
```json
{
  "status": "CLOSED",
  "description": "問題已解決，溫控系統已修復"
}
```

**回應範例**:
```json
{
  "success": true,
  "message": "工單更新成功",
  "data": {
    "id": "clx1234567890",
    "deviceId": "CELL-001",
    "imageId": "IMG-2024-001",
    "description": "問題已解決，溫控系統已修復",
    "status": "CLOSED",
    "createdAt": "2024-10-24T10:42:46.640Z",
    "updatedAt": "2024-10-24T11:30:15.123Z"
  }
}
```

## 錯誤處理

### 驗證錯誤 (400)
```json
{
  "success": false,
  "message": "輸入資料驗證失敗",
  "errors": [
    {
      "msg": "設備 ID 為必填欄位",
      "param": "deviceId"
    }
  ]
}
```

### 資源不存在 (404)
```json
{
  "success": false,
  "message": "找不到指定的工單"
}
```

### 伺服器錯誤 (500)
```json
{
  "success": false,
  "message": "伺服器內部錯誤",
  "error": "詳細錯誤訊息"
}
```

## 資料模型

### Ticket 工單
| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 工單唯一識別碼 |
| deviceId | String | ✅ | 設備 ID |
| imageId | String | ❌ | 影像 ID |
| description | String | ✅ | 工單描述 |
| status | Enum | ✅ | 工單狀態 (OPEN/CLOSED) |
| createdAt | DateTime | ✅ | 建立時間 |
| updatedAt | DateTime | ✅ | 更新時間 |

## 使用範例

### 使用 curl 測試 API
```bash
# 1. 檢查服務狀態
curl http://localhost:5000/health

# 2. 建立工單
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "CELL-001",
    "description": "細胞培養箱溫度異常"
  }'

# 3. 查詢工單列表
curl http://localhost:5000/api/tickets

# 4. 查詢特定工單
curl http://localhost:5000/api/tickets/{ticket_id}

# 5. 更新工單狀態
curl -X PUT http://localhost:5000/api/tickets/{ticket_id} \
  -H "Content-Type: application/json" \
  -d '{"status": "CLOSED"}'
```

### 使用 JavaScript/Fetch
```javascript
// 建立工單
const createTicket = async (ticketData) => {
  const response = await fetch('http://localhost:5000/api/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ticketData)
  });
  return await response.json();
};

// 查詢工單列表
const getTickets = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`http://localhost:5000/api/tickets?${queryString}`);
  return await response.json();
};

// 更新工單
const updateTicket = async (id, updateData) => {
  const response = await fetch(`http://localhost:5000/api/tickets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData)
  });
  return await response.json();
};
```
