const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

/**
 * 獲取版本資訊
 * GET /api/version
 */
router.get('/', (req, res) => {
  try {
    const versionPath = path.join(__dirname, '../version.json');
    const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    
    res.json({
      success: true,
      data: versionData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('獲取版本資訊錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取版本資訊失敗',
      error: error.message
    });
  }
});

/**
 * 獲取更新日誌
 * GET /api/version/changelog
 */
router.get('/changelog', (req, res) => {
  try {
    const versionPath = path.join(__dirname, '../version.json');
    const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    
    res.json({
      success: true,
      data: {
        changelog: versionData.changelog,
        currentVersion: versionData.version,
        buildNumber: versionData.buildNumber
      }
    });
  } catch (error) {
    console.error('獲取更新日誌錯誤:', error);
    res.status(500).json({
      success: false,
      message: '獲取更新日誌失敗',
      error: error.message
    });
  }
});

/**
 * 檢查更新
 * GET /api/version/check
 */
router.get('/check', (req, res) => {
  try {
    const clientVersion = req.query.version || '1.0.0';
    const versionPath = path.join(__dirname, '../version.json');
    const versionData = JSON.parse(fs.readFileSync(versionPath, 'utf8'));
    
    const hasUpdate = clientVersion !== versionData.version;
    
    res.json({
      success: true,
      data: {
        hasUpdate,
        currentVersion: versionData.version,
        clientVersion,
        latestChangelog: versionData.changelog[0],
        updateAvailable: hasUpdate
      }
    });
  } catch (error) {
    console.error('檢查更新錯誤:', error);
    res.status(500).json({
      success: false,
      message: '檢查更新失敗',
      error: error.message
    });
  }
});

module.exports = router;
