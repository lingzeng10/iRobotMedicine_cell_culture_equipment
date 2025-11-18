const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

/**
 * 根據工單類型計算所需耗材
 * @param {Object} ticket - 工單資料
 * @param {Number} targetBoxCount - 生產目標的盒數（可選，用於換液工單）
 */
function calculateMaterials(ticket, targetBoxCount = null) {
  const deviceId = ticket.deviceId;
  const materials = [];

  switch (deviceId) {
    case 'Chang Medium': // 換液工單
      // 使用生產目標的盒數
      const changeMediumBoxCount = targetBoxCount || null;
      materials.push({
        name: '培養液',
        type: ticket.mediumType || null,
        quantity: changeMediumBoxCount ? changeMediumBoxCount * 25 : null,
        unit: 'ml',
        pending: !changeMediumBoxCount,
        collected: false
      });
      materials.push({
        name: '回收瓶',
        quantity: 1,
        unit: '個',
        collected: false
      });
      break;

    case 'Sub': // 繼代工單
      materials.push({
        name: '培養液',
        type: ticket.subMediumType || null,
        quantity: ticket.subChildBoxCount ? ticket.subChildBoxCount * 25 : null,
        unit: 'ml',
        pending: !ticket.subChildBoxCount,
        collected: false
      });
      materials.push({
        name: '回收瓶',
        quantity: 1,
        unit: '個',
        collected: false
      });
      materials.push({
        name: 'Trypsin',
        quantity: ticket.subParentBoxCount ? ticket.subParentBoxCount * 4 : null,
        unit: 'ml',
        pending: !ticket.subParentBoxCount,
        collected: false
      });
      materials.push({
        name: 'Balance',
        quantity: ticket.subParentBoxCount ? ticket.subParentBoxCount * 4 : null,
        unit: 'ml',
        pending: !ticket.subParentBoxCount,
        collected: false
      });
      materials.push({
        name: 'PBS',
        quantity: ticket.subParentBoxCount ? ticket.subParentBoxCount * 20 : null,
        unit: 'ml',
        pending: !ticket.subParentBoxCount,
        collected: false
      });
      materials.push({
        name: '金字塔',
        quantity: 2,
        unit: '個',
        collected: false
      });
      materials.push({
        name: 'T175',
        quantity: ticket.subChildBoxCount || null,
        unit: '個',
        pending: !ticket.subChildBoxCount,
        collected: false
      });
      break;

    case 'Sub & Freeze': // 繼代凍存
      materials.push({
        name: '培養液',
        type: ticket.subcultureMediumType || null,
        quantity: ticket.parentBoxCount ? ticket.parentBoxCount * 25 : null,
        unit: 'ml',
        pending: !ticket.parentBoxCount,
        collected: false
      });
      materials.push({
        name: '回收瓶',
        quantity: 1,
        unit: '個',
        collected: false
      });
      materials.push({
        name: 'Trypsin',
        quantity: ticket.parentBoxCount ? ticket.parentBoxCount * 4 : null,
        unit: 'ml',
        pending: !ticket.parentBoxCount,
        collected: false
      });
      materials.push({
        name: 'Balance',
        quantity: ticket.parentBoxCount ? ticket.parentBoxCount * 4 : null,
        unit: 'ml',
        pending: !ticket.parentBoxCount,
        collected: false
      });
      materials.push({
        name: 'PBS',
        quantity: ticket.parentBoxCount ? ticket.parentBoxCount * 20 : null,
        unit: 'ml',
        pending: !ticket.parentBoxCount,
        collected: false
      });
      materials.push({
        name: '凍液',
        type: ticket.frozenMediumType || null,
        quantity: ticket.frozenTubeCount ? ticket.frozenTubeCount * 1.5 : null,
        unit: 'ml',
        pending: !ticket.frozenTubeCount,
        collected: false
      });
      materials.push({
        name: '金字塔',
        quantity: 3,
        unit: '個',
        collected: false
      });
      materials.push({
        name: 'T175',
        quantity: ticket.childBoxCount || null,
        unit: '個',
        pending: !ticket.childBoxCount,
        collected: false
      });
      materials.push({
        name: '凍管',
        spec: ticket.frozenTubeSpec || null,
        quantity: ticket.frozenTubeCount || null,
        unit: '支',
        pending: !ticket.frozenTubeCount,
        collected: false
      });
      break;

    case 'Freeze': // 凍存工單
      materials.push({
        name: '回收瓶',
        quantity: 1,
        unit: '個',
        collected: false
      });
      // 使用 freezeBoxCount 作為親代盒數
      const freezeParentBoxCount = ticket.freezeBoxCount || null;
      materials.push({
        name: 'Trypsin',
        quantity: freezeParentBoxCount ? freezeParentBoxCount * 4 : null,
        unit: 'ml',
        pending: !freezeParentBoxCount,
        collected: false
      });
      materials.push({
        name: 'Balance',
        quantity: freezeParentBoxCount ? freezeParentBoxCount * 4 : null,
        unit: 'ml',
        pending: !freezeParentBoxCount,
        collected: false
      });
      materials.push({
        name: 'PBS',
        quantity: freezeParentBoxCount ? freezeParentBoxCount * 20 : null,
        unit: 'ml',
        pending: !freezeParentBoxCount,
        collected: false
      });
      materials.push({
        name: '凍液',
        type: ticket.freezeMediumType || null,
        quantity: ticket.freezeTubeCount ? ticket.freezeTubeCount * 1.5 : null,
        unit: 'ml',
        pending: !ticket.freezeTubeCount,
        collected: false
      });
      materials.push({
        name: '金字塔',
        quantity: 2,
        unit: '個',
        collected: false
      });
      materials.push({
        name: '凍管',
        spec: ticket.freezeTubeSpec || null,
        quantity: ticket.freezeTubeCount || null,
        unit: '支',
        pending: !ticket.freezeTubeCount,
        collected: false
      });
      break;

    case 'Thaw': // 解凍工單
      materials.push({
        name: '培養液',
        type: ticket.thawMediumType || null,
        quantity: ticket.thawCultureBoxCount ? ticket.thawCultureBoxCount * 25 : null,
        unit: 'ml',
        pending: !ticket.thawCultureBoxCount,
        collected: false
      });
      materials.push({
        name: '回收瓶',
        quantity: 1,
        unit: '個',
        collected: false
      });
      materials.push({
        name: '凍管',
        quantity: ticket.thawTubeCount || null,
        unit: '支',
        pending: !ticket.thawTubeCount,
        collected: false
      });
      materials.push({
        name: 'T175',
        quantity: ticket.thawCultureBoxCount || null,
        unit: '個',
        pending: !ticket.thawCultureBoxCount,
        collected: false
      });
      materials.push({
        name: '金字塔',
        quantity: 2,
        unit: '個',
        collected: false
      });
      break;

    case 'Collect & Discard': // 回收/丟棄工單
      materials.push({
        name: '回收瓶',
        quantity: 1,
        unit: '個',
        collected: false
      });
      break;
  }

  return materials;
}

/**
 * GET /api/materials
 * 查詢所有備料需求（只顯示 2025-11-04 之後生成的工單）
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    // 設定日期過濾：只顯示 2025-11-04 00:00:00 之後生成的工單
    // 只顯示已確認排程的工單
    const filterDate = new Date('2025-11-04T00:00:00');
    where.ticket = {
      createdAt: {
        gte: filterDate
      },
      scheduleConfirmed: true // 只顯示已確認排程的工單
    };

    const materialRequests = await prisma.materialRequest.findMany({
      where,
      include: {
        ticket: {
          include: {
            schedules: {
              include: {
                target: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              },
              orderBy: {
                scheduledDate: 'asc'
              },
              take: 1 // 只取第一個排程（最早的）
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // 過濾掉生產目標為「未指定」的備料需求，以及 AOI 工單（無須備料）
    const filteredRequests = materialRequests.filter(request => {
      const targetName = request.ticket?.schedules?.[0]?.target?.name;
      const deviceId = request.deviceId;
      return targetName && targetName.trim() !== '' && deviceId !== 'AOI';
    });

    // 按照工單排程時程由舊到新排序
    filteredRequests.sort((a, b) => {
      const dateA = a.ticket?.schedules?.[0]?.scheduledDate;
      const dateB = b.ticket?.schedules?.[0]?.scheduledDate;
      
      // 如果沒有排程日期，排在最後
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      
      // 按照日期由舊到新排序
      return new Date(dateA) - new Date(dateB);
    });

    res.json({
      success: true,
      message: '查詢備料需求成功',
      data: filteredRequests
    });
  } catch (error) {
    console.error('查詢備料需求錯誤:', error);
    res.status(500).json({
      success: false,
      message: '查詢備料需求失敗',
      error: error.message
    });
  }
});

/**
 * GET /api/materials/:id
 * 查詢單一備料需求
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const materialRequest = await prisma.materialRequest.findUnique({
      where: { id },
      include: {
        ticket: {
          include: {
            schedules: {
              include: {
                target: {
                  select: {
                    id: true,
                    name: true,
                  }
                }
              },
              orderBy: {
                scheduledDate: 'asc'
              },
              take: 1 // 只取第一個排程（最早的）
            }
          }
        }
      }
    });

    if (!materialRequest) {
      return res.status(404).json({
        success: false,
        message: '備料需求不存在'
      });
    }

    res.json({
      success: true,
      message: '查詢備料需求成功',
      data: materialRequest
    });
  } catch (error) {
    console.error('查詢備料需求錯誤:', error);
    res.status(500).json({
      success: false,
      message: '查詢備料需求失敗',
      error: error.message
    });
  }
});

/**
 * PUT /api/materials/:id/status
 * 更新備料狀態
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'PREPARED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '無效的狀態值'
      });
    }

    const materialRequest = await prisma.materialRequest.update({
      where: { id },
      data: { status }
    });

    res.json({
      success: true,
      message: '更新備料狀態成功',
      data: materialRequest
    });
  } catch (error) {
    console.error('更新備料狀態錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新備料狀態失敗',
      error: error.message
    });
  }
});

/**
 * POST /api/materials/calculate/:ticketId
 * 為指定工單計算並創建備料需求
 */
router.post('/calculate/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;

    // 查詢工單，包含排程和目標資訊
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        schedules: {
          include: {
            target: true
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: '工單不存在'
      });
    }

    // 取得生產目標的盒數（從第一個排程中取得）
    const targetBoxCount = ticket.schedules?.[0]?.target?.boxCount || null;

    // 計算耗材
    const materials = calculateMaterials(ticket, targetBoxCount);

    // 檢查是否已存在備料需求
    const existing = await prisma.materialRequest.findFirst({
      where: { ticketId }
    });

    let materialRequest;
    if (existing) {
      // 更新現有備料需求
      materialRequest = await prisma.materialRequest.update({
        where: { id: existing.id },
        data: {
          materials: JSON.stringify(materials),
          status: 'PENDING'
        }
      });
    } else {
      // 創建新備料需求
      materialRequest = await prisma.materialRequest.create({
        data: {
          ticketId,
          deviceId: ticket.deviceId,
          materials: JSON.stringify(materials),
          status: 'PENDING'
        }
      });
    }

    res.json({
      success: true,
      message: '備料需求計算成功',
      data: materialRequest
    });
  } catch (error) {
    console.error('計算備料需求錯誤:', error);
    res.status(500).json({
      success: false,
      message: '計算備料需求失敗',
      error: error.message
    });
  }
});

/**
 * POST /api/materials/batch-calculate
 * 為所有現有工單批量計算並創建備料需求
 */
router.post('/batch-calculate', async (req, res) => {
  try {
    // 查詢所有工單，包含排程和目標資訊
    const tickets = await prisma.ticket.findMany({
      include: {
        schedules: {
          include: {
            target: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (tickets.length === 0) {
      return res.json({
        success: true,
        message: '沒有工單需要處理',
        data: {
          total: 0,
          processed: 0,
          created: 0,
          updated: 0,
          errors: []
        }
      });
    }

    let processed = 0;
    let created = 0;
    let updated = 0;
    const errors = [];

    // 為每個工單計算備料需求
    for (const ticket of tickets) {
      try {
        // 取得生產目標的盒數（從第一個排程中取得）
        const targetBoxCount = ticket.schedules?.[0]?.target?.boxCount || null;
        
        // 計算耗材
        const materials = calculateMaterials(ticket, targetBoxCount);

        // 檢查是否已存在備料需求
        const existing = await prisma.materialRequest.findFirst({
          where: { ticketId: ticket.id }
        });

        if (existing) {
          // 更新現有備料需求
          await prisma.materialRequest.update({
            where: { id: existing.id },
            data: {
              materials: JSON.stringify(materials),
              status: 'PENDING'
            }
          });
          updated++;
        } else {
          // 創建新備料需求
          await prisma.materialRequest.create({
            data: {
              ticketId: ticket.id,
              deviceId: ticket.deviceId,
              materials: JSON.stringify(materials),
              status: 'PENDING'
            }
          });
          created++;
        }
        processed++;
      } catch (error) {
        console.error(`處理工單 ${ticket.id} 時發生錯誤:`, error);
        errors.push({
          ticketId: ticket.id,
          deviceId: ticket.deviceId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `批量計算備料需求完成：處理 ${processed}/${tickets.length} 個工單`,
      data: {
        total: tickets.length,
        processed,
        created,
        updated,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    console.error('批量計算備料需求錯誤:', error);
    res.status(500).json({
      success: false,
      message: '批量計算備料需求失敗',
      error: error.message
    });
  }
});

/**
 * PUT /api/materials/:id/material/:materialIndex
 * 更新個別材料的領料狀態
 */
router.put('/:id/material/:materialIndex', async (req, res) => {
  try {
    const { id, materialIndex } = req.params;
    const { collected } = req.body;

    // 查詢備料需求
    const materialRequest = await prisma.materialRequest.findUnique({
      where: { id }
    });

    if (!materialRequest) {
      return res.status(404).json({
        success: false,
        message: '備料需求不存在'
      });
    }

    // 解析材料列表
    const materials = JSON.parse(materialRequest.materials);
    const index = parseInt(materialIndex);

    if (isNaN(index) || index < 0 || index >= materials.length) {
      return res.status(400).json({
        success: false,
        message: '材料索引無效'
      });
    }

    // 更新材料的領料狀態
    materials[index].collected = collected === true || collected === 'true';

    // 檢查是否所有材料都已領料
    const allCollected = materials.every(material => material.collected === true);
    
    // 準備更新資料
    const updateData = {
      materials: JSON.stringify(materials)
    };
    
    // 根據領料狀態自動更新備料狀態
    if (allCollected && materialRequest.status === 'PENDING') {
      // 如果所有材料都已領料，且當前狀態為 PENDING，自動更新為 PREPARED
      updateData.status = 'PREPARED';
    } else if (!allCollected && materialRequest.status === 'PREPARED') {
      // 如果有材料未領料，且當前狀態為 PREPARED，自動更新為 PENDING
      updateData.status = 'PENDING';
    }

    // 更新資料庫
    const updated = await prisma.materialRequest.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: '更新材料領料狀態成功',
      data: updated
    });
  } catch (error) {
    console.error('更新材料領料狀態錯誤:', error);
    res.status(500).json({
      success: false,
      message: '更新材料領料狀態失敗',
      error: error.message
    });
  }
});

/**
 * DELETE /api/materials
 * 清空所有備料需求
 */
router.delete('/', async (req, res) => {
  try {
    const deleted = await prisma.materialRequest.deleteMany({});
    
    res.json({
      success: true,
      message: '已清空所有備料需求',
      data: { deletedCount: deleted.count }
    });
  } catch (error) {
    console.error('清空備料需求錯誤:', error);
    res.status(500).json({
      success: false,
      message: '清空備料需求失敗',
      error: error.message
    });
  }
});

module.exports = router;

