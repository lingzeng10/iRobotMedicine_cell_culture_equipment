const express = require('express');
const { body, validationResult, param } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * 取得所有預生產目標列表
 * GET /api/targets
 * 查詢參數：
 * - page: 頁碼 (預設: 1)
 * - limit: 每頁數量 (預設: 10)
 * - status: 狀態篩選 (可選)
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    // 建立查詢條件
    const where = {};
    if (status) {
      where.status = status;
    }

    // 查詢目標總數
    const total = await prisma.productionTarget.count({ where });

    // 查詢目標列表
    const targets = await prisma.productionTarget.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // 計算分頁資訊
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      message: '取得預生產目標列表成功',
      data: {
        targets,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error('取得預生產目標列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得預生產目標列表失敗',
      error: error.message,
    });
  }
});

/**
 * 取得單一預生產目標詳情
 * GET /api/targets/:id
 */
router.get('/:id', [
  param('id').isString().notEmpty().withMessage('目標 ID 不能為空'),
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

    // 查詢目標詳情
    const target = await prisma.productionTarget.findUnique({
      where: { id },
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: '預生產目標不存在',
      });
    }

    res.json({
      success: true,
      message: '取得預生產目標詳情成功',
      data: target,
    });
  } catch (error) {
    console.error('取得預生產目標詳情錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得預生產目標詳情失敗',
      error: error.message,
    });
  }
});

/**
 * 建立新的預生產目標
 * POST /api/targets
 * 請求體：
 * - name: 目標名稱 (必填)
 * - description: 目標描述 (可選)
 * - expectedCompletionDate: 預計完成時間 (必填)
 */
router.post('/', [
  body('name')
    .isString()
    .notEmpty()
    .withMessage('目標名稱不能為空')
    .isLength({ min: 2, max: 100 })
    .withMessage('目標名稱長度必須在 2-100 字元之間'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('目標描述不能超過 500 字元'),
  body('expectedCompletionDate')
    .isString()
    .notEmpty()
    .withMessage('預計完成時間不能為空')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('預計完成時間格式必須為 YYYY-MM-DD'),
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

    const { name, description, expectedCompletionDate } = req.body;

    // 建立新目標
    const target = await prisma.productionTarget.create({
      data: {
        name,
        description: description || null,
        expectedCompletionDate,
        status: 'PLANNING', // 預設狀態為規劃中
      },
    });

    res.status(201).json({
      success: true,
      message: '建立預生產目標成功',
      data: target,
    });
  } catch (error) {
    console.error('建立預生產目標錯誤:', error);
    res.status(500).json({
      success: false,
      message: '建立預生產目標失敗',
      error: error.message,
    });
  }
});

/**
 * 更新預生產目標
 * PUT /api/targets/:id
 * 請求體：
 * - name: 目標名稱 (可選)
 * - description: 目標描述 (可選)
 * - expectedCompletionDate: 預計完成時間 (可選)
 * - status: 目標狀態 (可選)
 */
router.put('/:id', [
  param('id').isString().notEmpty().withMessage('目標 ID 不能為空'),
  body('name')
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('目標名稱長度必須在 2-100 字元之間'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('目標描述不能超過 500 字元'),
  body('expectedCompletionDate')
    .optional()
    .isString()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('預計完成時間格式必須為 YYYY-MM-DD'),
  body('status')
    .optional()
    .isIn(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
    .withMessage('目標狀態必須為 PLANNING, IN_PROGRESS, COMPLETED, 或 CANCELLED'),
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
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.expectedCompletionDate !== undefined) updateData.expectedCompletionDate = req.body.expectedCompletionDate;
    if (req.body.status !== undefined) updateData.status = req.body.status;

    // 檢查目標是否存在
    const existingTarget = await prisma.productionTarget.findUnique({
      where: { id },
    });

    if (!existingTarget) {
      return res.status(404).json({
        success: false,
        message: '預生產目標不存在',
      });
    }

    // 更新目標
    const updatedTarget = await prisma.productionTarget.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: '更新預生產目標成功',
      data: updatedTarget,
    });
  } catch (error) {
    console.error('更新預生產目標錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新預生產目標失敗',
      error: error.message,
    });
  }
});

/**
 * 刪除預生產目標
 * DELETE /api/targets/:id
 */
router.delete('/:id', [
  param('id').isString().notEmpty().withMessage('目標 ID 不能為空'),
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

    // 檢查目標是否存在
    const existingTarget = await prisma.productionTarget.findUnique({
      where: { id },
    });

    if (!existingTarget) {
      return res.status(404).json({
        success: false,
        message: '預生產目標不存在',
      });
    }

    // 刪除目標（會自動刪除相關的排程）
    await prisma.productionTarget.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: '刪除預生產目標成功',
    });
  } catch (error) {
    console.error('刪除預生產目標錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除預生產目標失敗',
      error: error.message,
    });
  }
});

/**
 * 取得指定目標的工單排程
 * GET /api/targets/:id/schedules
 */
router.get('/:id/schedules', [
  param('id').isString().notEmpty().withMessage('目標 ID 不能為空'),
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

    // 檢查目標是否存在
    const target = await prisma.productionTarget.findUnique({
      where: { id },
    });

    if (!target) {
      return res.status(404).json({
        success: false,
        message: '預生產目標不存在',
      });
    }

    // 查詢目標的工單排程
    const schedules = await prisma.ticketSchedule.findMany({
      where: { targetId: id },
      include: {
        ticket: true,
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' },
      ],
    });

    res.json({
      success: true,
      message: '取得工單排程成功',
      data: schedules,
    });
  } catch (error) {
    console.error('取得工單排程錯誤:', error);
    res.status(500).json({
      success: false,
      message: '取得工單排程失敗',
      error: error.message,
    });
  }
});

module.exports = router;
