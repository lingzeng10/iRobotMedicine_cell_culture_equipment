/**
 * 工單 ID 生成工具
 * 
 * 工單 ID 格式：身分證(6碼) + 生產目標建立日期(8碼) + 生產目標代號(4碼) + 排程日期(8碼) + 流水號(2碼)
 * 總長度：28碼
 * 
 * 範例：
 * - 身分證：A00000 (6碼)
 * - 生產目標建立日期：20250115 (8碼)
 * - 生產目標代號：DS8-2 → DS82 (4碼)
 * - 排程日期：20250120 (8碼)
 * - 流水號：01 (2碼)
 * - 完整 ID：A0000020250115DS822025012001 (28碼)
 */

/**
 * 從生產目標名稱提取4碼英數字（去掉連字號）
 * @param {string} name - 生產目標名稱
 * @returns {string} 4碼英數字
 * @throws {Error} 如果提取後不是4碼英數字
 */
function extractTargetCode(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('生產目標名稱不能為空');
  }

  // 去掉連字號，只保留英文字母和數字
  const cleaned = name.replace(/[^a-zA-Z0-9]/g, '');

  // 檢查是否為4碼英數字
  if (cleaned.length !== 4) {
    throw new Error('生產目標應為4碼英數字');
  }

  // 檢查是否只包含英文字母和數字
  if (!/^[a-zA-Z0-9]{4}$/.test(cleaned)) {
    throw new Error('生產目標應為4碼英數字');
  }

  return cleaned.toUpperCase(); // 轉為大寫以保持一致性
}

/**
 * 格式化日期為 yyyyMMdd
 * @param {Date|string} date - 日期物件或日期字串
 * @returns {string} 格式化的日期字串 (yyyyMMdd)
 */
function formatDate(date) {
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    // 處理 ISO 格式字串（Prisma DateTime 可能返回這種格式）
    if (date.includes('T')) {
      dateObj = new Date(date);
    } else {
      // 處理 YYYY-MM-DD 格式
      dateObj = new Date(date + 'T00:00:00');
    }
  } else if (date && typeof date === 'object' && date.toISOString) {
    // 處理 Prisma DateTime 物件（如果有 toISOString 方法）
    dateObj = new Date(date.toISOString());
  } else {
    throw new Error(`無效的日期格式: ${typeof date}, 值: ${date}`);
  }

  // 檢查日期是否有效
  if (isNaN(dateObj.getTime())) {
    throw new Error(`無效的日期值: ${date}`);
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}${month}${day}`;
}

/**
 * 生成工單 ID
 * @param {Object} params
 * @param {string} params.idCard - 身分證（預設 A00000）
 * @param {Date|string} params.targetCreatedAt - 生產目標建立日期
 * @param {string} params.targetName - 生產目標名稱（如 "DS8-2"）
 * @param {string} params.scheduledDate - 工單預計排程日期 (YYYY-MM-DD)
 * @param {number} params.sequence - 流水號 (01-99)
 * @returns {string} 工單 ID (28碼)
 */
function generateTicketId({ 
  idCard = 'A00000', 
  targetCreatedAt,
  targetName,
  scheduledDate,
  sequence
}) {
  // 1. 身分證（6碼）
  const idCardPart = String(idCard).padEnd(6, '0').substring(0, 6).toUpperCase();

  // 2. 生產目標建立日期（8碼，yyyyMMdd）
  const targetCreatedDatePart = formatDate(targetCreatedAt);

  // 3. 生產目標代號（4碼，從名稱提取）
  const targetCodePart = extractTargetCode(targetName);

  // 4. 工單預計排程日期（8碼，yyyyMMdd）
  const scheduledDatePart = scheduledDate.replace(/-/g, '');

  // 5. 流水號（2碼，01-99）
  if (sequence < 1 || sequence > 99) {
    throw new Error('流水號必須在 01-99 之間');
  }
  const sequencePart = String(sequence).padStart(2, '0');

  return `${idCardPart}${targetCreatedDatePart}${targetCodePart}${scheduledDatePart}${sequencePart}`;
}

/**
 * 計算流水號
 * 查詢同一生產目標、同一建立日期、同一排程日期的工單數量
 * @param {Object} prisma - Prisma 客戶端（可以是事務客戶端）
 * @param {string} targetId - 生產目標 ID
 * @param {Date|string} targetCreatedAt - 生產目標建立日期
 * @param {string} scheduledDate - 排程日期 (YYYY-MM-DD)
 * @returns {Promise<number>} 下一個流水號 (1-99)
 */
async function calculateSequence(prisma, targetId, targetCreatedAt, scheduledDate) {
  // 格式化生產目標建立日期
  const targetCreatedDateStr = formatDate(targetCreatedAt);

  // 查詢同一生產目標的所有排程（在事務中查詢）
  const schedules = await prisma.ticketSchedule.findMany({
    where: {
      targetId: targetId,
      scheduledDate: scheduledDate, // 同一排程日期
    },
    include: {
      ticket: true,
      target: true,
    },
  });

  // 過濾出同一生產目標建立日期的工單
  const matchingTickets = schedules.filter(schedule => {
    const ticketCreatedDateStr = formatDate(schedule.target.createdAt);
    return ticketCreatedDateStr === targetCreatedDateStr;
  });

  // 計算流水號（從 1 開始）
  const sequence = matchingTickets.length + 1;

  if (sequence > 99) {
    throw new Error('同一生產目標、同一建立日期、同一排程日期的工單數量已達上限（99）');
  }

  return sequence;
}

module.exports = {
  generateTicketId,
  extractTargetCode,
  formatDate,
  calculateSequence,
};

