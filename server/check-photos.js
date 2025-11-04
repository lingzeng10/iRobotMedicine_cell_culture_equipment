/**
 * 診斷照片文件路徑問題
 * 檢查數據庫中的 filePath 是否與實際文件位置匹配
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

(async () => {
  try {
    console.log('開始診斷照片文件路徑問題...\n');
    
    const photos = await prisma.photo.findMany({
      orderBy: { uploadedAt: 'desc' }
    });
    
    console.log(`找到 ${photos.length} 張照片記錄\n`);
    console.log('='.repeat(80));
    
    if (photos.length === 0) {
      console.log('數據庫中沒有照片記錄');
    } else {
      // 標準上傳目錄
      const uploadDir = path.join(__dirname, 'uploads');
      console.log(`標準上傳目錄: ${uploadDir}\n`);
      
      let fixedCount = 0;
      let missingCount = 0;
      
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        console.log(`照片 ${i + 1}:`);
        console.log(`  ID: ${photo.id}`);
        console.log(`  原始名稱: ${photo.originalName}`);
        console.log(`  文件名: ${photo.filename}`);
        console.log(`  數據庫中的 filePath: ${photo.filePath}`);
        
        const dbPathExists = fs.existsSync(photo.filePath);
        const standardPath = path.join(uploadDir, photo.filename);
        const standardPathExists = fs.existsSync(standardPath);
        
        console.log(`  數據庫路徑存在: ${dbPathExists ? '✓' : '✗'}`);
        console.log(`  標準路徑存在: ${standardPathExists ? '✓' : '✗'}`);
        
        if (!dbPathExists && standardPathExists) {
          console.log(`  ⚠️  警告: 數據庫路徑不存在，但標準路徑存在！`);
          console.log(`     建議修復: 將 filePath 更新為 ${standardPath}`);
        } else if (!dbPathExists && !standardPathExists) {
          console.log(`  ❌ 錯誤: 兩個路徑都不存在，文件可能已丟失`);
          missingCount++;
        } else if (dbPathExists) {
          console.log(`  ✓ 文件路徑正確`);
        }
        
        console.log('');
      }
      
      console.log('='.repeat(80));
      console.log(`診斷完成:`);
      console.log(`  總照片數: ${photos.length}`);
      console.log(`  需要修復: ${photos.length - missingCount - fixedCount}`);
      console.log(`  文件丟失: ${missingCount}`);
    }
    
  } catch (error) {
    console.error('診斷錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
})();

