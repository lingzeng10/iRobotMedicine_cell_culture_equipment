# 工單管理系統 - 完整 API 文檔

## 基礎資訊
- **Base URL**: `http://localhost:5000`
- **Content-Type**: `application/json`
- **認證**: 無需認證（開發環境）

---

## 📋 1. 系統資訊

### 1.1 根路徑 - 查看 API 資訊
```http
GET /
```

**回應範例**:
```json
{
  "success": true,
  "message": "工單管理系統後端 API 服務",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "tickets": "/api/tickets",
    "targets": "/api/targets",
    "schedules": "/api/schedules",
    "photos": "/api/photos",
    "version": "/api/version"
  },
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

### 1.2 健康檢查
```http
GET /health
```

**回應範例**:
```json
{
  "status": "OK",
  "message": "工單管理系統後端服務正常運行",
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

---

## 🎫 2. 工單管理 API (`/api/tickets`)

### 2.1 建立工單
```http
POST /api/tickets
```

**請求體**:
```json
{
  "deviceId": "CELL-001",
  "imageId": "IMG-2024-001"  // 可選
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
    "status": "OPEN",
    "createdAt": "2025-11-02T12:00:00.000Z",
    "updatedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

### 2.2 查詢工單列表
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
    "tickets": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 2.3 查詢單一工單詳情
```http
GET /api/tickets/:id
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
    "status": "OPEN",
    "createdAt": "2025-11-02T12:00:00.000Z",
    "updatedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

### 2.4 更新工單
```http
PUT /api/tickets/:id
```

**請求體**:
```json
{
  "status": "CLOSED"  // 可選
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
    "status": "CLOSED",
    "updatedAt": "2025-11-02T12:30:00.000Z"
  }
}
```

---

## 🎯 3. 預生產目標 API (`/api/targets`)

### 3.1 取得所有預生產目標列表
```http
GET /api/targets?page=1&limit=10&status=PLANNING
```

**查詢參數**:
- `page` (可選): 頁碼，預設 1
- `limit` (可選): 每頁數量，預設 10
- `status` (可選): PLANNING | IN_PROGRESS | COMPLETED | CANCELLED

**回應範例**:
```json
{
  "success": true,
  "message": "取得預生產目標列表成功",
  "data": {
    "targets": [
      {
        "id": "target123",
        "name": "DS1-2",
        "description": "目標描述",
        "expectedCompletionDate": "2025-11-30",
        "status": "PLANNING",
        "createdAt": "2025-11-02T12:00:00.000Z",
        "updatedAt": "2025-11-02T12:00:00.000Z"
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

### 3.2 取得單一預生產目標詳情
```http
GET /api/targets/:id
```

**回應範例**:
```json
{
  "success": true,
  "message": "取得預生產目標詳情成功",
  "data": {
    "id": "target123",
    "name": "DS1-2",
    "description": "目標描述",
    "expectedCompletionDate": "2025-11-30",
    "status": "PLANNING",
    "createdAt": "2025-11-02T12:00:00.000Z",
    "updatedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

### 3.3 建立新的預生產目標
```http
POST /api/targets
```

**請求體**:
```json
{
  "name": "DS1-2",
  "description": "目標描述",  // 可選
  "expectedCompletionDate": "2025-11-30"
}
```

**回應範例**:
```json
{
  "success": true,
  "message": "建立預生產目標成功",
  "data": {
    "id": "target123",
    "name": "DS1-2",
    "status": "PLANNING",
    "createdAt": "2025-11-02T12:00:00.000Z",
    "updatedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

### 3.4 更新預生產目標
```http
PUT /api/targets/:id
```

**請求體**:
```json
{
  "name": "DS1-2-更新",  // 可選
  "description": "更新描述",  // 可選
  "expectedCompletionDate": "2025-12-01",  // 可選
  "status": "IN_PROGRESS"  // 可選: PLANNING | IN_PROGRESS | COMPLETED | CANCELLED
}
```

**回應範例**:
```json
{
  "success": true,
  "message": "更新預生產目標成功",
  "data": {
    "id": "target123",
    "name": "DS1-2-更新",
    "status": "IN_PROGRESS",
    "updatedAt": "2025-11-02T12:30:00.000Z"
  }
}
```

### 3.5 刪除預生產目標
```http
DELETE /api/targets/:id
```

**回應範例**:
```json
{
  "success": true,
  "message": "刪除預生產目標成功"
}
```

### 3.6 取得指定目標的工單排程
```http
GET /api/targets/:id/schedules
```

**回應範例**:
```json
{
  "success": true,
  "message": "取得工單排程成功",
  "data": [
    {
      "id": "schedule123",
      "ticketId": "ticket123",
      "targetId": "target123",
      "scheduledDate": "2025-11-02",
      "scheduledTime": "09:00",
      "priority": "HIGH",
      "status": "OPEN",
      "ticket": {
        "id": "ticket123",
        "deviceId": "CELL-001",
        "status": "OPEN"
      },
      "createdAt": "2025-11-02T12:00:00.000Z",
      "updatedAt": "2025-11-02T12:00:00.000Z"
    }
  ]
}
```

---

## 📅 4. 工單排程 API (`/api/schedules`)

### 4.1 建立工單排程
```http
POST /api/schedules
```

**請求體**:
```json
{
  "ticketId": "ticket123",
  "targetId": "target123",
  "scheduledDate": "2025-11-02",
  "scheduledTime": "09:00",  // 可選，格式: HH:mm
  "priority": "MEDIUM"  // 可選: HIGH | MEDIUM | LOW，預設: MEDIUM
}
```

**回應範例**:
```json
{
  "success": true,
  "message": "建立工單排程成功",
  "data": {
    "id": "schedule123",
    "ticketId": "ticket123",
    "targetId": "target123",
    "scheduledDate": "2025-11-02",
    "scheduledTime": "09:00",
    "priority": "MEDIUM",
    "status": "OPEN",
    "ticket": {...},
    "target": {...},
    "createdAt": "2025-11-02T12:00:00.000Z",
    "updatedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

### 4.2 取得所有工單排程列表
```http
GET /api/schedules?page=1&limit=10&targetId=target123&ticketId=ticket123&status=OPEN&date=2025-11-02
```

**查詢參數**:
- `page` (可選): 頁碼，預設 1
- `limit` (可選): 每頁數量，預設 10
- `targetId` (可選): 目標 ID 篩選
- `ticketId` (可選): 工單 ID 篩選
- `status` (可選): 狀態篩選
- `date` (可選): 日期篩選，格式: YYYY-MM-DD（**新增功能：用於今日排程**）

**回應範例**:
```json
{
  "success": true,
  "message": "取得工單排程列表成功",
  "data": {
    "schedules": [
      {
        "id": "schedule123",
        "ticketId": "ticket123",
        "targetId": "target123",
        "scheduledDate": "2025-11-02",
        "scheduledTime": "09:00",
        "priority": "MEDIUM",
        "status": "OPEN",
        "ticket": {...},
        "target": {...}
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

### 4.3 取得指定目標的工單排程
```http
GET /api/schedules/target/:targetId
```

**回應範例**:
```json
{
  "success": true,
  "message": "取得目標工單排程成功",
  "data": [
    {
      "id": "schedule123",
      "ticketId": "ticket123",
      "targetId": "target123",
      "scheduledDate": "2025-11-02",
      "scheduledTime": "09:00",
      "priority": "HIGH",
      "status": "OPEN",
      "ticket": {...},
      "target": {...}
    }
  ]
}
```

### 4.4 取得單一工單排程詳情
```http
GET /api/schedules/:id
```

**回應範例**:
```json
{
  "success": true,
  "message": "取得工單排程詳情成功",
  "data": {
    "id": "schedule123",
    "ticketId": "ticket123",
    "targetId": "target123",
    "scheduledDate": "2025-11-02",
    "scheduledTime": "09:00",
    "priority": "HIGH",
    "status": "OPEN",
    "ticket": {...},
    "target": {...}
  }
}
```

### 4.5 更新工單排程
```http
PUT /api/schedules/:id
```

**請求體**:
```json
{
  "scheduledDate": "2025-11-03",  // 可選，格式: YYYY-MM-DD
  "scheduledTime": "10:00",  // 可選，格式: HH:mm
  "priority": "HIGH",  // 可選: HIGH | MEDIUM | LOW
  "status": "IN_PROGRESS"  // 可選: OPEN | IN_PROGRESS | COMPLETED | CANCELLED
}
```

**回應範例**:
```json
{
  "success": true,
  "message": "更新工單排程成功",
  "data": {
    "id": "schedule123",
    "scheduledDate": "2025-11-03",
    "scheduledTime": "10:00",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "updatedAt": "2025-11-02T12:30:00.000Z"
  }
}
```

### 4.6 刪除工單排程
```http
DELETE /api/schedules/:id
```

**回應範例**:
```json
{
  "success": true,
  "message": "刪除工單排程成功"
}
```

---

## 📷 5. 照片 API (`/api/photos`)

### 5.1 上傳照片到指定工單
```http
POST /api/photos/upload
Content-Type: multipart/form-data
```

**表單資料**:
- `photo` (file): 照片文件（JPEG, JPG, PNG, GIF, BMP, WEBP，最大 10MB）
- `ticketId` (string): 工單 ID（必填）
- `description` (string): 照片描述（可選）

**回應範例**:
```json
{
  "success": true,
  "message": "照片上傳成功",
  "data": {
    "id": "photo123",
    "filename": "1761579584168_820092929.jpg",
    "originalName": "image.jpg",
    "fileSize": 102400,
    "mimeType": "image/jpeg",
    "description": "照片描述",
    "uploadedAt": "2025-11-02T12:00:00.000Z",
    "url": "/api/photos/photo123/view"
  }
}
```

### 5.2 查看照片
```http
GET /api/photos/:id/view
```

**回應**: 返回照片文件（圖片）

### 5.3 獲取指定工單的所有照片
```http
GET /api/photos/ticket/:ticketId
```

**回應範例**:
```json
{
  "success": true,
  "message": "獲取照片列表成功",
  "data": [
    {
      "id": "photo123",
      "filename": "1761579584168_820092929.jpg",
      "originalName": "image.jpg",
      "fileSize": 102400,
      "mimeType": "image/jpeg",
      "description": "照片描述",
      "uploadedAt": "2025-11-02T12:00:00.000Z",
      "url": "/api/photos/photo123/view"
    }
  ]
}
```

### 5.4 刪除照片
```http
DELETE /api/photos/:id
```

**回應範例**:
```json
{
  "success": true,
  "message": "照片刪除成功"
}
```

---

## 📦 6. 版本資訊 API (`/api/version`)

### 6.1 獲取版本資訊
```http
GET /api/version
```

**回應範例**:
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "buildNumber": "20251102",
    "changelog": [
      {
        "version": "1.0.0",
        "date": "2025-11-02",
        "changes": ["初始版本"]
      }
    ]
  },
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

### 6.2 獲取更新日誌
```http
GET /api/version/changelog
```

**回應範例**:
```json
{
  "success": true,
  "data": {
    "changelog": [...],
    "currentVersion": "1.0.0",
    "buildNumber": "20251102"
  }
}
```

### 6.3 檢查更新
```http
GET /api/version/check?version=1.0.0
```

**查詢參數**:
- `version` (可選): 客戶端版本號，預設 "1.0.0"

**回應範例**:
```json
{
  "success": true,
  "data": {
    "hasUpdate": false,
    "currentVersion": "1.0.0",
    "clientVersion": "1.0.0",
    "latestChangelog": {...},
    "updateAvailable": false
  }
}
```

---

## 🚨 錯誤處理

### 驗證錯誤 (400)
```json
{
  "success": false,
  "message": "請求資料驗證失敗",
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
  "message": "找不到指定的資源"
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

---

## 📝 資料模型

### Ticket 工單
| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 工單唯一識別碼 |
| deviceId | String | ✅ | 設備 ID |
| imageId | String | ❌ | 影像 ID |
| status | Enum | ✅ | 工單狀態 (OPEN/CLOSED) |
| createdAt | DateTime | ✅ | 建立時間 |
| updatedAt | DateTime | ✅ | 更新時間 |

### ProductionTarget 預生產目標
| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 目標唯一識別碼 |
| name | String | ✅ | 目標名稱 |
| description | String | ❌ | 目標描述 |
| expectedCompletionDate | String | ✅ | 預計完成時間 (YYYY-MM-DD) |
| status | Enum | ✅ | 目標狀態 (PLANNING/IN_PROGRESS/COMPLETED/CANCELLED) |
| createdAt | DateTime | ✅ | 建立時間 |
| updatedAt | DateTime | ✅ | 更新時間 |

### TicketSchedule 工單排程
| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 排程唯一識別碼 |
| ticketId | String | ✅ | 工單 ID |
| targetId | String | ✅ | 預生產目標 ID |
| scheduledDate | String | ✅ | 排程日期 (YYYY-MM-DD) |
| scheduledTime | String | ❌ | 排程時間 (HH:mm) |
| priority | Enum | ✅ | 優先級 (HIGH/MEDIUM/LOW) |
| status | Enum | ✅ | 排程狀態 (OPEN/IN_PROGRESS/COMPLETED/CANCELLED) |
| createdAt | DateTime | ✅ | 建立時間 |
| updatedAt | DateTime | ✅ | 更新時間 |

### Photo 照片
| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 照片唯一識別碼 |
| ticketId | String | ✅ | 工單 ID |
| filename | String | ✅ | 存儲文件名 |
| originalName | String | ✅ | 原始文件名 |
| filePath | String | ✅ | 文件路徑 |
| fileSize | Int | ✅ | 文件大小（字節） |
| mimeType | String | ✅ | MIME類型 |
| description | String | ❌ | 照片描述 |
| uploadedAt | DateTime | ✅ | 上傳時間 |

---

## 🔧 使用範例

### 使用 curl 測試 API

```bash
# 1. 檢查服務狀態
curl http://localhost:5000/health

# 2. 查看 API 資訊
curl http://localhost:5000/

# 3. 建立工單
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "CELL-001"}'

# 4. 查詢工單列表
curl http://localhost:5000/api/tickets?page=1&limit=10

# 5. 建立預生產目標
curl -X POST http://localhost:5000/api/targets \
  -H "Content-Type: application/json" \
  -d '{"name": "DS1-2", "expectedCompletionDate": "2025-11-30"}'

# 6. 建立工單排程
curl -X POST http://localhost:5000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "ticket123", "targetId": "target123", "scheduledDate": "2025-11-02"}'

# 7. 查詢今日排程（新功能）
curl "http://localhost:5000/api/schedules?date=2025-11-02&limit=1000"

# 8. 上傳照片
curl -X POST http://localhost:5000/api/photos/upload \
  -F "photo=@image.jpg" \
  -F "ticketId=ticket123" \
  -F "description=照片描述"
```

### 使用 JavaScript/Fetch

```javascript
// 建立工單
const createTicket = async (ticketData) => {
  const response = await fetch('http://localhost:5000/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  return await response.json();
};

// 查詢今日排程
const getTodaySchedules = async () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const response = await fetch(`http://localhost:5000/api/schedules?date=${today}&limit=1000`);
  return await response.json();
};

// 取得目標列表
const getTargets = async (page = 1, limit = 100) => {
  const response = await fetch(`http://localhost:5000/api/targets?page=${page}&limit=${limit}`);
  return await response.json();
};
```

---

## 📌 最新更新

### 新增功能（2025-11-02）
- ✅ **今日排程功能**: 在 `/api/schedules` 端點新增 `date` 查詢參數，支援按日期篩選排程
  - 使用方式: `GET /api/schedules?date=2025-11-02&limit=1000`
  - 可獲取指定日期的所有排程，方便實現「今日排程」功能

---

## 🔗 相關連結
- 前端應用: `http://localhost:3000`
- 後端 API: `http://localhost:5000`
- API 根路徑: `http://localhost:5000/`
- 健康檢查: `http://localhost:5000/health`

