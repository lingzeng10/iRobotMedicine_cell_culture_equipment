const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          資料庫內容檢查                                       ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // 1. 檢查工單 (Tickets)
    console.log('📋 工單資料 (Tickets)');
    console.log('──────────────────────────────────────────────────────────────');
    const tickets = await prisma.ticket.findMany({
      include: {
        schedules: true,
        photos: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`總數: ${tickets.length} 筆\n`);
    
    if (tickets.length > 0) {
      tickets.forEach((ticket, index) => {
        console.log(`${index + 1}. 工單 ID: ${ticket.id}`);
        console.log(`   設備 ID: ${ticket.deviceId}`);
        console.log(`   狀態: ${ticket.status}`);
        console.log(`   影像 ID: ${ticket.imageId || '(無)'}`);
        console.log(`   排程數: ${ticket.schedules.length}`);
        console.log(`   照片數: ${ticket.photos.length}`);
        console.log(`   建立時間: ${ticket.createdAt.toLocaleString('zh-TW')}`);
        console.log(`   更新時間: ${ticket.updatedAt.toLocaleString('zh-TW')}`);
        console.log('');
      });
    } else {
      console.log('  (無資料)\n');
    }

    // 2. 檢查生產目標 (ProductionTargets)
    console.log('🎯 生產目標資料 (ProductionTargets)');
    console.log('──────────────────────────────────────────────────────────────');
    const targets = await prisma.productionTarget.findMany({
      include: {
        schedules: {
          include: {
            ticket: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`總數: ${targets.length} 筆\n`);
    
    if (targets.length > 0) {
      targets.forEach((target, index) => {
        console.log(`${index + 1}. 目標 ID: ${target.id}`);
        console.log(`   名稱: ${target.name}`);
        console.log(`   描述: ${target.description || '(無)'}`);
        console.log(`   預計完成日期: ${target.expectedCompletionDate}`);
        console.log(`   狀態: ${target.status}`);
        console.log(`   排程數: ${target.schedules.length}`);
        console.log(`   建立時間: ${target.createdAt.toLocaleString('zh-TW')}`);
        console.log(`   更新時間: ${target.updatedAt.toLocaleString('zh-TW')}`);
        console.log('');
      });
    } else {
      console.log('  (無資料)\n');
    }

    // 3. 檢查工單排程 (TicketSchedules)
    console.log('📅 工單排程資料 (TicketSchedules)');
    console.log('──────────────────────────────────────────────────────────────');
    const schedules = await prisma.ticketSchedule.findMany({
      include: {
        ticket: true,
        target: true,
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' },
      ]
    });
    console.log(`總數: ${schedules.length} 筆\n`);
    
    if (schedules.length > 0) {
      schedules.forEach((schedule, index) => {
        console.log(`${index + 1}. 排程 ID: ${schedule.id}`);
        console.log(`   工單 ID: ${schedule.ticketId}`);
        console.log(`   目標名稱: ${schedule.target.name}`);
        console.log(`   排程日期: ${schedule.scheduledDate}`);
        console.log(`   排程時間: ${schedule.scheduledTime || '(無)'}`);
        console.log(`   優先級: ${schedule.priority}`);
        console.log(`   狀態: ${schedule.status}`);
        console.log(`   建立時間: ${schedule.createdAt.toLocaleString('zh-TW')}`);
        console.log('');
      });
    } else {
      console.log('  (無資料)\n');
    }

    // 4. 檢查照片 (Photos)
    console.log('📷 照片資料 (Photos)');
    console.log('──────────────────────────────────────────────────────────────');
    const photos = await prisma.photo.findMany({
      include: {
        ticket: true,
      },
      orderBy: { uploadedAt: 'desc' }
    });
    console.log(`總數: ${photos.length} 筆\n`);
    
    if (photos.length > 0) {
      photos.forEach((photo, index) => {
        const fileSizeKB = (photo.fileSize / 1024).toFixed(2);
        console.log(`${index + 1}. 照片 ID: ${photo.id}`);
        console.log(`   工單 ID: ${photo.ticketId}`);
        console.log(`   原始檔名: ${photo.originalName}`);
        console.log(`   檔案大小: ${fileSizeKB} KB`);
        console.log(`   MIME 類型: ${photo.mimeType}`);
        console.log(`   描述: ${photo.description || '(無)'}`);
        console.log(`   上傳時間: ${photo.uploadedAt.toLocaleString('zh-TW')}`);
        console.log('');
      });
    } else {
      console.log('  (無資料)\n');
    }

    // 5. 統計摘要
    console.log('📊 資料統計摘要');
    console.log('──────────────────────────────────────────────────────────────');
    const ticketCount = await prisma.ticket.count();
    const targetCount = await prisma.productionTarget.count();
    const scheduleCount = await prisma.ticketSchedule.count();
    const photoCount = await prisma.photo.count();

    console.log(`工單總數: ${ticketCount}`);
    console.log(`生產目標總數: ${targetCount}`);
    console.log(`排程總數: ${scheduleCount}`);
    console.log(`照片總數: ${photoCount}`);
    console.log('');

    // 狀態統計
    const ticketStatusStats = await prisma.ticket.groupBy({
      by: ['status'],
      _count: true,
    });
    console.log('工單狀態分布:');
    ticketStatusStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count} 筆`);
    });
    console.log('');

    const targetStatusStats = await prisma.productionTarget.groupBy({
      by: ['status'],
      _count: true,
    });
    console.log('目標狀態分布:');
    targetStatusStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count} 筆`);
    });
    console.log('');

    const scheduleStatusStats = await prisma.ticketSchedule.groupBy({
      by: ['status'],
      _count: true,
    });
    console.log('排程狀態分布:');
    scheduleStatusStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count} 筆`);
    });
    console.log('');

    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║          資料檢查完成                                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('❌ 檢查資料庫時發生錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

