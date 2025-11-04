const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 建立工單排程
 * POST /api/schedules
 * 請求體：
 * - ticketId: 工單 ID (必填)
 * - targetId: 預生產目標 ID (必填)
 * - scheduledDate: 排程日期 (必填)
 * - scheduledTime: 排程時間 (可選)
 * - priority: 優先級 (可選，預設: MEDIUM)
 */
router.post('/', [
  body('ticketId')
    .isString()
    .notEmpty()
    .withMessage('工單 ID 不能為空'),
  body('targetId')
    .isString()
    .notEmpty()
    .withMessage('預生產目標 ID 不能為空'),
  body('scheduledDate')
    .isString()
    .notEmpty()
    .withMessage('排程日期不能為空')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('排程日期格式必須為 YYYY-MM-DD'),
  body('scheduledTime')
    .optional()
    .isString()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('排程時間格式必須為 HH:mm'),
  body('priority')
    .optional()
    .isIn(['HIGH', 'MEDIUM', 'LOW'])
    .withMessage('優先級必須為 HIGH, MEDIUM, 或 LOW'),
], async (req, res) => {
  try {
    // 驗證請求體
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求資料驗證失敗',
        errors: errors.array(),
      });
    }

    const { ticketId, targetId, scheduledDate, scheduledTime, priority = 'MEDIUM' } = req.body;

    // 檢查日期不能是今天之前
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const scheduleDate = new Date(scheduledDate + 'T00:00:00');
    
    if (scheduleDate < today) {
      return res.status(400).json({
        success: false,
        message: '不能排程今日以前的工單，請選擇今日或未來的日期',
      });
    }

    // 檢查工單是否存在
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: '工單不存在',
      });
    }

    // 檢查預生產目標是否存在
    const target = await prisma.productionTarget.findUnique({
      where: { id: targetId },
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: '預生產目標不存在',
      });
    }

    // 檢查是否已經存在相同的排程
    const existingSchedule = await prisma.ticketSchedule.findFirst({
      where: {
        ticketId,
        targetId,
        scheduledDate,
      },
    });

    if (existingSchedule) {
      return res.status(409).json({
        success: false,
        message: '該工單在此目標下已有相同日期的排程',
      });
    }

    // 建立新排程
    const schedule = await prisma.ticketSchedule.create({
      data: {
        ticketId,
        targetId,
        scheduledDate,
        scheduledTime: scheduledTime || null,
        priority,
        status: 'OPEN', // 預設狀態為待處理
      },
      include: {
        ticket: true,
        target: true,
      },
    });

    // 如果目標狀態為「規劃中」，自動更新為「進行中」
    if (target.status === 'PLANNING') {
      await prisma.productionTarget.update({
        where: { id: targetId },
        data: { status: 'IN_PROGRESS' },
      });
      
      // 更新回傳的目標資料
      schedule.target.status = 'IN_PROGRESS';
    }

    res.status(201).json({
      success: true,
      message: '建立工單排程成功',
      data: schedule,
    });
  } catch (error) {
    console.error('建立工單排程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '建立工單排程失敗',
      error: error.message,
    });
  }
});

/**
 * 更新工單排程
 * PUT /api/schedules/:id
 * 請求體：
 * - scheduledDate: 排程日期 (可選)
 * - scheduledTime: 排程時間 (可選)
 * - priority: 優先級 (可選)
 * - status: 排程狀態 (可選)
 * - deviceId: 工單類型 (可選，更新工單的 deviceId)
 */
router.put('/:id', [
  param('id').isString().notEmpty().withMessage('排程 ID 不能為空'),
  body('scheduledDate')
    .optional()
    .isString()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('排程日期格式必須為 YYYY-MM-DD'),
  body('scheduledTime')
    .optional()
    .isString()
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('排程時間格式必須為 HH:mm'),
  body('priority')
    .optional()
    .isIn(['HIGH', 'MEDIUM', 'LOW'])
    .withMessage('優先級必須為 HIGH, MEDIUM, 或 LOW'),
  body('status')
    .optional()
    .isIn(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .withMessage('排程狀態必須為 OPEN, IN_PROGRESS, COMPLETED, 或 CANCELLED'),
  body('deviceId')
    .optional()
    .isString()
    .notEmpty()
    .withMessage('工單類型不能為空'),
], async (req, res) => {
  try {
    // 驗證參數和請求體
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求資料驗證失敗',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = {};

    // 只更新提供的欄位
    if (req.body.scheduledDate !== undefined) {
      // 檢查日期不能是今天之前
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const scheduleDate = new Date(req.body.scheduledDate + 'T00:00:00');
      
      if (scheduleDate < today) {
        return res.status(400).json({
          success: false,
          message: '不能排程今日以前的工單，請選擇今日或未來的日期',
        });
      }
      
      updateData.scheduledDate = req.body.scheduledDate;
    }
    if (req.body.scheduledTime !== undefined) updateData.scheduledTime = req.body.scheduledTime;
    if (req.body.priority !== undefined) updateData.priority = req.body.priority;
    if (req.body.status !== undefined) updateData.status = req.body.status;

    // 檢查排程是否存在
    const existingSchedule = await prisma.ticketSchedule.findUnique({
      where: { id },
      include: {
        ticket: true,
      },
    });

    if (!existingSchedule) {
      return res.status(404).json({
        success: false,
        message: '工單排程不存在',
      });
    }

    // 如果提供了 deviceId，需要更新對應的工單
    if (req.body.deviceId !== undefined) {
      // 更新工單的 deviceId
      await prisma.ticket.update({
        where: { id: existingSchedule.ticketId },
        data: {
          deviceId: req.body.deviceId,
        },
      });
    }

    // 更新排程
    const updatedSchedule = await prisma.ticketSchedule.update({
      where: { id },
      data: updateData,
      include: {
        ticket: true,
        target: true,
      },
    });

    // 如果更新了狀態為「進行中」，檢查是否為該目標的第一個排程
    if (req.body.status === 'IN_PROGRESS') {
      const targetId = existingSchedule.targetId;
      
      console.log(`[排程更新] 檢查排程 ${id}，目標 ${targetId}，狀態已更新為「進行中」`);
      
      // 先查詢目標的當前狀態
      const currentTarget = await prisma.productionTarget.findUnique({
        where: { id: targetId },
      });
      
      console.log(`[排程更新] 目標 ${targetId} 當前狀態: ${currentTarget?.status}`);
      
      // 如果目標狀態已經是「進行中」，不需要再次更新
      if (currentTarget && currentTarget.status !== 'IN_PROGRESS') {
        // 查詢該目標的所有排程，按日期和時間排序
        // 使用 JavaScript 排序以正確處理 null 值
        const allSchedulesRaw = await prisma.ticketSchedule.findMany({
          where: { targetId },
        });

        console.log(`[排程更新] 目標 ${targetId} 共有 ${allSchedulesRaw.length} 個排程`);

        // 在 JavaScript 中排序：按日期、時間、創建時間排序
        const allSchedules = allSchedulesRaw.sort((a, b) => {
          // 先按日期排序
          const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
          if (dateCompare !== 0) return dateCompare;
          
          // 如果日期相同，按時間排序（null 值排在後面）
          if (a.scheduledTime && b.scheduledTime) {
            const timeCompare = a.scheduledTime.localeCompare(b.scheduledTime);
            if (timeCompare !== 0) return timeCompare;
          } else if (a.scheduledTime && !b.scheduledTime) {
            return -1; // a 有時間，b 沒有，a 排在前面
          } else if (!a.scheduledTime && b.scheduledTime) {
            return 1; // a 沒有時間，b 有，b 排在前面
          }
          
          // 如果日期和時間都相同（或都為 null），按創建時間排序
          return new Date(a.createdAt) - new Date(b.createdAt);
        });

        // 顯示排序後的第一個排程
        if (allSchedules.length > 0) {
          console.log(`[排程更新] 第一個排程 ID: ${allSchedules[0].id}，日期: ${allSchedules[0].scheduledDate}，時間: ${allSchedules[0].scheduledTime || '無'}`);
          console.log(`[排程更新] 當前更新的排程 ID: ${id}`);
        }

        // 檢查更新後的排程是否為第一個排程
        if (allSchedules.length > 0 && allSchedules[0].id === id) {
          console.log(`[排程更新] ✓ 這是第一個排程，開始更新目標狀態為「進行中」`);
          
          // 這是第一個排程，更新目標狀態為「進行中」
          await prisma.productionTarget.update({
            where: { id: targetId },
            data: { status: 'IN_PROGRESS' },
          });
          
          // 更新回傳的目標資料
          updatedSchedule.target.status = 'IN_PROGRESS';
          
          console.log(`[排程更新] ✓ 目標 ${targetId} 的第一個排程已開始，已自動更新目標狀態為「進行中」`);
        } else {
          console.log(`[排程更新] ✗ 這不是第一個排程，不更新目標狀態`);
        }
      } else {
        console.log(`[排程更新] ✗ 目標狀態已經是「進行中」，無需更新`);
      }
    }

    res.json({
      success: true,
      message: '更新工單排程成功',
      data: updatedSchedule,
    });
  } catch (error) {
    console.error('更新工單排程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新工單排程失敗',
      error: error.message,
    });
  }
});

/**
 * 刪除工單排程
 * DELETE /api/schedules/:id
 */
router.delete('/:id', [
  param('id').isString().notEmpty().withMessage('排程 ID 不能為空'),
], async (req, res) => {
  try {
    // 驗證參數
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '參數驗證失敗',
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    // 檢查排程是否存在
    const existingSchedule = await prisma.ticketSchedule.findUnique({
      where: { id },
    });

    if (!existingSchedule) {
      return res.status(404).json({
        success: false,
        message: '工單排程不存在',
      });
    }

    // 刪除排程
    await prisma.ticketSchedule.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: '刪除工單排程成功',
    });
  } catch (error) {
    console.error('刪除工單排程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除工單排程失敗',
      error: error.message,
    });
  }
});

/**
 * 取得所有工單排程
 * GET /api/schedules
 * 查詢參數：
 * - page: 頁碼 (預設: 1)
 * - limit: 每頁數量 (預設: 10)
 * - targetId: 目標 ID 篩選 (可選)
 * - ticketId: 工單 ID 篩選 (可選)
 * - status: 狀態篩選 (可選)
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const targetId = req.query.targetId;
    const ticketId = req.query.ticketId;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // 建立查詢條件
    const where = {};
    if (targetId) where.targetId = targetId;
    if (ticketId) where.ticketId = ticketId;
    if (status) where.status = status;
    if (req.query.date) where.scheduledDate = req.query.date; // 支援日期篩選

    // 查詢排程總數
    const total = await prisma.ticketSchedule.count({ where });

    // 查詢排程列表
    const schedules = await prisma.ticketSchedule.findMany({
      where,
      include: {
        ticket: true,
        target: true,
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' },
      ],
      skip,
      take: limit,
    });

    // 計算分頁資訊
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: '取得工單排程列表成功',
      data: {
        schedules,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('取得工單排程列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得工單排程列表失敗',
      error: error.message,
    });
  }
});

/**
 * 取得指定目標的工單排程
 * GET /api/schedules/target/:targetId
 */
router.get('/target/:targetId', [
  param('targetId').isString().notEmpty().withMessage('目標 ID 不能為空'),
], async (req, res) => {
  try {
    // 驗證參數
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '參數驗證失敗',
        errors: errors.array(),
      });
    }

    const { targetId } = req.params;

    // 查詢指定目標的排程
    const schedules = await prisma.ticketSchedule.findMany({
      where: { targetId },
      include: {
        ticket: true,
        target: true,
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' },
      ],
    });

    res.json({
      success: true,
      message: '取得目標工單排程成功',
      data: schedules,
    });
  } catch (error) {
    console.error('取得目標工單排程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得目標工單排程失敗',
      error: error.message,
    });
  }
});

/**
 * 取得單一工單排程詳情
 * GET /api/schedules/:id
 */
router.get('/:id', [
  param('id').isString().notEmpty().withMessage('排程 ID 不能為空'),
], async (req, res) => {
  try {
    // 驗證參數
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '參數驗證失敗',
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    // 查詢排程詳情
    const schedule = await prisma.ticketSchedule.findUnique({
      where: { id },
      include: {
        ticket: true,
        target: true,
      },
    });

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: '工單排程不存在',
      });
    }

    res.json({
      success: true,
      message: '取得工單排程詳情成功',
      data: schedule,
    });
  } catch (error) {
    console.error('取得工單排程詳情錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得工單排程詳情失敗',
      error: error.message,
    });
  }
});

module.exports = router;
