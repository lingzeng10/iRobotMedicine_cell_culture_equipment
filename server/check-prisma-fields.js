const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFields() {
  try {
    console.log('\n檢查 Prisma Client 是否包含所有欄位...\n');
    
    // 嘗試查詢一個工單（如果存在）
    const tickets = await prisma.ticket.findMany({ take: 1 });
    
    if (tickets.length > 0) {
      const ticket = tickets[0];
      console.log('✓ 成功查詢工單');
      console.log('工單 ID:', ticket.id);
      console.log('設備 ID:', ticket.deviceId);
      console.log('\n檢查新添加的欄位:');
      
      // 檢查解凍工單欄位
      console.log('解凍工單欄位:');
      console.log('  thawCellName:', ticket.thawCellName !== undefined ? '✓ 存在' : '✗ 不存在');
      console.log('  thawCellGeneration:', ticket.thawCellGeneration !== undefined ? '✓ 存在' : '✗ 不存在');
      console.log('  thawOriginalMediumType:', ticket.thawOriginalMediumType !== undefined ? '✓ 存在' : '✗ 不存在');
      console.log('  thawFreezeDate:', ticket.thawFreezeDate !== undefined ? '✓ 存在' : '✗ 不存在');
      console.log('  thawTubeCount:', ticket.thawTubeCount !== undefined ? '✓ 存在' : '✗ 不存在');
      console.log('  thawMediumType:', ticket.thawMediumType !== undefined ? '✓ 存在' : '✗ 不存在');
      console.log('  thawCultureBoxCount:', ticket.thawCultureBoxCount !== undefined ? '✓ 存在' : '✗ 不存在');
      
      // 檢查凍存工單欄位
      console.log('\n凍存工單欄位:');
      console.log('  freezeBoxCount:', ticket.freezeBoxCount !== undefined ? '✓ 存在' : '✗ 不存在');
      console.log('  freezeTubeCount:', ticket.freezeTubeCount !== undefined ? '✓ 存在' : '✗ 不存在');
      console.log('  freezeTubeSpec:', ticket.freezeTubeSpec !== undefined ? '✓ 存在' : '✗ 不存在');
      console.log('  freezeMediumType:', ticket.freezeMediumType !== undefined ? '✓ 存在' : '✗ 不存在');
      
      // 檢查繼代工單欄位
      console.log('\n繼代工單欄位:');
      console.log('  subParentBoxCount:', ticket.subParentBoxCount !== undefined ? '✓ 存在' : '✗ 不存在');
      console.log('  subChildBoxCount:', ticket.subChildBoxCount !== undefined ? '✓ 存在' : '✗ 不存在');
      console.log('  subMediumType:', ticket.subMediumType !== undefined ? '✓ 存在' : '✗ 不存在');
      console.log('  subRecycledMediumType:', ticket.subRecycledMediumType !== undefined ? '✓ 存在' : '✗ 不存在');
      
    } else {
      console.log('資料庫中沒有工單記錄，無法檢查欄位');
      console.log('\n請執行以下步驟:');
      console.log('1. 確認已執行 "npm run db:push" 同步資料庫');
      console.log('2. 確認已執行 "npm run db:generate" 生成 Prisma Client');
      console.log('3. 重啟後端服務');
    }
  } catch (error) {
    console.error('檢查失敗:', error.message);
    if (error.message.includes('Unknown column') || error.message.includes('no such column')) {
      console.log('\n✗ 資料庫欄位不存在！');
      console.log('請執行: npm run db:push');
    } else if (error.message.includes('thawCellName') || error.message.includes('freezeBoxCount') || error.message.includes('subParentBoxCount')) {
      console.log('\n✗ Prisma Client 不包含新欄位！');
      console.log('請執行: npm run db:generate');
      console.log('然後重啟後端服務');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkFields();

