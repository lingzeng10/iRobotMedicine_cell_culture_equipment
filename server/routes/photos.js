const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

// 確保上傳目錄存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 用於文件上傳
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名：時間戳_原始文件名
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// 文件過濾器：只允許圖片文件
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('只允許上傳圖片文件 (JPEG, JPG, PNG, GIF, BMP, WEBP)'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 限制
  },
  fileFilter: fileFilter
});

/**
 * @route POST /api/photos/upload
 * @desc 上傳照片到指定工單
 * @access Public
 */
router.post('/upload', upload.single('photo'), [
  body('ticketId').notEmpty().withMessage('工單ID不能為空'),
  body('description').optional().isString().withMessage('描述必須是字符串')
], async (req, res) => {
  try {
    // 驗證請求數據
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求數據驗證失敗',
        errors: errors.array()
      });
    }

    // 檢查是否有文件上傳
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '請選擇要上傳的照片文件'
      });
    }

    const { ticketId, description } = req.body;

    // 檢查工單是否存在
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      // 如果工單不存在，刪除已上傳的文件
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: '工單不存在'
      });
    }

    // 保存照片記錄到數據庫
    const photo = await prisma.photo.create({
      data: {
        ticketId: ticketId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        description: description || null,
        uploadedAt: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: '照片上傳成功',
      data: {
        id: photo.id,
        filename: photo.filename,
        originalName: photo.originalName,
        fileSize: photo.fileSize,
        mimeType: photo.mimeType,
        description: photo.description,
        uploadedAt: photo.uploadedAt,
        url: `/api/photos/${photo.id}/view` // 提供查看照片的URL
      }
    });

  } catch (error) {
    console.error('照片上傳錯誤:', error);
    
    // 如果發生錯誤，刪除已上傳的文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: '照片上傳失敗',
      error: error.message
    });
  }
});

/**
 * @route GET /api/photos/:id/view
 * @desc 查看照片
 * @access Public
 */
router.get('/:id/view', async (req, res) => {
  try {
    const photoId = req.params.id;

    const photo = await prisma.photo.findUnique({
      where: { id: photoId }
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: '照片不存在'
      });
    }

    // 檢查文件是否存在
    if (!fs.existsSync(photo.filePath)) {
      return res.status(404).json({
        success: false,
        message: '照片文件不存在'
      });
    }

    // 設置適當的Content-Type
    res.setHeader('Content-Type', photo.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${photo.originalName}"`);
    
    // 發送文件
    res.sendFile(path.resolve(photo.filePath));

  } catch (error) {
    console.error('查看照片錯誤:', error);
    res.status(500).json({
      success: false,
      message: '查看照片失敗',
      error: error.message
    });
  }
});

/**
 * @route GET /api/photos/ticket/:ticketId
 * @desc 獲取指定工單的所有照片
 * @access Public
 */
router.get('/ticket/:ticketId', async (req, res) => {
  try {
    const ticketId = req.params.ticketId;

    const photos = await prisma.photo.findMany({
      where: { ticketId: ticketId },
      orderBy: { uploadedAt: 'desc' }
    });

    const photosWithUrls = photos.map(photo => ({
      id: photo.id,
      filename: photo.filename,
      originalName: photo.originalName,
      fileSize: photo.fileSize,
      mimeType: photo.mimeType,
      description: photo.description,
      uploadedAt: photo.uploadedAt,
      url: `/api/photos/${photo.id}/view`
    }));

    res.json({
      success: true,
      message: '獲取照片列表成功',
      data: photosWithUrls
    });

  } catch (error) {
    console.error('獲取照片列表錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取照片列表失敗',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/photos/:id
 * @desc 刪除照片
 * @access Public
 */
router.delete('/:id', async (req, res) => {
  try {
    const photoId = req.params.id;

    const photo = await prisma.photo.findUnique({
      where: { id: photoId }
    });

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: '照片不存在'
      });
    }

    // 刪除數據庫記錄
    await prisma.photo.delete({
      where: { id: photoId }
    });

    // 刪除文件
    if (fs.existsSync(photo.filePath)) {
      fs.unlinkSync(photo.filePath);
    }

    res.json({
      success: true,
      message: '照片刪除成功'
    });

  } catch (error) {
    console.error('刪除照片錯誤:', error);
    res.status(500).json({
      success: false,
      message: '刪除照片失敗',
      error: error.message
    });
  }
});

module.exports = router;
