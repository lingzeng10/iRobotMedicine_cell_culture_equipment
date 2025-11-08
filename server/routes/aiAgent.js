const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const router = express.Router();
const prisma = new PrismaClient();

// Ollama 配置
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';

/**
 * GET /api/ai/status
 * 檢查 Ollama 服務狀態
 */
router.get('/status', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`, {
      timeout: 5000,
    });
    
    res.json({
      success: true,
      message: 'Ollama 服務正常運行',
      data: {
        models: response.data.models || [],
        modelCount: response.data.models?.length || 0,
        currentModel: OLLAMA_MODEL,
      },
    });
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      res.status(503).json({
        success: false,
        message: 'Ollama 服務未運行或無法連接',
        error: '請確認 Ollama 服務已啟動（執行：ollama serve）',
      });
    } else {
      res.status(500).json({
        success: false,
        message: '檢查 Ollama 狀態失敗',
        error: error.message,
      });
    }
  }
});

/**
 * POST /api/ai/chat
 * AI Agent 對話端點
 */
router.post('/chat', [
  body('message')
    .isString()
    .notEmpty()
    .withMessage('訊息不能為空')
    .isLength({ max: 2000 })
    .withMessage('訊息不能超過 2000 字元'),
  body('conversationId')
    .optional()
    .isString()
    .withMessage('對話 ID 必須為字串'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: '請求資料驗證失敗',
        errors: errors.array(),
      });
    }

    const { message, conversationId } = req.body;

    console.log(`[AI Agent] 收到訊息: ${message}`);

    // 1. 分析用戶意圖
    const intent = await analyzeIntentWithOllama(message);
    console.log(`[AI Agent] 意圖分析結果:`, intent);

    // 2. 根據意圖執行相應操作
    let response;
    try {
      if (intent.type === 'database_query') {
        console.log(`[AI Agent] 執行資料庫查詢: ${intent.query}`);
        response = await executeDatabaseQuery(intent.query, intent.params);
        // 驗證查詢結果是否有效
        if (!response || !response.text) {
          response = { text: '您無法查看此資料', data: null };
        }
      } else if (intent.type === 'data_analysis') {
        console.log(`[AI Agent] 執行資料分析: ${intent.analysisType || '統計'}`);
        response = await analyzeDataWithOllama(intent.analysisType || '統計', intent.params);
        // 驗證分析結果是否有效
        if (!response || !response.text) {
          response = { text: '您無法查看此資料', data: null };
        }
      } else {
        // 一般對話
        console.log(`[AI Agent] 執行一般對話`);
        response = await handleGeneralChatWithOllama(message);
      }
    } catch (queryError) {
      console.error('[AI Agent] 查詢執行錯誤:', queryError);
      // 如果是資料查詢相關的錯誤，返回固定訊息
      if (intent.type === 'database_query' || intent.type === 'data_analysis') {
        response = { text: '您無法查看此資料', data: null };
      } else {
        throw queryError; // 一般對話錯誤繼續向上拋出
      }
    }

    res.json({
      success: true,
      message: 'AI Agent 回應成功',
      data: {
        response: response.text,
        data: response.data,
        intent: intent.type,
        conversationId: conversationId || generateConversationId(),
      },
    });
  } catch (error) {
    console.error('[AI Agent] 錯誤:', error);
    
    // 檢查是否涉及資料查詢
    const lowerMessage = (req.body.message || '').toLowerCase();
    const dataQueryKeywords = [
      '工單', '目標', '排程', '照片', 'ticket', 'target', 'schedule',
      '數量', '多少', '幾個', '有多少', '統計', '查詢', '列出', '顯示', '找'
    ];
    const isDataQuery = dataQueryKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (isDataQuery) {
      // 如果是資料查詢相關的錯誤，返回固定訊息（使用成功格式，但內容是錯誤訊息）
      res.json({
        success: true,
        message: 'AI Agent 回應成功',
        data: {
          response: '您無法查看此資料',
          data: null,
          intent: 'error',
          conversationId: conversationId || generateConversationId(),
        },
      });
    } else {
      let errorMessage = 'AI Agent 處理失敗';
      if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Ollama 服務未啟動，請先啟動 Ollama（執行：ollama serve）';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Ollama 服務回應超時，請稍後再試';
      }
      
      res.status(500).json({
        success: false,
        message: errorMessage,
        error: error.message,
      });
    }
  }
});

/**
 * 使用 Ollama 分析用戶意圖
 */
async function analyzeIntentWithOllama(message) {
  const systemPrompt = `你是一個資料庫查詢助手。分析用戶的問題，判斷他們想要：
1. 查詢資料庫（database_query）- 用戶想要「列出」、「查詢」、「顯示」、「找出」具體的資料記錄
   - 例如：「查詢所有 AOI 工單」、「列出進行中的生產目標」、「顯示今天的排程」
   - 特徵：要求返回具體的資料列表
2. 分析資料（data_analysis）- 用戶想要「分析」、「統計」、「計算」、「評估」、「比較」、「趨勢」、「完成率」、「效率」等
   - 例如：「分析各類工單的完成率」、「統計工單數量」、「分析生產目標的狀態分布」、「計算完成率」、「比較不同工單類型的效率」
   - 特徵：要求對資料進行統計、分析、計算或比較，而不是返回具體記錄
3. 一般對話（general_chat）- 其他問題，如使用說明、功能介紹等

可用資料表：
- ProductionTarget（生產目標/預生產目標）：id, name, materialType, responsiblePerson, status, expectedCompletionDate
  * 狀態值：PLANNING（規劃中）, IN_PROGRESS（進行中）, COMPLETED（已完成）, CANCELLED（已取消）
  * 查詢範例：「列出進行中的生產目標」、「查詢所有生產目標」、「顯示規劃中的目標」
- Ticket（工單）：id, deviceId, status, magnification, photoCount, 各種工單專用欄位
  * 狀態值：OPEN（開啟）, IN_PROGRESS（進行中）, COMPLETED（已完成）
- TicketSchedule（排程）：id, ticketId, targetId, scheduledDate, scheduledTime, priority, status
- Photo（照片）：id, ticketId, filename, originalName

重要：當用戶查詢「生產目標」、「預生產目標」、「目標」時，必須使用 ProductionTarget 資料表，而不是 Ticket。

工單類型（deviceId）：
- AOI：AOI工單
- Chang Medium：換液工單
- Sub & Freeze：繼代凍存工單
- Thaw：解凍工單
- Freeze：凍存工單
- Sub：繼代工單
- Collect & Discard：回收/丟棄工單

狀態值：
- Ticket: OPEN, IN_PROGRESS, COMPLETED
- ProductionTarget: PLANNING, IN_PROGRESS, COMPLETED, CANCELLED
- TicketSchedule: OPEN, IN_PROGRESS, COMPLETED

請用 JSON 格式回傳：
{
  "type": "database_query" | "data_analysis" | "general_chat",
  "query": "查詢描述（如果適用）",
  "params": {
    "table": "Ticket" | "ProductionTarget" | "TicketSchedule" | "Photo",
    "filters": {},
    "fields": []
  },
  "analysisType": "統計" | "趨勢" | "比較" | "完成率" | "效率"（如果 type 是 data_analysis）
}

重要判斷規則：
- 如果問題包含「分析」、「統計」、「計算」、「評估」、「比較」、「趨勢」、「完成率」、「效率」、「分布」、「比例」、「平均」、「總計」、「數量」等詞，且不是要求列出具體記錄，則 type 應該是 "data_analysis"
- 如果問題只是要求「列出」、「查詢」、「顯示」具體的資料，則 type 應該是 "database_query"
- 如果問題包含「分析」但同時要求「列出」具體資料，則優先判斷為 "database_query"（因為用戶想要看到資料）
`;

  try {
    const response = await axios.post(`${OLLAMA_API_URL}/api/chat`, {
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      stream: false,
      options: {
        temperature: 0.3,
        num_predict: 500,
      },
    }, {
      timeout: 30000, // 30 秒超時
    });

    const content = response.data.message.content;
    console.log(`[AI Agent] Ollama 回應:`, content);

    // 嘗試解析 JSON
    try {
      // 嘗試提取 JSON 部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (parseError) {
      // 如果無法解析 JSON，使用關鍵字判斷
      const lowerContent = content.toLowerCase();
      const lowerMessage = message.toLowerCase();
      
      // 優先檢查是否為分析類查詢（必須在查詢類之前檢查，避免誤判）
      if (isAnalysisQuery(lowerMessage)) {
        console.log(`[AI Agent] 識別為分析查詢: ${message}`);
        return {
          type: 'data_analysis',
          analysisType: inferAnalysisType(lowerMessage),
          params: {},
        };
      }
      
      // 檢查是否為資料查詢（擴展關鍵字匹配）
      if (lowerMessage.includes('查詢') || lowerMessage.includes('列出') || 
          lowerMessage.includes('顯示') || lowerMessage.includes('找') ||
          lowerMessage.includes('生產目標') || lowerMessage.includes('預生產目標') ||
          lowerMessage.includes('數量') || lowerMessage.includes('多少') || 
          lowerMessage.includes('幾個') || lowerMessage.includes('有多少') ||
          (lowerMessage.includes('工單') && (lowerMessage.includes('有') || lowerMessage.includes('是'))) ||
          (lowerMessage.includes('目標') && (lowerMessage.includes('有') || lowerMessage.includes('是')))) {
        const inferredTable = inferTable(lowerMessage);
        console.log(`[AI Agent] 推斷資料表: ${inferredTable} (查詢: ${message})`);
        return {
          type: 'database_query',
          query: message,
          params: { table: inferredTable },
        };
      }
      
      return { type: 'general_chat', query: null, params: {} };
    }
  } catch (error) {
    console.error('[AI Agent] 分析意圖錯誤:', error);
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama 服務未啟動');
    }
    // 降級處理：使用關鍵字判斷
    const lowerMessage = message.toLowerCase();
    
    // 優先檢查是否為分析查詢
    if (isAnalysisQuery(lowerMessage)) {
      console.log(`[AI Agent] 降級處理：識別為分析查詢: ${message}`);
      return {
        type: 'data_analysis',
        analysisType: inferAnalysisType(lowerMessage),
        params: {},
      };
    }
    
    // 檢查是否為資料查詢（擴展關鍵字匹配）
    if (lowerMessage.includes('查詢') || lowerMessage.includes('列出') || 
        lowerMessage.includes('顯示') || lowerMessage.includes('找') ||
        lowerMessage.includes('數量') || lowerMessage.includes('多少') || 
        lowerMessage.includes('幾個') || lowerMessage.includes('有多少') ||
        (lowerMessage.includes('工單') && (lowerMessage.includes('有') || lowerMessage.includes('是'))) ||
        (lowerMessage.includes('目標') && (lowerMessage.includes('有') || lowerMessage.includes('是')))) {
      return { 
        type: 'database_query', 
        query: message, 
        params: { table: inferTable(lowerMessage) } 
      };
    }
    
    return { type: 'general_chat', query: null, params: {} };
  }
}

/**
 * 推斷查詢的資料表
 */
function inferTable(message) {
  const lowerMessage = message.toLowerCase();
  
  // 優先檢查「生產目標」相關關鍵字（必須優先，因為「目標」可能出現在其他上下文中）
  if (lowerMessage.includes('生產目標') || lowerMessage.includes('預生產目標') || 
      lowerMessage.includes('productiontarget') || lowerMessage.includes('預生產')) {
    return 'ProductionTarget';
  }
  
  // 檢查「目標」（但排除「工單目標」等組合）
  if ((lowerMessage.includes('目標') || lowerMessage.includes('target')) && 
      !lowerMessage.includes('工單目標') && !lowerMessage.includes('ticket target')) {
    return 'ProductionTarget';
  }
  
  // 檢查「排程」
  if (lowerMessage.includes('排程') || lowerMessage.includes('schedule')) {
    return 'TicketSchedule';
  }
  
  // 檢查「工單」
  if (lowerMessage.includes('工單') || lowerMessage.includes('ticket')) {
    return 'Ticket';
  }
  
  // 檢查「照片」
  if (lowerMessage.includes('照片') || lowerMessage.includes('photo')) {
    return 'Photo';
  }
  
  return 'Ticket'; // 預設
}

/**
 * 判斷是否為分析類查詢
 */
function isAnalysisQuery(message) {
  const analysisKeywords = [
    '分析', '統計', '計算', '評估', '比較', '趨勢', '完成率', '效率',
    '分布', '比例', '平均', '總計', '數量', '百分比', '比率',
    'analyze', 'analysis', 'statistics', 'stat', 'calculate', 'compare',
    'trend', 'rate', 'efficiency', 'distribution', 'ratio', 'average', 'total'
  ];
  
  const queryKeywords = ['列出', '查詢', '顯示', '找出', 'list', 'query', 'show', 'find'];
  
  // 檢查是否包含分析關鍵字
  const hasAnalysisKeyword = analysisKeywords.some(keyword => message.includes(keyword));
  
  // 檢查是否同時包含查詢關鍵字（如果同時包含，可能是查詢而非分析）
  const hasQueryKeyword = queryKeywords.some(keyword => message.includes(keyword));
  
  // 如果包含分析關鍵字，且不包含查詢關鍵字，則判斷為分析
  // 或者如果明確包含「分析」、「統計」等強分析關鍵字，即使有查詢關鍵字也判斷為分析
  const strongAnalysisKeywords = ['分析', '統計', '計算', '完成率', '效率', 'analyze', 'statistics'];
  const hasStrongAnalysisKeyword = strongAnalysisKeywords.some(keyword => message.includes(keyword));
  
  if (hasStrongAnalysisKeyword) {
    return true; // 強分析關鍵字優先
  }
  
  if (hasAnalysisKeyword && !hasQueryKeyword) {
    return true; // 有分析關鍵字且沒有查詢關鍵字
  }
  
  return false;
}

/**
 * 推斷分析類型
 */
function inferAnalysisType(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('趨勢') || lowerMessage.includes('trend')) {
    return '趨勢';
  }
  if (lowerMessage.includes('比較') || lowerMessage.includes('compare')) {
    return '比較';
  }
  if (lowerMessage.includes('完成率') || lowerMessage.includes('completion rate') || 
      lowerMessage.includes('完成')) {
    return '完成率';
  }
  if (lowerMessage.includes('效率') || lowerMessage.includes('efficiency')) {
    return '效率';
  }
  if (lowerMessage.includes('分布') || lowerMessage.includes('distribution')) {
    return '分布';
  }
  
  return '統計'; // 預設
}

/**
 * 執行資料庫查詢
 */
async function executeDatabaseQuery(queryDescription, params) {
  try {
    const { table, filters = {}, fields = [] } = params;
    
    // 驗證 table 參數
    if (!table || !['Ticket', 'ProductionTarget', 'TicketSchedule', 'Photo'].includes(table)) {
      console.error(`[AI Agent] 無效的資料表: ${table}`);
      return { text: '您無法查看此資料', data: null };
    }

    if (table === 'Ticket') {
      // 構建查詢條件
      const where = {};
      
      // 根據查詢描述推斷過濾條件
      const lowerQuery = queryDescription.toLowerCase();
      
      if (lowerQuery.includes('aoi')) {
        where.deviceId = 'AOI';
      } else if (lowerQuery.includes('換液')) {
        where.deviceId = 'Chang Medium';
      } else if (lowerQuery.includes('解凍')) {
        where.deviceId = 'Thaw';
      } else if (lowerQuery.includes('凍存')) {
        where.deviceId = 'Freeze';
      } else if (lowerQuery.includes('繼代')) {
        where.deviceId = lowerQuery.includes('凍存') ? 'Sub & Freeze' : 'Sub';
      } else if (lowerQuery.includes('回收') || lowerQuery.includes('丟棄')) {
        where.deviceId = 'Collect & Discard';
      }
      
      // 狀態過濾：優先匹配更精確的狀態關鍵字
      // 注意：必須按照從最精確到最模糊的順序匹配
      // 注意：資料庫中可能使用 CLOSED 或 COMPLETED，需要同時查詢兩者
      if (lowerQuery.includes('已完成') || lowerQuery.includes('已結束') || 
          (lowerQuery.includes('完成') && !lowerQuery.includes('未完成'))) {
        // 資料庫中可能使用 CLOSED 或 COMPLETED，使用 OR 條件查詢
        // 但 Prisma 不支持 OR 在 where 中，所以我們先查詢 CLOSED，如果沒有結果再查詢 COMPLETED
        // 或者使用 in 查詢
        where.status = { in: ['COMPLETED', 'CLOSED'] };
      } else if (lowerQuery.includes('進行中') || lowerQuery.includes('執行中') || 
                 lowerQuery.includes('in_progress')) {
        where.status = 'IN_PROGRESS';
      } else if (lowerQuery.includes('開啟') || lowerQuery.includes('待處理') || 
                 lowerQuery.includes('open') || lowerQuery.includes('pending')) {
        where.status = 'OPEN';
      }
      
      console.log(`[AI Agent] 工單查詢條件:`, JSON.stringify(where, null, 2));

      // 工單類型名稱映射
      const deviceIdToName = {
        'AOI': 'AOI工單',
        'Chang Medium': '換液工單',
        'Thaw': '解凍工單',
        'Freeze': '凍存工單',
        'Sub & Freeze': '繼代凍存工單',
        'Sub': '繼代工單',
        'Collect & Discard': '回收/丟棄工單',
      };

      // 如果查詢包含「數量」、「多少」等關鍵字，只返回統計資訊
      const isCountQuery = lowerQuery.includes('數量') || lowerQuery.includes('多少') || 
                          lowerQuery.includes('幾個') || lowerQuery.includes('有多少');
      
      if (isCountQuery) {
        // 只查詢數量，不返回詳細資料
        const count = await prisma.ticket.count({
          where: Object.keys(where).length > 0 ? where : undefined,
        });
        
        // 如果有狀態過濾，也返回狀態統計
        let statusBreakdown = '';
        if (where.status) {
          // 處理狀態可能是對象（in 查詢）或字符串的情況
          let statusValue = where.status;
          if (typeof where.status === 'object' && where.status.in) {
            // 如果是 in 查詢，使用第一個狀態值來顯示
            statusValue = where.status.in[0];
          }
          statusBreakdown = `（狀態：${statusValue === 'OPEN' ? '開啟' : statusValue === 'IN_PROGRESS' ? '進行中' : '已完成'}）`;
        }
        
        const ticketTypeName = where.deviceId ? (deviceIdToName[where.deviceId] || where.deviceId) : '工單';
        
        return {
          text: `目前資料庫中有 ${count} 筆${ticketTypeName}${statusBreakdown}。`,
          data: { count, deviceId: where.deviceId, status: where.status },
          fullCount: count,
        };
      }

      const tickets = await prisma.ticket.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        include: {
          schedules: {
            include: {
              target: true,
            },
          },
          photos: true,
        },
        take: 100, // 限制最多 100 筆
        orderBy: { createdAt: 'desc' },
      });

      return {
        text: `找到 ${tickets.length} 筆工單。${tickets.length > 0 ? '以下是前幾筆：' : ''}`,
        data: tickets.slice(0, 10), // 只返回前 10 筆給 AI 分析
        fullCount: tickets.length,
      };
    } else if (table === 'ProductionTarget') {
      const where = {};
      const lowerQuery = queryDescription.toLowerCase();
      
      // 更精確的狀態匹配
      if (lowerQuery.includes('進行中') || lowerQuery.includes('in_progress')) {
        where.status = 'IN_PROGRESS';
      } else if (lowerQuery.includes('規劃') || lowerQuery.includes('planning')) {
        where.status = 'PLANNING';
      } else if (lowerQuery.includes('完成') || lowerQuery.includes('completed')) {
        where.status = 'COMPLETED';
      } else if (lowerQuery.includes('取消') || lowerQuery.includes('cancelled')) {
        where.status = 'CANCELLED';
      }

      // 如果查詢包含「數量」、「多少」等關鍵字，只返回統計資訊
      const isCountQuery = lowerQuery.includes('數量') || lowerQuery.includes('多少') || 
                          lowerQuery.includes('幾個') || lowerQuery.includes('有多少');
      
      if (isCountQuery) {
        // 只查詢數量，不返回詳細資料
        const count = await prisma.productionTarget.count({
          where: Object.keys(where).length > 0 ? where : undefined,
        });
        
        // 如果有狀態過濾，也返回狀態統計
        let statusBreakdown = '';
        if (where.status) {
          statusBreakdown = `（狀態：${where.status === 'PLANNING' ? '規劃中' : where.status === 'IN_PROGRESS' ? '進行中' : where.status === 'COMPLETED' ? '已完成' : '已取消'}）`;
        }
        
        return {
          text: `目前資料庫中有 ${count} 筆生產目標${statusBreakdown}。`,
          data: { count, status: where.status },
          fullCount: count,
        };
      }

      console.log(`[AI Agent] 查詢生產目標，條件:`, where);

      const targets = await prisma.productionTarget.findMany({
        where: Object.keys(where).length > 0 ? where : undefined,
        include: {
          schedules: {
            include: {
              ticket: true,
            },
          },
        },
        take: 100,
        orderBy: { createdAt: 'desc' },
      });

      console.log(`[AI Agent] 找到 ${targets.length} 筆生產目標`);

      return {
        text: `找到 ${targets.length} 筆生產目標。${targets.length > 0 ? '以下是前幾筆：' : ''}`,
        data: targets.slice(0, 10),
        fullCount: targets.length,
      };
    } else if (table === 'TicketSchedule') {
      const schedules = await prisma.ticketSchedule.findMany({
        include: {
          ticket: true,
          target: true,
        },
        take: 100,
        orderBy: { scheduledDate: 'desc' },
      });

      return {
        text: `找到 ${schedules.length} 筆排程。`,
        data: schedules.slice(0, 10),
        fullCount: schedules.length,
      };
    }

    return {
      text: '您無法查看此資料',
      data: null,
    };
  } catch (error) {
    console.error('[AI Agent] 資料庫查詢錯誤:', error);
    return {
      text: '您無法查看此資料',
      data: null,
    };
  }
}

/**
 * 使用 Ollama 進行資料分析
 */
async function analyzeDataWithOllama(analysisType, params) {
  try {
    console.log(`[AI Agent] 開始資料分析，類型: ${analysisType}`);
    
    // 先查詢統計資料
    const ticketStats = await prisma.ticket.groupBy({
      by: ['deviceId', 'status'],
      _count: true,
    });

    const targetStats = await prisma.productionTarget.groupBy({
      by: ['status'],
      _count: true,
    });

    // 計算完成率
    const totalTickets = await prisma.ticket.count();
    const completedTickets = await prisma.ticket.count({
      where: { status: 'COMPLETED' },
    });
    const completionRate = totalTickets > 0 ? (completedTickets / totalTickets * 100).toFixed(2) : 0;
    
    // 計算各類工單的完成率
    const ticketTypeStats = await prisma.ticket.groupBy({
      by: ['deviceId'],
      _count: true,
    });
    
    const ticketTypeCompletion = await Promise.all(
      ticketTypeStats.map(async (stat) => {
        const total = await prisma.ticket.count({
          where: { deviceId: stat.deviceId },
        });
        const completed = await prisma.ticket.count({
          where: { deviceId: stat.deviceId, status: 'COMPLETED' },
        });
        return {
          deviceId: stat.deviceId,
          total,
          completed,
          completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : '0.00',
        };
      })
    );

    // 根據分析類型構建不同的分析提示
    let analysisPrompt = '';
    
    if (analysisType === '完成率') {
      analysisPrompt = `根據以下統計資料，提供專業的完成率分析報告（用繁體中文）：

【工單統計】
${JSON.stringify(ticketStats, null, 2)}

【各類工單完成率】
${JSON.stringify(ticketTypeCompletion, null, 2)}

【生產目標統計】
${JSON.stringify(targetStats, null, 2)}

【整體工單完成率】
${completionRate}% (${completedTickets}/${totalTickets})

請提供：
1. 完成率摘要（各類工單和整體完成率）
2. 完成率分析（哪些工單類型完成率較高/較低，可能的原因）
3. 改進建議（如何提高完成率）`;
    } else if (analysisType === '趨勢') {
      analysisPrompt = `根據以下統計資料，提供專業的趨勢分析報告（用繁體中文）：

【工單統計】
${JSON.stringify(ticketStats, null, 2)}

【生產目標統計】
${JSON.stringify(targetStats, null, 2)}

【各類工單完成率】
${JSON.stringify(ticketTypeCompletion, null, 2)}

請提供：
1. 趨勢摘要（當前資料顯示的主要趨勢）
2. 趨勢分析（工單類型分布趨勢、狀態變化趨勢等）
3. 未來預測或建議（基於當前趨勢的預測或建議）`;
    } else if (analysisType === '比較') {
      analysisPrompt = `根據以下統計資料，提供專業的比較分析報告（用繁體中文）：

【工單統計】
${JSON.stringify(ticketStats, null, 2)}

【各類工單完成率】
${JSON.stringify(ticketTypeCompletion, null, 2)}

【生產目標統計】
${JSON.stringify(targetStats, null, 2)}

請提供：
1. 比較摘要（不同工單類型、不同狀態之間的比較）
2. 比較分析（各類工單的差異、優劣勢分析）
3. 比較結論（基於比較的發現和建議）`;
    } else {
      // 預設統計分析
      analysisPrompt = `根據以下統計資料，提供專業的統計分析報告（用繁體中文）：

【工單統計】
${JSON.stringify(ticketStats, null, 2)}

【各類工單完成率】
${JSON.stringify(ticketTypeCompletion, null, 2)}

【生產目標統計】
${JSON.stringify(targetStats, null, 2)}

【整體完成率】
${completionRate}% (${completedTickets}/${totalTickets})

請提供：
1. 資料摘要（簡要說明統計結果）
2. 主要發現（指出重要趨勢或問題）
3. 建議或洞察（提供實用建議）`;
    }

    const response = await axios.post(`${OLLAMA_API_URL}/api/chat`, {
      model: OLLAMA_MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一個資料分析專家，擅長提供專業的統計分析報告。請用繁體中文回答，報告要簡潔明瞭。',
        },
        { role: 'user', content: analysisPrompt },
      ],
      stream: false,
      options: {
        temperature: 0.5,
        num_predict: 1000,
      },
    }, {
      timeout: 60000, // 60 秒超時
    });

    console.log(`[AI Agent] 分析完成，類型: ${analysisType}`);

    return {
      text: response.data.message.content,
      data: {
        ticketStats,
        targetStats,
        ticketTypeCompletion,
        completionRate: parseFloat(completionRate),
        totalTickets,
        completedTickets,
        analysisType,
      },
    };
  } catch (error) {
    console.error('[AI Agent] 資料分析錯誤:', error);
    // 所有資料分析錯誤都返回固定訊息，避免 AI 編造資料
    return {
      text: '您無法查看此資料',
      data: null,
    };
  }
}

/**
 * 使用 Ollama 處理一般對話
 */
async function handleGeneralChatWithOllama(message) {
  try {
    const lowerMessage = message.toLowerCase();
    
    // 檢查是否涉及資料查詢（即使被誤判為一般對話，也要先查詢資料庫）
    const dataQueryKeywords = [
      '工單', '目標', '排程', '照片', 'ticket', 'target', 'schedule',
      '數量', '多少', '幾個', '有多少', '統計', '查詢', '列出'
    ];
    
    const hasDataQueryKeyword = dataQueryKeywords.some(keyword => lowerMessage.includes(keyword));
    
    // 如果涉及資料查詢，先查詢資料庫再回答
    if (hasDataQueryKeyword) {
      console.log(`[AI Agent] 一般對話中檢測到資料查詢關鍵字，先查詢資料庫: ${message}`);
      
      // 嘗試識別查詢類型
      let queryType = 'database_query';
      let analysisType = null;
      
      if (isAnalysisQuery(lowerMessage)) {
        queryType = 'data_analysis';
        analysisType = inferAnalysisType(lowerMessage);
      }
      
      // 執行資料查詢或分析
      let queryResult;
      if (queryType === 'data_analysis') {
        queryResult = await analyzeDataWithOllama(analysisType || '統計', {});
      } else {
        const inferredTable = inferTable(lowerMessage);
        queryResult = await executeDatabaseQuery(message, { table: inferredTable });
      }
      
      // 如果查詢成功，使用查詢結果回答
      if (queryResult && queryResult.text && queryResult.text !== '您無法查看此資料') {
        return {
          text: queryResult.text,
          data: queryResult.data,
        };
      } else {
        // 查詢失敗，返回固定訊息
        return {
          text: '您無法查看此資料',
          data: null,
        };
      }
    }
    
    // 如果沒有涉及資料查詢，使用 Ollama 回答（但嚴格限制，避免編造資料）
    const response = await axios.post(`${OLLAMA_API_URL}/api/chat`, {
      model: OLLAMA_MODEL,
      messages: [
        {
          role: 'system',
          content: `你是一個工單管理系統的 AI 助手。你可以幫助用戶：
1. 查詢資料庫（例如：查詢所有 AOI 工單、列出進行中的目標）
2. 分析資料（例如：統計各類工單數量、分析完成率）
3. 回答系統使用問題

**嚴格規則：**
- 如果用戶詢問任何關於工單、目標、排程、照片等資料庫資料的問題（包括數量、狀態、內容等），你必須明確回答「您無法查看此資料」，不要編造或猜測任何數字或資訊。
- 你只能回答系統使用說明、功能介紹等不涉及具體資料的問題。
- 絕對不要編造或猜測資料庫中的任何資料。

請用繁體中文回答，回答要簡潔實用。`,
        },
        { role: 'user', content: message },
      ],
      stream: false,
      options: {
        temperature: 0.3, // 降低溫度，減少編造
        num_predict: 500,
      },
    }, {
      timeout: 30000,
    });

    // 檢查回應是否包含資料相關內容，如果包含則返回固定訊息
    const responseText = response.data.message.content;
    const dataKeywords = ['工單', '目標', '排程', '照片', '數量', '多少', '幾個', '有', '是', 'ticket', 'target', 'schedule'];
    const containsDataInfo = dataKeywords.some(keyword => responseText.toLowerCase().includes(keyword));
    
    if (containsDataInfo && !responseText.includes('您無法查看此資料')) {
      // 如果 AI 回應包含資料相關內容，但沒有明確說明無法查看，則返回固定訊息
      return {
        text: '您無法查看此資料',
        data: null,
      };
    }

    return {
      text: responseText,
      data: null,
    };
  } catch (error) {
    console.error('[AI Agent] 一般對話錯誤:', error);
    
    // 如果 Ollama 錯誤，但涉及資料查詢，嘗試直接查詢資料庫
    const lowerMessage = message.toLowerCase();
    const dataQueryKeywords = [
      '工單', '目標', '排程', '照片', 'ticket', 'target', 'schedule',
      '數量', '多少', '幾個', '有多少', '統計', '查詢', '列出'
    ];
    
    const hasDataQueryKeyword = dataQueryKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (hasDataQueryKeyword && (error.code === 'ECONNREFUSED' || error.response?.status === 404)) {
      console.log(`[AI Agent] Ollama 無法使用，但檢測到資料查詢，直接查詢資料庫: ${message}`);
      
      try {
        let queryResult;
        if (isAnalysisQuery(lowerMessage)) {
          queryResult = await analyzeDataWithOllama(inferAnalysisType(lowerMessage) || '統計', {});
        } else {
          const inferredTable = inferTable(lowerMessage);
          queryResult = await executeDatabaseQuery(message, { table: inferredTable });
        }
        
        if (queryResult && queryResult.text && queryResult.text !== '您無法查看此資料') {
          return {
            text: queryResult.text,
            data: queryResult.data,
          };
        } else {
          // 查詢失敗，返回固定訊息
          return {
            text: '您無法查看此資料',
            data: null,
          };
        }
      } catch (dbError) {
        console.error('[AI Agent] 資料庫查詢也失敗:', dbError);
        // 資料庫查詢失敗，返回固定訊息
        return {
          text: '您無法查看此資料',
          data: null,
        };
      }
    }
    
    // 如果涉及資料查詢但 Ollama 無法使用，返回固定訊息
    if (hasDataQueryKeyword) {
      return {
        text: '您無法查看此資料',
        data: null,
      };
    }
    
    // 一般對話錯誤（不涉及資料查詢）
    if (error.code === 'ECONNREFUSED') {
      return {
        text: '❌ Ollama 服務未啟動。請先啟動 Ollama（執行：ollama serve）',
        data: null,
      };
    }
    return {
      text: `❌ 發生錯誤：${error.message}。請稍後再試。`,
      data: null,
    };
  }
}

/**
 * 生成對話 ID
 */
function generateConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

module.exports = router;


