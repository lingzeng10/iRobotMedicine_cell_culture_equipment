/**
 * 修復照片文件路徑
 * 更新數據庫中的 filePath 為正確的路徑
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

(async () => {
  try {
    console.log('開始修復照片文件路徑...\n');
    
    const photos = await prisma.photo.findMany();
    const uploadDir = path.join(__dirname, 'uploads');
    
    let fixedCount = 0;
    let skippedCount = 0;
    
    for (const photo of photos) {
      const dbPathExists = fs.existsSync(photo.filePath);
      const standardPath = path.join(uploadDir, photo.filename);
      const standardPathExists = fs.existsSync(standardPath);
      
      if (!dbPathExists && standardPathExists) {
        // 更新數據庫中的 filePath
        await prisma.photo.update({
          where: { id: photo.id },
          data: { filePath: standardPath }
        });
        
        console.log(`✓ 修復照片: ${photo.originalName}`);
        console.log(`  舊路徑: ${photo.filePath}`);
        console.log(`  新路徑: ${standardPath}\n`);
        fixedCount++;
      } else if (dbPathExists) {
        console.log(`- 跳過照片: ${photo.originalName} (路徑已正確)\n`);
        skippedCount++;
      } else {
        console.log(`✗ 無法修復照片: ${photo.originalName} (文件不存在)\n`);
      }
    }
    
    console.log('='.repeat(80));
    console.log(`修復完成:`);
    console.log(`  已修復: ${fixedCount}`);
    console.log(`  已跳過: ${skippedCount}`);
    console.log(`  無法修復: ${photos.length - fixedCount - skippedCount}`);
    
  } catch (error) {
    console.error('修復錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
})();

