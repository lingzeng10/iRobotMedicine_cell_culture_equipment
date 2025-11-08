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
 * - materialType: 收集原料種類 (可選)
 * - responsiblePerson: 負責人員 (可選：OP001, OP002, OP003)
 * - productionTarget: 生產目標 (可選，如 "3L")
 * - startCultureDate: 起始培養日期 (可選)
 * - generation: 代數 (可選)
 * - boxCount: 盒數 (可選)
 * - expectedCompletionDate: 預計完成時間 (必填)
 */
router.post('/', [
  body('name')
    .isString()
    .notEmpty()
    .withMessage('目標名稱不能為空')
    .isLength({ min: 2, max: 100 })
    .withMessage('目標名稱長度必須在 2-100 字元之間'),
  body('materialType')
    .optional()
    .isIn(['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'])
    .withMessage('收集原料種類必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5'),
  body('responsiblePerson')
    .optional()
    .isIn(['OP001', 'OP002', 'OP003'])
    .withMessage('負責人員必須為 OP001, OP002, 或 OP003'),
  body('productionTarget')
    .optional()
    .isString()
    .withMessage('生產目標必須為字串'),
  body('startCultureDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('起始培養日期格式必須為 YYYY-MM-DD'),
  body('generation')
    .optional()
    .isInt({ min: 1 })
    .withMessage('代數必須為正整數'),
  body('boxCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('盒數必須為正整數'),
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

    const { name, materialType, responsiblePerson, productionTarget, startCultureDate, generation, boxCount, expectedCompletionDate } = req.body;

    // 建立新目標並自動創建排程（使用事務確保一致性）
    const result = await prisma.$transaction(async (tx) => {
      // 建立新目標
      const target = await tx.productionTarget.create({
        data: {
          name,
          materialType: materialType || null,
          responsiblePerson: responsiblePerson || null,
          productionTarget: productionTarget || null,
          startCultureDate: startCultureDate || null,
          generation: generation || null,
          boxCount: boxCount || null,
          expectedCompletionDate,
          status: 'PLANNING', // 預設狀態為規劃中
        },
      });

      // 自動創建排程邏輯
      // 第一個工單：解凍工單
      // 後續工單：AOI、AOI、換液、AOI、AOI、換液（每6個為一個循環）
      const firstTicketType = 'Thaw'; // 解凍工單
      const ticketPattern = ['AOI', 'AOI', 'Chang Medium', 'AOI', 'AOI', 'Chang Medium'];
      
      // 計算日期範圍（從今天到預計完成日期）
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endDate = new Date(expectedCompletionDate + 'T00:00:00');
      endDate.setHours(0, 0, 0, 0);

      // 如果預計完成日期在今天或之後，才創建排程
      if (endDate >= today) {
        const schedulesCreated = [];
        let patternIndex = 0;
        const currentDate = new Date(today);

        // 格式化日期為 YYYY-MM-DD 的輔助函數（使用本地時間）
        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        };

        // 遍歷從今天到預計完成日期的每一天
        while (currentDate <= endDate) {
          // 獲取當天的工單類型
          // 第一個工單（patternIndex === 0）：解凍工單
          // 後續工單：按照循環模式
          let deviceId;
          if (patternIndex === 0) {
            deviceId = firstTicketType;
          } else {
            // 從 patternIndex - 1 開始，因為第一個已經用了解凍工單
            const cycleIndex = (patternIndex - 1) % ticketPattern.length;
            deviceId = ticketPattern[cycleIndex];
          }
          
          // 格式化日期為 YYYY-MM-DD（使用本地時間）
          const dateString = formatDate(currentDate);

          // 創建工單
          const ticket = await tx.ticket.create({
            data: {
              deviceId,
              status: 'OPEN',
            },
          });

          // 創建排程
          const schedule = await tx.ticketSchedule.create({
            data: {
              ticketId: ticket.id,
              targetId: target.id,
              scheduledDate: dateString,
              priority: 'MEDIUM',
              status: 'OPEN',
            },
          });

          schedulesCreated.push({
            ticketId: ticket.id,
            scheduleId: schedule.id,
            date: dateString,
            deviceId,
          });

          // 移動到下一天
          currentDate.setDate(currentDate.getDate() + 1);
          patternIndex++;
        }

        console.log(`為目標 ${target.id} 自動創建了 ${schedulesCreated.length} 個排程`);
        return { target, schedulesCount: schedulesCreated.length };
      }

      return { target, schedulesCount: 0 };
    });

    res.status(201).json({
      success: true,
      message: `建立預生產目標成功${result.schedulesCount > 0 ? `，已自動創建 ${result.schedulesCount} 個排程` : ''}`,
      data: result.target,
      schedulesCreated: result.schedulesCount,
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
 * - materialType: 收集原料種類 (可選)
 * - responsiblePerson: 負責人員 (可選：OP001, OP002, OP003)
 * - productionTarget: 生產目標 (可選，如 "3L")
 * - startCultureDate: 起始培養日期 (可選)
 * - generation: 代數 (可選)
 * - boxCount: 盒數 (可選)
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
  body('materialType')
    .optional()
    .isIn(['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'])
    .withMessage('收集原料種類必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5'),
  body('responsiblePerson')
    .optional()
    .isIn(['OP001', 'OP002', 'OP003'])
    .withMessage('負責人員必須為 OP001, OP002, 或 OP003'),
  body('productionTarget')
    .optional()
    .isString()
    .withMessage('生產目標必須為字串'),
  body('startCultureDate')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('起始培養日期格式必須為 YYYY-MM-DD'),
  body('generation')
    .optional()
    .isInt({ min: 1 })
    .withMessage('代數必須為正整數'),
  body('boxCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('盒數必須為正整數'),
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
    if (req.body.materialType !== undefined) updateData.materialType = req.body.materialType || null;
    if (req.body.responsiblePerson !== undefined) updateData.responsiblePerson = req.body.responsiblePerson || null;
    if (req.body.productionTarget !== undefined) updateData.productionTarget = req.body.productionTarget || null;
    if (req.body.startCultureDate !== undefined) updateData.startCultureDate = req.body.startCultureDate || null;
    if (req.body.generation !== undefined) updateData.generation = req.body.generation || null;
    if (req.body.boxCount !== undefined) updateData.boxCount = req.body.boxCount || null;
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
