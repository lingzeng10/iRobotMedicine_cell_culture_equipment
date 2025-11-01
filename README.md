# 工單管理系統

一個基於 React + Express + Prisma + PostgreSQL 的完整工單管理系統，支援工單的建立、查詢、更新等功能。

## 🚀 功能特色

- **工單建立**：支援輸入設備 ID、影像 ID、描述建立新工單
- **工單查詢**：支援根據狀態、設備 ID 篩選工單列表
- **工單更新**：支援修改工單狀態和描述
- **響應式設計**：適配各種螢幕尺寸
- **即時更新**：操作後自動重新整理列表
- **表單驗證**：前後端雙重資料驗證

## 🛠 技術棧

### 後端
- **Node.js** + **Express.js** - 後端框架
- **Prisma** - 資料庫 ORM
- **PostgreSQL** - 關聯式資料庫
- **express-validator** - 資料驗證
- **cors** - 跨域請求處理

### 前端
- **React 18** - 前端框架
- **TypeScript** - 型別安全
- **Ant Design** - UI 元件庫
- **Axios** - HTTP 客戶端
- **React Router** - 路由管理

## 📁 專案結構

```
ticket-management-system/
├── server/                 # 後端程式碼
│   ├── lib/
│   │   └── prisma.js      # Prisma 客戶端設定
│   ├── routes/
│   │   └── tickets.js     # 工單 API 路由
│   ├── prisma/
│   │   └── schema.prisma  # 資料庫模型定義
│   ├── package.json       # 後端依賴
│   └── index.js          # 後端入口檔案
├── client/                # 前端程式碼
│   ├── public/           # 靜態資源
│   ├── src/
│   │   ├── components/   # React 元件
│   │   ├── services/     # API 服務
│   │   ├── types/       # TypeScript 型別定義
│   │   └── App.tsx      # 主應用程式
│   └── package.json     # 前端依賴
└── package.json         # 根目錄依賴
```

## 🚀 快速開始

### 環境需求

- Node.js >= 16.0.0
- PostgreSQL >= 12.0
- npm 或 yarn

### 1. 安裝依賴

```bash
# 安裝根目錄依賴
npm install

# 安裝後端依賴
cd server
npm install

# 安裝前端依賴
cd ../client
npm install
```

### 2. 資料庫設定

1. 建立 PostgreSQL 資料庫：
```sql
CREATE DATABASE ticket_management;
```

2. 複製環境變數檔案：
```bash
cd server
cp env.example .env
```

3. 修改 `.env` 檔案中的資料庫連線資訊：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ticket_management?schema=public"
```

4. 執行資料庫遷移：
```bash
cd server
npm run db:push
```

### 3. 啟動應用程式

#### 方式一：同時啟動前後端（推薦）
```bash
# 在根目錄執行
npm run dev
```

#### 方式二：分別啟動
```bash
# 啟動後端（終端機 1）
cd server
npm run dev

# 啟動前端（終端機 2）
cd client
npm start
```

### 4. 存取應用程式

- **前端應用**：http://localhost:3000
- **後端 API**：http://localhost:5000
- **API 文件**：http://localhost:5000/health

## 📚 API 文件

### 工單 API

#### 建立工單
```http
POST /api/tickets
Content-Type: application/json

{
  "deviceId": "DEVICE001",
  "imageId": "IMG001",
  "description": "設備故障需要維修"
}
```

#### 查詢工單列表
```http
GET /api/tickets?status=OPEN&deviceId=DEVICE001&page=1&limit=10
```

#### 查詢工單詳情
```http
GET /api/tickets/{id}
```

#### 更新工單
```http
PUT /api/tickets/{id}
Content-Type: application/json

{
  "status": "CLOSED",
  "description": "問題已解決"
}
```

## 🗄 資料庫模型

### Ticket 工單表

| 欄位 | 型別 | 說明 |
|------|------|------|
| id | String | 工單唯一識別碼 |
| deviceId | String | 設備 ID |
| imageId | String? | 影像 ID（可選） |
| description | String | 工單描述 |
| status | Status | 工單狀態（OPEN/CLOSED） |
| createdAt | DateTime | 建立時間 |
| updatedAt | DateTime | 更新時間 |

## 🎨 前端元件

### TicketForm
- 工單建立表單
- 支援表單驗證
- 成功後自動重置

### TicketList
- 工單列表顯示
- 支援搜尋和篩選
- 分頁功能
- 狀態更新操作

### TicketDetail
- 工單詳情顯示
- 支援編輯功能
- Modal 彈窗形式

## 🔧 開發指令

```bash
# 後端開發
cd server
npm run dev          # 啟動開發伺服器
npm run db:generate  # 產生 Prisma 客戶端
npm run db:push      # 推送資料庫變更
npm run db:studio    # 開啟 Prisma Studio

# 前端開發
cd client
npm start           # 啟動開發伺服器
npm run build       # 建置生產版本
npm test           # 執行測試
```

## 🚀 部署

### 後端部署
1. 設定生產環境變數
2. 執行 `npm run build`
3. 使用 PM2 或 Docker 部署

### 前端部署
1. 執行 `npm run build`
2. 將 `build` 資料夾部署到靜態檔案伺服器

## 🤝 貢獻

1. Fork 專案
2. 建立功能分支
3. 提交變更
4. 發送 Pull Request

## 📄 授權

MIT License

## 📞 支援

如有問題請提交 Issue 或聯繫開發團隊。
