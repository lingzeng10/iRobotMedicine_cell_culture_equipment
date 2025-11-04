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

    // 記錄查詢結果，確保包含所有欄位
    console.log('查詢工單詳情成功，返回的資料:', JSON.stringify(ticket, null, 2));
    console.log('繼代工單欄位檢查:', {
      subParentBoxCount: ticket.subParentBoxCount,
      subChildBoxCount: ticket.subChildBoxCount,
      subMediumType: ticket.subMediumType,
      subRecycledMediumType: ticket.subRecycledMediumType,
    });

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
  
  // 驗證拍照倍數（僅 AOI 工單使用）
  body('magnification')
    .optional()
    .isIn(['4X', '10X', '20X'])
    .withMessage('拍照倍數必須為 4X, 10X, 或 20X'),
  
  // 驗證張數（僅 AOI 工單使用）
  body('photoCount')
    .optional()
    .isInt({ min: 1 })
    .withMessage('張數必須為正整數'),
  
  // 驗證培養液種類（僅換液工單使用）
  body('mediumType')
    .optional()
    .isIn(['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'])
    .withMessage('培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5'),
  
  // 驗證回收培養液種類（僅換液工單使用）
  body('recycledMediumType')
    .optional()
    .isIn(['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'])
    .withMessage('回收培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5'),
  
  // 驗證繼代凍存工單欄位
  body('parentBoxCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('親代盒數必須為非負整數'),
  
  body('childBoxCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('子代盒數必須為非負整數'),
  
  body('subcultureMediumType')
    .optional()
    .isIn(['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'])
    .withMessage('繼代培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5'),
  
  body('subcultureRecycledMediumType')
    .optional()
    .isIn(['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5', '不回收'])
    .withMessage('回收培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, AM5, 或 不回收'),
  
  body('frozenCellBoxCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('凍存細胞盒數必須為非負整數'),
  
  body('frozenTubeSpec')
    .optional()
    .isIn(['2ml', '5ml'])
    .withMessage('凍管規格必須為 2ml 或 5ml'),
  
  body('frozenMediumType')
    .optional()
    .isIn(['凍液A', '凍液B'])
    .withMessage('凍液種類必須為 凍液A 或 凍液B'),
  
  body('frozenTubeCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('凍管支數必須為非負整數'),
  
  // 驗證解凍工單欄位
  body('thawCellName')
    .optional()
    .isString()
    .withMessage('解凍細胞必須為字串'),
  
  body('thawCellGeneration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('細胞凍存代數必須為非負整數'),
  
  body('thawOriginalMediumType')
    .optional()
    .isIn(['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5', '無紀錄'])
    .withMessage('細胞凍存原培養液必須為 022-02.4, 022-02.1, SAM10, CM2, AM5, 或 無紀錄'),
  
  body('thawFreezeDate')
    .optional()
    .isString()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('凍管凍存日期格式必須為 YYYY-MM-DD'),
  
  body('thawTubeCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('解凍支數必須為非負整數'),
  
  body('thawMediumType')
    .optional()
    .isIn(['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'])
    .withMessage('解凍培養液必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5'),
  
  body('thawCultureBoxCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('解凍培養盒數必須為非負整數'),
  
  // 驗證凍存工單欄位
  body('freezeBoxCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('凍存盒數必須為非負整數'),
  
  body('freezeTubeCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('凍管數量必須為非負整數'),
  
  body('freezeTubeSpec')
    .optional()
    .isIn(['2ml', '5ml'])
    .withMessage('凍管規格必須為 2ml 或 5ml'),
  
  body('freezeMediumType')
    .optional()
    .isIn(['凍液A', '凍液B'])
    .withMessage('凍液種類必須為 凍液A 或 凍液B'),
  
  // 驗證繼代工單欄位
  body('subParentBoxCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('親代盒數必須為非負整數'),
  
  body('subChildBoxCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('子代盒數必須為非負整數'),
  
  body('subMediumType')
    .optional()
    .isIn(['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'])
    .withMessage('繼代培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5'),
  
  body('subRecycledMediumType')
    .optional()
    .isIn(['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5', '不回收'])
    .withMessage('回收培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, AM5, 或 不回收'),
  
], async (req, res) => {
  try {
    // 檢查驗證結果
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('驗證錯誤:', errors.array());
      console.error('請求資料:', JSON.stringify(req.body, null, 2));
      console.error('工單 ID:', req.params.id);
      return res.status(400).json({
        success: false,
        message: '輸入資料驗證失敗',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { 
      status, 
      magnification, 
      photoCount, 
      mediumType, 
      recycledMediumType,
      parentBoxCount,
      childBoxCount,
      subcultureMediumType,
      subcultureRecycledMediumType,
      frozenCellBoxCount,
      frozenTubeSpec,
      frozenMediumType,
      frozenTubeCount,
      thawCellName,
      thawCellGeneration,
      thawOriginalMediumType,
      thawFreezeDate,
      thawTubeCount,
      thawMediumType,
      thawCultureBoxCount,
      freezeBoxCount,
      freezeTubeCount,
      freezeTubeSpec,
      freezeMediumType,
      subParentBoxCount,
      subChildBoxCount,
      subMediumType,
      subRecycledMediumType
    } = req.body;

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
    if (status !== undefined) updateData.status = status;
    if (magnification !== undefined) updateData.magnification = magnification || null;
    if (photoCount !== undefined) updateData.photoCount = photoCount ? parseInt(photoCount) : null;
    if (mediumType !== undefined) updateData.mediumType = mediumType || null;
    if (recycledMediumType !== undefined) updateData.recycledMediumType = recycledMediumType || null;
    if (parentBoxCount !== undefined) updateData.parentBoxCount = parentBoxCount ? parseInt(parentBoxCount) : null;
    if (childBoxCount !== undefined) updateData.childBoxCount = childBoxCount ? parseInt(childBoxCount) : null;
    if (subcultureMediumType !== undefined) updateData.subcultureMediumType = subcultureMediumType || null;
    if (subcultureRecycledMediumType !== undefined) updateData.subcultureRecycledMediumType = subcultureRecycledMediumType || null;
    if (frozenCellBoxCount !== undefined) updateData.frozenCellBoxCount = frozenCellBoxCount ? parseInt(frozenCellBoxCount) : null;
    if (frozenTubeSpec !== undefined) updateData.frozenTubeSpec = frozenTubeSpec || null;
    if (frozenMediumType !== undefined) updateData.frozenMediumType = frozenMediumType || null;
    if (frozenTubeCount !== undefined) updateData.frozenTubeCount = frozenTubeCount ? parseInt(frozenTubeCount) : null;
    if (thawCellName !== undefined) updateData.thawCellName = thawCellName || null;
    if (thawCellGeneration !== undefined) updateData.thawCellGeneration = thawCellGeneration ? parseInt(thawCellGeneration) : null;
    if (thawOriginalMediumType !== undefined) updateData.thawOriginalMediumType = thawOriginalMediumType || null;
    if (thawFreezeDate !== undefined) updateData.thawFreezeDate = thawFreezeDate || null;
    if (thawTubeCount !== undefined) updateData.thawTubeCount = thawTubeCount ? parseInt(thawTubeCount) : null;
    if (thawMediumType !== undefined) updateData.thawMediumType = thawMediumType || null;
    if (thawCultureBoxCount !== undefined) updateData.thawCultureBoxCount = thawCultureBoxCount ? parseInt(thawCultureBoxCount) : null;
    if (freezeBoxCount !== undefined) updateData.freezeBoxCount = freezeBoxCount ? parseInt(freezeBoxCount) : null;
    if (freezeTubeCount !== undefined) updateData.freezeTubeCount = freezeTubeCount ? parseInt(freezeTubeCount) : null;
    if (freezeTubeSpec !== undefined) updateData.freezeTubeSpec = freezeTubeSpec || null;
    if (freezeMediumType !== undefined) updateData.freezeMediumType = freezeMediumType || null;
    if (subParentBoxCount !== undefined) updateData.subParentBoxCount = subParentBoxCount ? parseInt(subParentBoxCount) : null;
    if (subChildBoxCount !== undefined) updateData.subChildBoxCount = subChildBoxCount ? parseInt(subChildBoxCount) : null;
    if (subMediumType !== undefined) updateData.subMediumType = subMediumType || null;
    if (subRecycledMediumType !== undefined) updateData.subRecycledMediumType = subRecycledMediumType || null;

    // 更新工單
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData
    });

    // 記錄更新後的資料，確保包含所有欄位
    console.log('工單更新成功，返回的資料:', JSON.stringify(updatedTicket, null, 2));
    console.log('繼代工單欄位檢查:', {
      subParentBoxCount: updatedTicket.subParentBoxCount,
      subChildBoxCount: updatedTicket.subChildBoxCount,
      subMediumType: updatedTicket.subMediumType,
      subRecycledMediumType: updatedTicket.subRecycledMediumType,
    });

    res.json({
      success: true,
      message: '工單更新成功',
      data: updatedTicket
    });

  } catch (error) {
    console.error('更新工單錯誤:', error);
    console.error('錯誤詳情:', error.stack);
    console.error('請求資料:', JSON.stringify(req.body, null, 2));
    console.error('更新資料:', JSON.stringify(updateData, null, 2));
    console.error('工單 ID:', req.params.id);
    
    // 提供更詳細的錯誤訊息
    let errorMessage = '更新工單失敗';
    if (error.message.includes('Unknown column') || error.message.includes('no such column')) {
      errorMessage = '資料庫欄位不存在，請確認已執行 "npm run db:push" 同步資料庫';
    } else if (error.message.includes('Prisma')) {
      errorMessage = '資料庫操作失敗，請確認 Prisma Client 已更新（執行 "npm run db:generate"）';
    } else if (error.message.includes('mediumType') || error.message.includes('recycledMediumType')) {
      errorMessage = `資料庫欄位錯誤: ${error.message}。請確認已執行 "npm run db:push" 和 "npm run db:generate"`;
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;
