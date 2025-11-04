const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// 將日期物件轉換為字串的輔助函數
function formatDate(date) {
  if (!date) return '';
  if (typeof date === 'string') return date;
  if (date instanceof Date) {
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
  return String(date);
}

// 將物件陣列轉換為 Excel 工作表格式
function prepareWorksheet(data, headers) {
  if (data.length === 0) {
    return [headers];
  }

  // 轉換資料
  const rows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      if (value instanceof Date) return formatDate(value);
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    });
  });

  return [headers, ...rows];
}

async function exportToExcel() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          資料匯出為 Excel                                       ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log('正在讀取資料庫...');

    // 讀取所有資料
    const tickets = await prisma.ticket.findMany({
      include: {
        schedules: true,
        photos: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const targets = await prisma.productionTarget.findMany({
      include: {
        schedules: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const schedules = await prisma.ticketSchedule.findMany({
      include: {
        ticket: {
          select: {
            id: true,
            deviceId: true,
            status: true,
          },
        },
        target: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { scheduledDate: 'desc' },
    });

    const photos = await prisma.photo.findMany({
      include: {
        ticket: {
          select: {
            id: true,
            deviceId: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    console.log(`✓ 讀取完成: 工單 ${tickets.length} 筆, 生產目標 ${targets.length} 筆, 排程 ${schedules.length} 筆, 照片 ${photos.length} 筆\n`);

    // 建立新的工作簿
    const workbook = XLSX.utils.book_new();

    // 1. 工單工作表
    if (tickets.length > 0) {
      console.log('正在處理工單資料...');
      const ticketHeaders = [
        'ID',
        '工單類型',
        '狀態',
        '影像ID',
        '拍照倍數',
        '張數',
        '培養液種類',
        '回收培養液種類',
        '親代盒數(繼代凍存)',
        '子代盒數(繼代凍存)',
        '繼代培養液種類',
        '回收培養液種類(繼代凍存)',
        '凍存細胞盒數',
        '凍管規格(繼代凍存)',
        '凍液種類(繼代凍存)',
        '凍管數量(繼代凍存)',
        '解凍細胞',
        '細胞凍存代數',
        '細胞凍存原培養液',
        '凍管凍存日期',
        '解凍支數',
        '解凍培養液',
        '解凍培養盒數',
        '凍存盒數',
        '凍管數量(凍存)',
        '凍管規格(凍存)',
        '凍液種類(凍存)',
        '親代盒數(繼代)',
        '子代盒數(繼代)',
        '繼代培養液種類(繼代)',
        '回收培養液種類(繼代)',
        '回收/丟盒數',
        '回收培養液種類(回收/丟棄)',
        '排程數',
        '照片數',
        '建立時間',
        '更新時間',
      ];

      const ticketData = tickets.map(ticket => ({
        'ID': ticket.id,
        '工單類型': ticket.deviceId,
        '狀態': ticket.status,
        '影像ID': ticket.imageId || '',
        '拍照倍數': ticket.magnification || '',
        '張數': ticket.photoCount !== null ? ticket.photoCount : '',
        '培養液種類': ticket.mediumType || '',
        '回收培養液種類': ticket.recycledMediumType || '',
        '親代盒數(繼代凍存)': ticket.parentBoxCount !== null ? ticket.parentBoxCount : '',
        '子代盒數(繼代凍存)': ticket.childBoxCount !== null ? ticket.childBoxCount : '',
        '繼代培養液種類': ticket.subcultureMediumType || '',
        '回收培養液種類(繼代凍存)': ticket.subcultureRecycledMediumType || '',
        '凍存細胞盒數': ticket.frozenCellBoxCount !== null ? ticket.frozenCellBoxCount : '',
        '凍管規格(繼代凍存)': ticket.frozenTubeSpec || '',
        '凍液種類(繼代凍存)': ticket.frozenMediumType || '',
        '凍管數量(繼代凍存)': ticket.frozenTubeCount !== null ? ticket.frozenTubeCount : '',
        '解凍細胞': ticket.thawCellName || '',
        '細胞凍存代數': ticket.thawCellGeneration !== null ? ticket.thawCellGeneration : '',
        '細胞凍存原培養液': ticket.thawOriginalMediumType || '',
        '凍管凍存日期': ticket.thawFreezeDate || '',
        '解凍支數': ticket.thawTubeCount !== null ? ticket.thawTubeCount : '',
        '解凍培養液': ticket.thawMediumType || '',
        '解凍培養盒數': ticket.thawCultureBoxCount !== null ? ticket.thawCultureBoxCount : '',
        '凍存盒數': ticket.freezeBoxCount !== null ? ticket.freezeBoxCount : '',
        '凍管數量(凍存)': ticket.freezeTubeCount !== null ? ticket.freezeTubeCount : '',
        '凍管規格(凍存)': ticket.freezeTubeSpec || '',
        '凍液種類(凍存)': ticket.freezeMediumType || '',
        '親代盒數(繼代)': ticket.subParentBoxCount !== null ? ticket.subParentBoxCount : '',
        '子代盒數(繼代)': ticket.subChildBoxCount !== null ? ticket.subChildBoxCount : '',
        '繼代培養液種類(繼代)': ticket.subMediumType || '',
        '回收培養液種類(繼代)': ticket.subRecycledMediumType || '',
        '回收/丟盒數': ticket.collectDiscardBoxCount !== null ? ticket.collectDiscardBoxCount : '',
        '回收培養液種類(回收/丟棄)': ticket.collectDiscardRecycledMediumType || '',
        '排程數': ticket.schedules.length,
        '照片數': ticket.photos.length,
        '建立時間': formatDate(ticket.createdAt),
        '更新時間': formatDate(ticket.updatedAt),
      }));

      const ticketWorksheet = XLSX.utils.json_to_sheet(ticketData);
      XLSX.utils.book_append_sheet(workbook, ticketWorksheet, '工單');
      console.log('✓ 工單工作表已建立');
    }

    // 2. 生產目標工作表
    if (targets.length > 0) {
      console.log('正在處理生產目標資料...');
      const targetData = targets.map(target => ({
        'ID': target.id,
        '名稱': target.name,
        '收集原料種類': target.materialType || '',
        '負責人員': target.responsiblePerson || '',
        '預計完成日期': target.expectedCompletionDate,
        '狀態': target.status,
        '排程數': target.schedules.length,
        '建立時間': formatDate(target.createdAt),
        '更新時間': formatDate(target.updatedAt),
      }));

      const targetWorksheet = XLSX.utils.json_to_sheet(targetData);
      XLSX.utils.book_append_sheet(workbook, targetWorksheet, '生產目標');
      console.log('✓ 生產目標工作表已建立');
    }

    // 3. 排程工作表
    if (schedules.length > 0) {
      console.log('正在處理排程資料...');
      const scheduleData = schedules.map(schedule => ({
        'ID': schedule.id,
        '工單ID': schedule.ticketId,
        '工單類型': schedule.ticket?.deviceId || '',
        '工單狀態': schedule.ticket?.status || '',
        '生產目標ID': schedule.targetId,
        '生產目標名稱': schedule.target?.name || '',
        '生產目標狀態': schedule.target?.status || '',
        '排程日期': schedule.scheduledDate,
        '排程時間': schedule.scheduledTime || '',
        '優先級': schedule.priority,
        '狀態': schedule.status,
        '建立時間': formatDate(schedule.createdAt),
        '更新時間': formatDate(schedule.updatedAt),
      }));

      const scheduleWorksheet = XLSX.utils.json_to_sheet(scheduleData);
      XLSX.utils.book_append_sheet(workbook, scheduleWorksheet, '排程');
      console.log('✓ 排程工作表已建立');
    }

    // 4. 照片工作表
    if (photos.length > 0) {
      console.log('正在處理照片資料...');
      const photoData = photos.map(photo => ({
        'ID': photo.id,
        '工單ID': photo.ticketId,
        '工單類型': photo.ticket?.deviceId || '',
        '檔案名稱': photo.filename,
        '原始名稱': photo.originalName,
        '檔案路徑': photo.filePath,
        '檔案大小(位元組)': photo.fileSize,
        '檔案大小(KB)': Math.round(photo.fileSize / 1024 * 100) / 100,
        'MIME類型': photo.mimeType,
        '描述': photo.description || '',
        '上傳時間': formatDate(photo.uploadedAt),
      }));

      const photoWorksheet = XLSX.utils.json_to_sheet(photoData);
      XLSX.utils.book_append_sheet(workbook, photoWorksheet, '照片');
      console.log('✓ 照片工作表已建立');
    }

    // 5. 建立摘要工作表
    console.log('正在建立摘要工作表...');
    const summaryData = [
      { '項目': '工單總數', '數量': tickets.length },
      { '項目': '生產目標總數', '數量': targets.length },
      { '項目': '排程總數', '數量': schedules.length },
      { '項目': '照片總數', '數量': photos.length },
      { '項目': '匯出時間', '數量': formatDate(new Date()) },
    ];

    const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summaryWorksheet, '摘要');

    // 儲存 Excel 檔案
    const exportDir = path.join(__dirname, 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `工單資料匯出_${timestamp}.xlsx`;
    const filepath = path.join(exportDir, filename);

    XLSX.writeFile(workbook, filepath);

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          匯出完成！                                           ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log(`\n檔案位置: ${filepath}`);
    console.log(`\n包含的工作表:`);
    console.log(`  ✓ 摘要 (統計資訊)`);
    if (tickets.length > 0) console.log(`  ✓ 工單 (${tickets.length} 筆)`);
    if (targets.length > 0) console.log(`  ✓ 生產目標 (${targets.length} 筆)`);
    if (schedules.length > 0) console.log(`  ✓ 排程 (${schedules.length} 筆)`);
    if (photos.length > 0) console.log(`  ✓ 照片 (${photos.length} 筆)`);
    console.log('');

  } catch (error) {
    console.error('\n❌ 匯出錯誤:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// 執行匯出
exportToExcel();

