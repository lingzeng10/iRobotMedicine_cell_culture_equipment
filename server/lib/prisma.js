const { PrismaClient } = require('@prisma/client');

// 建立 Prisma 客戶端實例
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // 啟用日誌記錄
});

// 優雅關閉處理
process.on('beforeExit', async () => {
  console.log('正在關閉 Prisma 連線...');
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  console.log('收到 SIGINT 信號，正在關閉 Prisma 連線...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('收到 SIGTERM 信號，正在關閉 Prisma 連線...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;
