# 工單管理系統 - 後端 API

基於 Express.js + Prisma + PostgreSQL 的工單管理後端 API。

## 🚀 快速開始

### 1. 安裝依賴
```bash
npm install
```

### 2. 設定環境變數
```bash
cp env.example .env
```

修改 `.env` 檔案：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/ticket_management?schema=public"
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### 3. 設定資料庫
```bash
# 產生 Prisma 客戶端
npm run db:generate

# 推送資料庫結構
npm run db:push
```

### 4. 啟動伺服器
```bash
# 開發模式
npm run dev

# 生產模式
npm start
```

## 📚 API 端點

### 健康檢查
- **GET** `/health` - 檢查服務狀態

### 工單管理
- **POST** `/api/tickets` - 建立工單
- **GET** `/api/tickets` - 查詢工單列表
- **GET** `/api/tickets/:id` - 查詢工單詳情
- **PUT** `/api/tickets/:id` - 更新工單

## 🔧 開發指令

```bash
npm run dev          # 啟動開發伺服器
npm start           # 啟動生產伺服器
npm run db:generate # 產生 Prisma 客戶端
npm run db:push     # 推送資料庫變更
npm run db:studio   # 開啟 Prisma Studio
```

## 🗄 資料庫模型

### Ticket 工單
```prisma
model Ticket {
  id          String   @id @default(cuid())
  deviceId    String
  imageId     String?
  description String
  status      Status   @default(OPEN)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Status 狀態
```prisma
enum Status {
  OPEN
  CLOSED
}
```

## 🛡 安全性

- 使用 Helmet 提供安全性標頭
- CORS 跨域請求控制
- 輸入資料驗證
- 錯誤處理和日誌記錄

## 📝 日誌

- 使用 Morgan 記錄 HTTP 請求
- Prisma 查詢日誌
- 錯誤日誌記錄

## 🚀 部署

### 使用 PM2
```bash
npm install -g pm2
pm2 start index.js --name "ticket-api"
```

### 使用 Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```
