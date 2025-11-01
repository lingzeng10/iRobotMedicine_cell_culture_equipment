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
    if (req.body.scheduledDate !== undefined) updateData.scheduledDate = req.body.scheduledDate;
    if (req.body.scheduledTime !== undefined) updateData.scheduledTime = req.body.scheduledTime;
    if (req.body.priority !== undefined) updateData.priority = req.body.priority;
    if (req.body.status !== undefined) updateData.status = req.body.status;

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

    // 更新排程
    const updatedSchedule = await prisma.ticketSchedule.update({
      where: { id },
      data: updateData,
      include: {
        ticket: true,
        target: true,
      },
    });

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
