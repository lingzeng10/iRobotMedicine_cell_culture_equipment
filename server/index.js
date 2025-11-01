const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// 引入路由
const ticketRoutes = require('./routes/tickets');
const targetRoutes = require('./routes/targets');
const scheduleRoutes = require('./routes/schedules');
const photoRoutes = require('./routes/photos');
const versionRoutes = require('./routes/version');

// 建立 Express 應用程式
const app = express();
const PORT = process.env.PORT || 5000;

// 中介軟體設定
app.use(helmet()); // 安全性中介軟體
app.use(cors({
  origin: true, // 允許所有來源（開發環境）
  credentials: true
})); // 跨域請求設定
app.use(morgan('combined')); // 請求日誌
app.use(express.json({ limit: '10mb' })); // JSON 解析，支援 UTF-8
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL 編碼解析，支援 UTF-8

// 根路徑歡迎頁面
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '工單管理系統後端 API 服務',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tickets: '/api/tickets',
      targets: '/api/targets',
      schedules: '/api/schedules',
      photos: '/api/photos',
      version: '/api/version'
    },
    timestamp: new Date().toISOString()
  });
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '工單管理系統後端服務正常運行',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/api/tickets', ticketRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/version', versionRoutes);

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '找不到請求的資源'
  });
});

// 全域錯誤處理
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  res.status(500).json({
    success: false,
    message: '伺服器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
});

// 啟動伺服器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 工單管理系統後端服務已啟動`);
  console.log(`📍 服務地址: http://localhost:${PORT}`);
  console.log(`🌐 外部訪問: http://[您的IP地址]:${PORT}`);
  console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
});
