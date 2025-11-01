const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');

const router = express.Router();

// 建立工單 - POST /api/tickets
router.post('/', [
  // 驗證輸入資料
  body('deviceId')
    .notEmpty()
    .withMessage('設備 ID 為必填欄位')
    .isString()
    .withMessage('設備 ID 必須為字串'),
  
  body('imageId')
    .optional()
    .isString()
    .withMessage('影像 ID 必須為字串'),
  
], async (req, res) => {
  try {
    // 檢查驗證結果
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入資料驗證失敗',
        errors: errors.array()
      });
    }

    const { deviceId, imageId } = req.body;

    // 建立新工單
    const ticket = await prisma.ticket.create({
      data: {
        deviceId,
        imageId: imageId || null,
        status: 'OPEN' // 預設狀態為 OPEN
      }
    });

    res.status(201).json({
      success: true,
      message: '工單建立成功',
      data: ticket
    });

  } catch (error) {
    console.error('建立工單錯誤:', error);
    res.status(500).json({
      success: false,
      message: '建立工單失敗',
      error: error.message
    });
  }
});

// 查詢工單列表 - GET /api/tickets
router.get('/', async (req, res) => {
  try {
    const { status, deviceId, page = 1, limit = 10 } = req.query;
    
    // 建立查詢條件
    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }
    if (deviceId) {
      where.deviceId = deviceId;
    }

    // 計算分頁
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // 查詢工單列表
    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.ticket.count({ where })
    ]);

    res.json({
      success: true,
      message: '查詢工單列表成功',
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('查詢工單列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '查詢工單列表失敗',
      error: error.message
    });
  }
});

// 查詢單一工單 - GET /api/tickets/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的工單'
      });
    }

    res.json({
      success: true,
      message: '查詢工單詳情成功',
      data: ticket
    });

  } catch (error) {
    console.error('查詢工單詳情錯誤:', error);
    res.status(500).json({
      success: false,
      message: '查詢工單詳情失敗',
      error: error.message
    });
  }
});

// 更新工單 - PUT /api/tickets/:id
router.put('/:id', [
  // 驗證狀態更新
  body('status')
    .optional()
    .isIn(['OPEN', 'CLOSED'])
    .withMessage('狀態必須為 OPEN 或 CLOSED'),
  
], async (req, res) => {
  try {
    // 檢查驗證結果
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '輸入資料驗證失敗',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    // 檢查工單是否存在
    const existingTicket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!existingTicket) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的工單'
      });
    }

    // 建立更新資料
    const updateData = {};
    if (status) updateData.status = status;

    // 更新工單
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: '工單更新成功',
      data: updatedTicket
    });

  } catch (error) {
    console.error('更新工單錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新工單失敗',
      error: error.message
    });
  }
});

module.exports = router;
