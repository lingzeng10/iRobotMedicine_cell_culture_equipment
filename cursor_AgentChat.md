# 開啟網頁
_Exported on 2025/11/2 at 23:18:36 [GMT+8] from Cursor (1.7.54)_

---

**User**

開啟網頁

---

**Cursor**


檢查專案設定以確定啟動方式。


使用根目錄的 `dev` 腳本同時啟動前端（3000）與後端（5000）。


正在啟動前端與後端服務。

- 前端（React）：`http://localhost:3000`
- 後端 API：`http://localhost:5000`

啟動後，瀏覽器通常會自動打開前端頁面。若沒有自動打開，請手動在瀏覽器訪問 `http://localhost:3000`。

服務正在背景執行。如需停止，告訴我即可。

---

**User**

兩個網頁都打不開

---

**Cursor**


錯誤是因為在錯誤的目錄執行。切換到專案根目錄，檢查並啟動服務。


檢查服務是否正確啟動，並確認端口配置：


PowerShell 不支援 `&&`。改為分別啟動前後端服務：


檢查依賴是否已安裝，然後啟動服務：


先啟動後端服務，再啟動前端服務：


等待服務啟動，然後檢查狀態：


兩個服務已啟動：
- 後端服務：5000 端口
- 前端服務：3000 端口

正在開啟瀏覽器：


已開啟瀏覽器並啟動服務。

**服務狀態：**
- **前端服務**（React）：運行在 `http://localhost:3000`
- **後端服務**（Express API）：運行在 `http://localhost:5000`

瀏覽器應已自動打開前端頁面。如果沒有，請手動訪問：
- **前端網頁**：http://localhost:3000
- **後端健康檢查**：http://localhost:5000/health

兩個服務都在背景運行中。如需停止服務，告訴我即可。

---

**User**

為什麼後端找不到服務?

---

**Cursor**


後端正常運行，但直接訪問根路徑 `/` 會返回 404，因為後端是 API 服務，沒有前端頁面。檢查可用的端點：


後端正常運行，但只提供 API，沒有前端頁面。直接訪問 `http://localhost:5000` 會觸發 404。

可用的端點：
- 健康檢查：`http://localhost:5000/health`
- API 端點：`http://localhost:5000/api/*`

前端網頁應訪問：`http://localhost:3000`

為後端添加一個根路徑歡迎頁，方便測試：


```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// 引入路由
const ticketRoutes = require('./routes/tickets');
const targetRoutes = require('./routes/targets');
const scheduleRoutes = require('./routes/schedules');
const photoRoutes = require('./routes/photos');
const versionRoutes = require('./routes/version');

// 建立 Express 應用程式
const app = express();
const PORT = process.env.PORT || 5000;

// 中介軟體設定
app.use(helmet()); // 安全性中介軟體
app.use(cors({
  origin: true, // 允許所有來源（開發環境）
  credentials: true
})); // 跨域請求設定
app.use(morgan('combined')); // 請求日誌
app.use(express.json({ limit: '10mb' })); // JSON 解析，支援 UTF-8
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL 編碼解析，支援 UTF-8

// 根路徑歡迎頁面
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '工單管理系統後端 API 服務',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      tickets: '/api/tickets',
      targets: '/api/targets',
      schedules: '/api/schedules',
      photos: '/api/photos',
      version: '/api/version'
    },
    timestamp: new Date().toISOString()
  });
});

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: '工單管理系統後端服務正常運行',
    timestamp: new Date().toISOString()
  });
});

// API 路由
app.use('/api/tickets', ticketRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/photos', photoRoutes);
app.use('/api/version', versionRoutes);

// 404 處理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '找不到請求的資源'
  });
});

// 全域錯誤處理
app.use((err, req, res, next) => {
  console.error('伺服器錯誤:', err);
  res.status(500).json({
    success: false,
    message: '伺服器內部錯誤',
    error: process.env.NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
});

// 啟動伺服器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 工單管理系統後端服務已啟動`);
  console.log(`📍 服務地址: http://localhost:${PORT}`);
  console.log(`🌐 外部訪問: http://[您的IP地址]:${PORT}`);
  console.log(`🌍 環境: ${process.env.NODE_ENV || 'development'}`);
});

```

已為後端添加根路徑處理。由於使用 nodemon，變更會自動重新載入。

現在：
- 訪問 `http://localhost:5000` 會看到 API 服務信息和可用端點列表
- 訪問 `http://localhost:3000` 是前端網頁（工單管理系統界面）
- 訪問 `http://localhost:5000/health` 可檢查後端健康狀態

**說明**：
- 後端（端口 5000）：API 服務器，提供 JSON API
- 前端（端口 3000）：React 網頁應用，提供用戶界面

請重新整理 `http://localhost:5000`，應會看到服務信息和端點列表。前端網頁請訪問 `http://localhost:3000`。


檢測到資料庫錯誤：資料庫缺少 `ProductionTarget.actualYield` 欄位。檢查 Prisma schema 與路由，準備同步資料庫：


問題是 Prisma Client 與資料庫不同步。重新生成 Prisma Client，並同步資料庫：


權限錯誤，可能是文件正在使用中。改用 Prisma 的 db push 同步資料庫架構：


資料庫已同步。重啟後端服務以重新載入 Prisma Client（可能因權限問題未正確生成）。檢查後端服務的狀態：


搜尋程式碼中是否使用 `actualYield`：


程式碼中未使用 `actualYield`，可能是 Prisma Client 的緩存問題。測試 API 是否正常運作：


錯誤已變為 `productionTarget`。檢查資料庫結構：


重新生成 Prisma Client：先停止後端服務（釋放文件鎖），然後重新生成。


重新生成 Prisma Client：


Prisma Client 文件仍被占用。找到使用 5000 端口的進程並停止它：


重新生成 Prisma Client：


已成功重新生成 Prisma Client。重啟後端服務：


等待服務啟動，然後測試 API：


問題已解決。API 現在正常運作。

**問題原因：**
- Prisma Client 與資料庫不同步
- 後端服務正在運行，導致無法重新生成 Prisma Client

**解決步驟：**
1. 停止後端服務
2. 清除 Prisma Client 緩存
3. 重新生成 Prisma Client
4. 重啟後端服務

**服務狀態：**
- 後端 API 服務：`http://localhost:5000`（正常運行）
- 前端網頁應用：`http://localhost:3000`（正常運行）

現在可以在瀏覽器中訪問 `http://localhost:3000`，應可正常使用工單管理系統。

---

**User**

請把這一行拿掉

---

**Cursor**


檢視 `client/src/types/target.ts`，定位要移除的行：


移除第 80 行的空行：


```typescript
// 預生產目標狀態枚舉
export enum TargetStatus {
  PLANNING = 'PLANNING',     // 規劃中
  IN_PROGRESS = 'IN_PROGRESS', // 進行中
  COMPLETED = 'COMPLETED',   // 已完成
  CANCELLED = 'CANCELLED'    // 已取消
}

// 預生產目標資料介面
export interface ProductionTarget {
  id: string;
  name: string;                    // 目標名稱
  description?: string;            // 目標描述
  expectedCompletionDate: string;  // 預計完成時間
  status: TargetStatus;            // 目標狀態
  createdAt: string;              // 建立時間
  updatedAt: string;              // 更新時間
}

// 建立預生產目標請求介面
export interface CreateTargetRequest {
  name: string;
  description?: string;
  expectedCompletionDate: string;
}

// 更新預生產目標請求介面
export interface UpdateTargetRequest {
  name?: string;
  description?: string;
  expectedCompletionDate?: string;
  status?: TargetStatus;
}

// 預生產目標列表回應介面
export interface TargetListResponse {
  targets: ProductionTarget[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 工單排程資料介面
export interface TicketSchedule {
  id: string;
  ticketId: string;
  targetId: string;
  scheduledDate: string;          // 排程日期
  scheduledTime?: string;         // 排程時間
  priority: 'HIGH' | 'MEDIUM' | 'LOW'; // 優先級
  status: string;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}

// 包含關聯資料的工單排程介面（用於 API 回應）
export interface TicketScheduleWithRelations extends TicketSchedule {
  ticket: {
    id: string;
    deviceId: string;
    imageId?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  target: {
    id: string;
    name: string;
    description?: string;
    expectedCompletionDate: string;
    status: TargetStatus;
    createdAt: string;
    updatedAt: string;
  };
}
// 建立工單排程請求介面
export interface CreateScheduleRequest {
  ticketId: string;
  targetId: string;
  scheduledDate: string;
  scheduledTime?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// 更新工單排程請求介面
export interface UpdateScheduleRequest {
  scheduledDate?: string;
  scheduledTime?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  status?: string;
}

```

已移除第 80 行的空行。檢查是否有語法錯誤：


已移除第 80 行的空行，沒有語法錯誤。文件已更新。

---

**User**

請把這個欄位刪掉

---

**Cursor**


搜尋顯示「目標」欄位的程式碼：


搜尋顯示「目標 :」文字的具體位置：


已找到顯示「目標」的程式碼。移除該欄位：


移除顯示「目標」欄位的程式碼：


```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  PriorityHigh as HighPriorityIcon,
  Circle as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { ProductionTarget, TicketSchedule, TicketScheduleWithRelations, CreateScheduleRequest, UpdateScheduleRequest, TargetStatus } from '../types/target';
import { Ticket } from '../types/ticket';
import { TargetService } from '../services/targetApi';
import { TicketService } from '../services/api';
import { formatTicketDisplay, getStationDisplay, getTicketName } from '../utils/stationMapping';

// 工單排程元件屬性介面
interface TicketScheduleProps {
  selectedTarget: ProductionTarget | null; // 選中的預生產目標
  onTicketSelect: (ticket: Ticket) => void; // 工單選擇回調函數
  onTargetUpdate?: (targetId: string, updatedTarget: ProductionTarget) => void; // 目標更新回調函數
}

// 工單排程元件
const TicketScheduleComponent: React.FC<TicketScheduleProps> = ({ 
  selectedTarget, 
  onTicketSelect,
  onTargetUpdate
}) => {
  // 狀態管理
  const [schedules, setSchedules] = useState<TicketSchedule[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TicketSchedule | null>(null);

  // 新增排程表單狀態
  const [newSchedule, setNewSchedule] = useState<CreateScheduleRequest>({
    ticketId: '',
    targetId: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'MEDIUM',
  });

  // 表單驗證錯誤狀態
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * 載入工單排程資料
   */
  const loadSchedules = useCallback(async () => {
    if (!selectedTarget) {
      setSchedules([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 載入指定目標的工單排程
      const scheduleResponse = await TargetService.getTargetSchedules(selectedTarget.id);
      
      if (scheduleResponse.success && scheduleResponse.data) {
        setSchedules(scheduleResponse.data);
      } else {
        setError(scheduleResponse.message || '載入工單排程失敗');
      }

      // 載入所有工單（用於新增排程時選擇）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入工單排程錯誤:', error);
      setError('載入工單排程失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [selectedTarget]);

  /**
   * 處理新增排程
   */
  const handleCreateSchedule = async () => {
    // 表單驗證
    const errors: { [key: string]: string } = {};
    if (!newSchedule.ticketId) {
      errors.ticketId = '請選擇工單';
    }
    if (!newSchedule.scheduledDate) {
      errors.scheduledDate = '請選擇排程日期';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 確保資料格式符合後端 API 驗證規則
      const scheduleData: any = {
        ticketId: newSchedule.ticketId,
        targetId: selectedTarget!.id,
        scheduledDate: newSchedule.scheduledDate,
      };
      
      // 可選欄位
      if (newSchedule.scheduledTime) {
        scheduleData.scheduledTime = newSchedule.scheduledTime;
      }
      if (newSchedule.priority) {
        scheduleData.priority = newSchedule.priority;
      }
      
      // 調試：顯示要發送的資料
      console.log('準備建立排程資料:', scheduleData);
      console.log('可用工單列表:', tickets);
      console.log('原始 newSchedule:', newSchedule);
      
      const response = await TargetService.createSchedule(scheduleData);

      if (response.success && response.data) {
        setSchedules(prev => [...prev, response.data!]);
        
        // 如果目標狀態被自動更新為「進行中」，通知父組件
        if (response.data.target && response.data.target.status === TargetStatus.IN_PROGRESS && onTargetUpdate) {
          // 將 API 回應的 target 轉換為 ProductionTarget 類型
          const updatedTarget: ProductionTarget = {
            id: response.data.target.id,
            name: response.data.target.name,
            description: response.data.target.description,
            expectedCompletionDate: response.data.target.expectedCompletionDate,
            status: response.data.target.status,
            createdAt: response.data.target.createdAt,
            updatedAt: response.data.target.updatedAt,
          };
          onTargetUpdate(response.data.targetId, updatedTarget);
        }
        
        setCreateDialogOpen(false);
        setNewSchedule({
          ticketId: '',
          targetId: '',
          scheduledDate: '',
          scheduledTime: '',
          priority: 'MEDIUM',
        });
        setFormErrors({});
      } else {
        setError(response.message || '建立工單排程失敗');
      }
    } catch (error) {
      console.error('建立工單排程錯誤:', error);
      setError('建立工單排程失敗，請稍後再試');
    }
  };

  /**
   * 處理刪除排程
   * @param scheduleId 排程 ID
   */
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('確定要刪除這個工單排程嗎？')) {
      return;
    }

    try {
      const response = await TargetService.deleteSchedule(scheduleId);

      if (response.success) {
        setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      } else {
        setError(response.message || '刪除工單排程失敗');
      }
    } catch (error) {
      console.error('刪除工單排程錯誤:', error);
      setError('刪除工單排程失敗，請稍後再試');
    }
  };

  /**
   * 取得優先級顏色
   * @param priority 優先級
   */
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  /**
   * 取得優先級圖示
   * @param priority 優先級
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <HighPriorityIcon />;
      case 'MEDIUM':
        return <MediumPriorityIcon />;
      case 'LOW':
        return <LowPriorityIcon />;
      default:
        return <MediumPriorityIcon />;
    }
  };

  /**
   * 取得優先級文字
   * @param priority 優先級
   */
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return '未知';
    }
  };

  /**
   * 取得狀態顏色
   * @param status 狀態
   */
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CLOSED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * 取得狀態圖示
   * @param status 狀態
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ScheduleIcon />;
      case 'IN_PROGRESS':
        return <PlayArrowIcon />;
      case 'COMPLETED':
      case 'CLOSED':
        return <CheckCircleIcon />;
      case 'CANCELLED':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  /**
   * 取得狀態文字
   * @param status 狀態
   */
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return '待處理';
      case 'IN_PROGRESS':
        return '進行中';
      case 'COMPLETED':
        return '已完成';
      case 'CLOSED':
        return '已關閉';
      case 'CANCELLED':
        return '已取消';
      default:
        return '未知狀態';
    }
  };

  // 當選中目標變更時載入排程資料
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // 如果沒有選中目標，顯示提示訊息
  if (!selectedTarget) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            請選擇預生產目標
          </Typography>
          <Typography variant="body2" color="text.secondary">
            從左側列表選擇一個預生產目標，查看其工單排程
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 標題列 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                工單排程
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              size="small"
            >
              新增排程
            </Button>
          </Box>
        </Box>

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 載入中 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 排程列表 */}
        {!loading && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {schedules.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  尚無工單排程
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  點擊「新增排程」按鈕為此目標安排工單
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  新增排程
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {schedules.map((schedule) => {
                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                  
                  return (
                    <Box key={schedule.id}>
                      <Card sx={{ 
                        '&:hover': { 
                          boxShadow: 3,
                          cursor: 'pointer' 
                        } 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="div">
                                  {(() => {
                                    const ticket = tickets.find(t => t.id === schedule.ticketId);
                                    return ticket ? getTicketName(ticket.deviceId) : '未知工單';
                                  })()}
                                </Typography>
                                <Chip
                                  icon={getStatusIcon(schedule.status)}
                                  label={getStatusText(schedule.status)}
                                  color={getStatusColor(schedule.status)}
                                  size="small"
                                />
                                <Chip
                                  icon={getPriorityIcon(schedule.priority)}
                                  label={getPriorityText(schedule.priority)}
                                  color={getPriorityColor(schedule.priority)}
                                  size="small"
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Station: {(() => {
                                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                                  return ticket ? getStationDisplay(ticket.deviceId) : '未知';
                                })()}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {dayjs(schedule.scheduledDate).format('YYYY-MM-DD')}
                                  </Typography>
                                </Box>
                                {schedule.scheduledTime && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {schedule.scheduledTime}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="查看詳情">
                                <IconButton
                                  size="small"
                                  onClick={() => ticket && onTicketSelect(ticket)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="編輯排程">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingSchedule(schedule);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              {/* 工單照片按鈕 - 只有AOI工單才顯示，包含上傳和查看功能 */}
                              {(() => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                // 只對AOI工單顯示相機圖示
                                return ticket && ticket.deviceId === 'AOI' ? (
                                  <Tooltip title={`${getTicketName(ticket.deviceId)}照片管理（上傳/查看）`}>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const photoUrl = `/ticket/${ticket.id}/photos`;
                                        window.open(photoUrl, '_blank');
                                      }}
                                      sx={{ color: 'primary.main' }}
                                    >
                                      <PhotoCamera />
                                    </IconButton>
                                  </Tooltip>
                                ) : null;
                              })()}
                              <Tooltip title="刪除排程">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* 新增排程對話框 */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>新增工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                select
                label="選擇工單"
                value={newSchedule.ticketId}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, ticketId: e.target.value }))}
                error={!!formErrors.ticketId}
                helperText={formErrors.ticketId}
                required
              >
                {tickets.map((ticket) => (
                  <MenuItem key={ticket.id} value={ticket.id}>
                    <Typography>
                      {getTicketName(ticket.deviceId)}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
              
              <DatePicker
                label="排程日期"
                value={newSchedule.scheduledDate ? dayjs(newSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.scheduledDate,
                    helperText: formErrors.scheduledDate,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={newSchedule.scheduledTime ? dayjs(newSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={newSchedule.priority}
                onChange={(e) => setNewSchedule(prev => ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }))}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSchedule} variant="contained">
              建立排程
            </Button>
          </DialogActions>
        </Dialog>

        {/* 編輯排程對話框 */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>編輯工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <DatePicker
                label="排程日期"
                value={editingSchedule?.scheduledDate ? dayjs(editingSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={editingSchedule?.scheduledTime ? dayjs(editingSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={editingSchedule?.priority || 'MEDIUM'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }) : null)}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="狀態"
                value={editingSchedule?.status || 'OPEN'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' 
                }) : null)}
              >
                <MenuItem value="OPEN">待處理</MenuItem>
                <MenuItem value="IN_PROGRESS">進行中</MenuItem>
                <MenuItem value="COMPLETED">已完成</MenuItem>
                <MenuItem value="CANCELLED">已取消</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={async () => {
                if (editingSchedule) {
                  // 確保資料格式符合後端 API 驗證規則
                  const updateData: any = {};
                  
                  // 日期格式：YYYY-MM-DD
                  if (editingSchedule.scheduledDate) {
                    updateData.scheduledDate = editingSchedule.scheduledDate;
                  }
                  
                  // 時間格式：HH:mm
                  if (editingSchedule.scheduledTime) {
                    updateData.scheduledTime = editingSchedule.scheduledTime;
                  }
                  
                  // 優先級：HIGH, MEDIUM, LOW
                  if (editingSchedule.priority) {
                    updateData.priority = editingSchedule.priority;
                  }
                  
                  // 狀態：OPEN, IN_PROGRESS, COMPLETED, CANCELLED
                  if (editingSchedule.status) {
                    updateData.status = editingSchedule.status;
                  }
                  
                  console.log('準備更新排程資料:', updateData);
                  
                  try {
                    const response = await TargetService.updateSchedule(editingSchedule.id, updateData);
                    
                    if (response.success && response.data) {
                      setSchedules(prev => prev.map(schedule => 
                        schedule.id === editingSchedule.id ? response.data! : schedule
                      ));
                      setEditDialogOpen(false);
                      setEditingSchedule(null);
                    } else {
                      setError(response.message || '更新工單排程失敗');
                    }
                  } catch (error) {
                    console.error('更新工單排程錯誤:', error);
                    setError('更新工單排程失敗，請稍後再試');
                  }
                }
              }} 
              variant="contained"
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketScheduleComponent;

```

檢查是否有語法錯誤：


已移除顯示「目標：{selectedTarget.name}」的欄位。工單排程頁面現在只顯示「工單排程」標題，不再顯示目標名稱。變更已保存，沒有語法錯誤。

---

**User**

請把[建立工單]的功能從這個欄位中移除

---

**Cursor**


搜尋顯示「建立工單」按鈕的程式碼：


檢視 `AppMUI.tsx`，確認需要移除的程式碼：


移除「建立工單」功能：移除按鈕、相關狀態、處理函數和對話框。


```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { ProductionTarget } from './types/target';
import { Ticket } from './types/ticket';
import { TargetService } from './services/targetApi';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// 匯入自定義元件
import TargetList from './components/TargetList';
import TicketSchedule from './components/TicketSchedule';
import CreateTargetForm from './components/CreateTargetForm';
import TicketDetailMUI from './components/TicketDetailMUI';
import VersionDialog from './components/VersionDialog';

// 建立智慧醫療藍白主題
const medicalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // 醫療藍
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00acc1', // 青藍色
      light: '#26c6da',
      dark: '#0097a7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // 淺灰白
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c', // 深灰
      secondary: '#4a5568', // 中灰
    },
    success: {
      main: '#10b981', // 醫療綠
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b', // 醫療橙
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // 醫療紅
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6', // 資訊藍
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    body1: {
      fontSize: '1rem',
      color: '#4a5568',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#4a5568',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
          color: '#ffffff', // 確保AppBar中的文字為白色
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

// 主應用程式元件
const AppMUI: React.FC = () => {
  // 狀態管理
  const [targets, setTargets] = useState<ProductionTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<ProductionTarget | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [createTargetDialogOpen, setCreateTargetDialogOpen] = useState(false);
  const [createTicketDialogOpen, setCreateTicketDialogOpen] = useState(false);
  const [ticketDetailDialogOpen, setTicketDetailDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 載入目標列表
  const loadTargets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await TargetService.getTargets(1, 100); // 載入所有目標

      if (response.success && response.data) {
        setTargets(response.data.targets);
      } else {
        setError(response.message || '載入預生產目標失敗');
      }
    } catch (error: any) {
      console.error('載入預生產目標錯誤:', error);
      setError('載入預生產目標失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, []);

  // 元件載入時載入目標列表
  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  /**
   * 處理目標選擇
   * @param target 選中的預生產目標
   */
  const handleTargetSelect = (target: ProductionTarget) => {
    setSelectedTarget(target);
    setDrawerOpen(false); // 關閉側邊欄
  };

  /**
   * 處理工單選擇
   * @param ticket 選中的工單
   */
  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketDetailDialogOpen(true);
  };

  /**
   * 處理新增目標成功
   * @param target 新建立的目標
   */
  const handleCreateTargetSuccess = (target: ProductionTarget) => {
    setTargets(prev => [...prev, target]); // 將新目標添加到列表中
    setCreateTargetDialogOpen(false);
    setSelectedTarget(target); // 自動選中新建立的目標
  };

  /**
   * 處理目標新增（從 TargetList 組件）
   * @param newTarget 新建立的目標
   */
  const handleTargetCreate = (newTarget: ProductionTarget) => {
    setTargets(prev => [...prev, newTarget]); // 將新目標添加到列表中
    setSelectedTarget(newTarget); // 自動選中新建立的目標
  };

  /**
   * 處理建立工單成功
   * @param newTicket 新建立的工單
   */
  const handleCreateTicketSuccess = (newTicket: Ticket) => {
    setCreateTicketDialogOpen(false);
    // 可以在這裡添加成功提示或其他處理
  };

  /**
   * 處理目標更新
   * @param targetId 目標 ID
   * @param updatedTarget 更新後的目標
   */
  const handleTargetUpdate = (targetId: string, updatedTarget: ProductionTarget) => {
    // 更新目標列表中的對應目標
    setTargets((prev: ProductionTarget[]) => prev.map((target: ProductionTarget) => 
      target.id === targetId ? updatedTarget : target
    ));
    
    // 如果當前選中的目標被更新，更新選中狀態
    if (selectedTarget && selectedTarget.id === targetId) {
      setSelectedTarget(updatedTarget);
    }
  };

  /**
   * 處理目標刪除
   * @param targetId 目標 ID
   */
  const handleTargetDelete = (targetId: string) => {
    setTargets(prev => prev.filter(target => target.id !== targetId));
    
    // 如果當前選中的目標被刪除，清除選中狀態
    if (selectedTarget && selectedTarget.id === targetId) {
      setSelectedTarget(null);
    }
  };

  /**
   * 處理工單更新
   * @param updatedTicket 更新後的工單
   */
  const handleTicketUpdate = (updatedTicket: Ticket) => {
    setSelectedTicket(updatedTicket);
    // 這裡可以觸發排程列表的重新載入
  };

  /**
   * 處理對話框關閉
   */
  const handleCloseDialogs = () => {
    setCreateTargetDialogOpen(false);
    setTicketDetailDialogOpen(false);
    setSelectedTicket(null);
  };

  /**
   * 處理側邊欄切換
   */
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={medicalTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* 應用程式標題列 */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="開啟選單"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
              工單管理系統
            </Typography>
            <Typography variant="body2" sx={{ mr: 2, color: 'white' }}>
              預生產目標與工單排程管理
            </Typography>
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => setCreateTicketDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              建立工單
            </Button>
            <Button
              color="inherit"
              startIcon={<InfoIcon />}
              onClick={() => setVersionDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              版本資訊
            </Button>
          </Toolbar>
        </AppBar>

        {/* 側邊欄 */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: 300,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 300,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', height: '100%' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="儀表板" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="工單管理" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText primary="排程管理" />
                </ListItemButton>
              </ListItem>
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setCreateTargetDialogOpen(true)}
              >
                新增預生產目標
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* 主要內容區域 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Toolbar /> {/* 為 AppBar 留出空間 */}
          
          <Box sx={{ display: 'flex', flex: 1, height: 'calc(100vh - 64px)' }}>
            {/* 左側：預生產目標列表 */}
            <Box sx={{ width: { xs: '100%', md: '33.33%' }, height: '100%' }}>
              <Paper 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
                <TargetList
                  targets={targets}
                  onTargetSelect={handleTargetSelect}
                  selectedTargetId={selectedTarget?.id}
                  onTargetUpdate={handleTargetUpdate}
                  onTargetDelete={handleTargetDelete}
                  onTargetCreate={handleTargetCreate}
                />
              </Paper>
            </Box>

            {/* 右側：工單排程 */}
            <Box sx={{ width: { xs: '100%', md: '66.67%' }, height: '100%' }}>
              <Paper 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                }}
              >
                <TicketSchedule
                  selectedTarget={selectedTarget}
                  onTicketSelect={handleTicketSelect}
                  onTargetUpdate={handleTargetUpdate}
                />
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* 新增預生產目標對話框 */}
        <CreateTargetForm
          open={createTargetDialogOpen}
          onClose={() => setCreateTargetDialogOpen(false)}
          onSuccess={handleCreateTargetSuccess}
        />

        {/* 工單詳情對話框 */}
        <TicketDetailMUI
          open={ticketDetailDialogOpen}
          ticket={selectedTicket || undefined}
          onClose={() => setTicketDetailDialogOpen(false)}
          onUpdate={handleTicketUpdate}
        />

        {/* 建立工單對話框 */}
        <CreateTicketForm
          open={createTicketDialogOpen}
          onClose={() => setCreateTicketDialogOpen(false)}
          onSuccess={handleCreateTicketSuccess}
        />

        {/* 錯誤訊息 */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              position: 'fixed', 
              top: 16, 
              right: 16, 
              zIndex: 9999,
              minWidth: 300,
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* 載入中覆蓋層 */}
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}

        {/* 版本資訊對話框 */}
        <VersionDialog
          open={versionDialogOpen}
          onClose={() => setVersionDialogOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default AppMUI;

```

```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { ProductionTarget } from './types/target';
import { Ticket } from './types/ticket';
import { TargetService } from './services/targetApi';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// 匯入自定義元件
import TargetList from './components/TargetList';
import TicketSchedule from './components/TicketSchedule';
import CreateTargetForm from './components/CreateTargetForm';
import TicketDetailMUI from './components/TicketDetailMUI';
import VersionDialog from './components/VersionDialog';

// 建立智慧醫療藍白主題
const medicalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // 醫療藍
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00acc1', // 青藍色
      light: '#26c6da',
      dark: '#0097a7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // 淺灰白
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c', // 深灰
      secondary: '#4a5568', // 中灰
    },
    success: {
      main: '#10b981', // 醫療綠
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b', // 醫療橙
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // 醫療紅
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6', // 資訊藍
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    body1: {
      fontSize: '1rem',
      color: '#4a5568',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#4a5568',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
          color: '#ffffff', // 確保AppBar中的文字為白色
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

// 主應用程式元件
const AppMUI: React.FC = () => {
  // 狀態管理
  const [targets, setTargets] = useState<ProductionTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<ProductionTarget | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [createTargetDialogOpen, setCreateTargetDialogOpen] = useState(false);
  const [ticketDetailDialogOpen, setTicketDetailDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 載入目標列表
  const loadTargets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await TargetService.getTargets(1, 100); // 載入所有目標

      if (response.success && response.data) {
        setTargets(response.data.targets);
      } else {
        setError(response.message || '載入預生產目標失敗');
      }
    } catch (error: any) {
      console.error('載入預生產目標錯誤:', error);
      setError('載入預生產目標失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, []);

  // 元件載入時載入目標列表
  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  /**
   * 處理目標選擇
   * @param target 選中的預生產目標
   */
  const handleTargetSelect = (target: ProductionTarget) => {
    setSelectedTarget(target);
    setDrawerOpen(false); // 關閉側邊欄
  };

  /**
   * 處理工單選擇
   * @param ticket 選中的工單
   */
  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketDetailDialogOpen(true);
  };

  /**
   * 處理新增目標成功
   * @param target 新建立的目標
   */
  const handleCreateTargetSuccess = (target: ProductionTarget) => {
    setTargets(prev => [...prev, target]); // 將新目標添加到列表中
    setCreateTargetDialogOpen(false);
    setSelectedTarget(target); // 自動選中新建立的目標
  };

  /**
   * 處理目標新增（從 TargetList 組件）
   * @param newTarget 新建立的目標
   */
  const handleTargetCreate = (newTarget: ProductionTarget) => {
    setTargets(prev => [...prev, newTarget]); // 將新目標添加到列表中
    setSelectedTarget(newTarget); // 自動選中新建立的目標
  };

  /**
   * 處理建立工單成功
   * @param newTicket 新建立的工單
   */
  const handleCreateTicketSuccess = (newTicket: Ticket) => {
    setCreateTicketDialogOpen(false);
    // 可以在這裡添加成功提示或其他處理
  };

  /**
   * 處理目標更新
   * @param targetId 目標 ID
   * @param updatedTarget 更新後的目標
   */
  const handleTargetUpdate = (targetId: string, updatedTarget: ProductionTarget) => {
    // 更新目標列表中的對應目標
    setTargets((prev: ProductionTarget[]) => prev.map((target: ProductionTarget) => 
      target.id === targetId ? updatedTarget : target
    ));
    
    // 如果當前選中的目標被更新，更新選中狀態
    if (selectedTarget && selectedTarget.id === targetId) {
      setSelectedTarget(updatedTarget);
    }
  };

  /**
   * 處理目標刪除
   * @param targetId 目標 ID
   */
  const handleTargetDelete = (targetId: string) => {
    setTargets(prev => prev.filter(target => target.id !== targetId));
    
    // 如果當前選中的目標被刪除，清除選中狀態
    if (selectedTarget && selectedTarget.id === targetId) {
      setSelectedTarget(null);
    }
  };

  /**
   * 處理工單更新
   * @param updatedTicket 更新後的工單
   */
  const handleTicketUpdate = (updatedTicket: Ticket) => {
    setSelectedTicket(updatedTicket);
    // 這裡可以觸發排程列表的重新載入
  };

  /**
   * 處理對話框關閉
   */
  const handleCloseDialogs = () => {
    setCreateTargetDialogOpen(false);
    setTicketDetailDialogOpen(false);
    setSelectedTicket(null);
  };

  /**
   * 處理側邊欄切換
   */
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={medicalTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* 應用程式標題列 */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="開啟選單"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
              工單管理系統
            </Typography>
            <Typography variant="body2" sx={{ mr: 2, color: 'white' }}>
              預生產目標與工單排程管理
            </Typography>
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => setCreateTicketDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              建立工單
            </Button>
            <Button
              color="inherit"
              startIcon={<InfoIcon />}
              onClick={() => setVersionDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              版本資訊
            </Button>
          </Toolbar>
        </AppBar>

        {/* 側邊欄 */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: 300,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 300,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', height: '100%' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="儀表板" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="工單管理" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText primary="排程管理" />
                </ListItemButton>
              </ListItem>
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setCreateTargetDialogOpen(true)}
              >
                新增預生產目標
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* 主要內容區域 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Toolbar /> {/* 為 AppBar 留出空間 */}
          
          <Box sx={{ display: 'flex', flex: 1, height: 'calc(100vh - 64px)' }}>
            {/* 左側：預生產目標列表 */}
            <Box sx={{ width: { xs: '100%', md: '33.33%' }, height: '100%' }}>
              <Paper 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
                <TargetList
                  targets={targets}
                  onTargetSelect={handleTargetSelect}
                  selectedTargetId={selectedTarget?.id}
                  onTargetUpdate={handleTargetUpdate}
                  onTargetDelete={handleTargetDelete}
                  onTargetCreate={handleTargetCreate}
                />
              </Paper>
            </Box>

            {/* 右側：工單排程 */}
            <Box sx={{ width: { xs: '100%', md: '66.67%' }, height: '100%' }}>
              <Paper 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                }}
              >
                <TicketSchedule
                  selectedTarget={selectedTarget}
                  onTicketSelect={handleTicketSelect}
                  onTargetUpdate={handleTargetUpdate}
                />
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* 新增預生產目標對話框 */}
        <CreateTargetForm
          open={createTargetDialogOpen}
          onClose={() => setCreateTargetDialogOpen(false)}
          onSuccess={handleCreateTargetSuccess}
        />

        {/* 工單詳情對話框 */}
        <TicketDetailMUI
          open={ticketDetailDialogOpen}
          ticket={selectedTicket || undefined}
          onClose={() => setTicketDetailDialogOpen(false)}
          onUpdate={handleTicketUpdate}
        />

        {/* 建立工單對話框 */}
        <CreateTicketForm
          open={createTicketDialogOpen}
          onClose={() => setCreateTicketDialogOpen(false)}
          onSuccess={handleCreateTicketSuccess}
        />

        {/* 錯誤訊息 */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              position: 'fixed', 
              top: 16, 
              right: 16, 
              zIndex: 9999,
              minWidth: 300,
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* 載入中覆蓋層 */}
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}

        {/* 版本資訊對話框 */}
        <VersionDialog
          open={versionDialogOpen}
          onClose={() => setVersionDialogOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default AppMUI;

```

```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { ProductionTarget } from './types/target';
import { Ticket } from './types/ticket';
import { TargetService } from './services/targetApi';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// 匯入自定義元件
import TargetList from './components/TargetList';
import TicketSchedule from './components/TicketSchedule';
import CreateTargetForm from './components/CreateTargetForm';
import TicketDetailMUI from './components/TicketDetailMUI';
import VersionDialog from './components/VersionDialog';

// 建立智慧醫療藍白主題
const medicalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // 醫療藍
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00acc1', // 青藍色
      light: '#26c6da',
      dark: '#0097a7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // 淺灰白
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c', // 深灰
      secondary: '#4a5568', // 中灰
    },
    success: {
      main: '#10b981', // 醫療綠
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b', // 醫療橙
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // 醫療紅
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6', // 資訊藍
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    body1: {
      fontSize: '1rem',
      color: '#4a5568',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#4a5568',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
          color: '#ffffff', // 確保AppBar中的文字為白色
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

// 主應用程式元件
const AppMUI: React.FC = () => {
  // 狀態管理
  const [targets, setTargets] = useState<ProductionTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<ProductionTarget | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [createTargetDialogOpen, setCreateTargetDialogOpen] = useState(false);
  const [ticketDetailDialogOpen, setTicketDetailDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 載入目標列表
  const loadTargets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await TargetService.getTargets(1, 100); // 載入所有目標

      if (response.success && response.data) {
        setTargets(response.data.targets);
      } else {
        setError(response.message || '載入預生產目標失敗');
      }
    } catch (error: any) {
      console.error('載入預生產目標錯誤:', error);
      setError('載入預生產目標失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, []);

  // 元件載入時載入目標列表
  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  /**
   * 處理目標選擇
   * @param target 選中的預生產目標
   */
  const handleTargetSelect = (target: ProductionTarget) => {
    setSelectedTarget(target);
    setDrawerOpen(false); // 關閉側邊欄
  };

  /**
   * 處理工單選擇
   * @param ticket 選中的工單
   */
  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketDetailDialogOpen(true);
  };

  /**
   * 處理新增目標成功
   * @param target 新建立的目標
   */
  const handleCreateTargetSuccess = (target: ProductionTarget) => {
    setTargets(prev => [...prev, target]); // 將新目標添加到列表中
    setCreateTargetDialogOpen(false);
    setSelectedTarget(target); // 自動選中新建立的目標
  };

  /**
   * 處理目標新增（從 TargetList 組件）
   * @param newTarget 新建立的目標
   */
  const handleTargetCreate = (newTarget: ProductionTarget) => {
    setTargets(prev => [...prev, newTarget]); // 將新目標添加到列表中
    setSelectedTarget(newTarget); // 自動選中新建立的目標
  };

  /**
   * 處理目標更新
   * @param targetId 目標 ID
   * @param updatedTarget 更新後的目標
   */
  const handleTargetUpdate = (targetId: string, updatedTarget: ProductionTarget) => {
    // 更新目標列表中的對應目標
    setTargets((prev: ProductionTarget[]) => prev.map((target: ProductionTarget) => 
      target.id === targetId ? updatedTarget : target
    ));
    
    // 如果當前選中的目標被更新，更新選中狀態
    if (selectedTarget && selectedTarget.id === targetId) {
      setSelectedTarget(updatedTarget);
    }
  };

  /**
   * 處理目標刪除
   * @param targetId 目標 ID
   */
  const handleTargetDelete = (targetId: string) => {
    setTargets(prev => prev.filter(target => target.id !== targetId));
    
    // 如果當前選中的目標被刪除，清除選中狀態
    if (selectedTarget && selectedTarget.id === targetId) {
      setSelectedTarget(null);
    }
  };

  /**
   * 處理工單更新
   * @param updatedTicket 更新後的工單
   */
  const handleTicketUpdate = (updatedTicket: Ticket) => {
    setSelectedTicket(updatedTicket);
    // 這裡可以觸發排程列表的重新載入
  };

  /**
   * 處理對話框關閉
   */
  const handleCloseDialogs = () => {
    setCreateTargetDialogOpen(false);
    setTicketDetailDialogOpen(false);
    setSelectedTicket(null);
  };

  /**
   * 處理側邊欄切換
   */
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={medicalTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* 應用程式標題列 */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="開啟選單"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
              工單管理系統
            </Typography>
            <Typography variant="body2" sx={{ mr: 2, color: 'white' }}>
              預生產目標與工單排程管理
            </Typography>
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => setCreateTicketDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              建立工單
            </Button>
            <Button
              color="inherit"
              startIcon={<InfoIcon />}
              onClick={() => setVersionDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              版本資訊
            </Button>
          </Toolbar>
        </AppBar>

        {/* 側邊欄 */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: 300,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 300,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', height: '100%' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="儀表板" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="工單管理" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText primary="排程管理" />
                </ListItemButton>
              </ListItem>
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setCreateTargetDialogOpen(true)}
              >
                新增預生產目標
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* 主要內容區域 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Toolbar /> {/* 為 AppBar 留出空間 */}
          
          <Box sx={{ display: 'flex', flex: 1, height: 'calc(100vh - 64px)' }}>
            {/* 左側：預生產目標列表 */}
            <Box sx={{ width: { xs: '100%', md: '33.33%' }, height: '100%' }}>
              <Paper 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
                <TargetList
                  targets={targets}
                  onTargetSelect={handleTargetSelect}
                  selectedTargetId={selectedTarget?.id}
                  onTargetUpdate={handleTargetUpdate}
                  onTargetDelete={handleTargetDelete}
                  onTargetCreate={handleTargetCreate}
                />
              </Paper>
            </Box>

            {/* 右側：工單排程 */}
            <Box sx={{ width: { xs: '100%', md: '66.67%' }, height: '100%' }}>
              <Paper 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                }}
              >
                <TicketSchedule
                  selectedTarget={selectedTarget}
                  onTicketSelect={handleTicketSelect}
                  onTargetUpdate={handleTargetUpdate}
                />
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* 新增預生產目標對話框 */}
        <CreateTargetForm
          open={createTargetDialogOpen}
          onClose={() => setCreateTargetDialogOpen(false)}
          onSuccess={handleCreateTargetSuccess}
        />

        {/* 工單詳情對話框 */}
        <TicketDetailMUI
          open={ticketDetailDialogOpen}
          ticket={selectedTicket || undefined}
          onClose={() => setTicketDetailDialogOpen(false)}
          onUpdate={handleTicketUpdate}
        />

        {/* 建立工單對話框 */}
        <CreateTicketForm
          open={createTicketDialogOpen}
          onClose={() => setCreateTicketDialogOpen(false)}
          onSuccess={handleCreateTicketSuccess}
        />

        {/* 錯誤訊息 */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              position: 'fixed', 
              top: 16, 
              right: 16, 
              zIndex: 9999,
              minWidth: 300,
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* 載入中覆蓋層 */}
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}

        {/* 版本資訊對話框 */}
        <VersionDialog
          open={versionDialogOpen}
          onClose={() => setVersionDialogOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default AppMUI;

```

```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { ProductionTarget } from './types/target';
import { Ticket } from './types/ticket';
import { TargetService } from './services/targetApi';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// 匯入自定義元件
import TargetList from './components/TargetList';
import TicketSchedule from './components/TicketSchedule';
import CreateTargetForm from './components/CreateTargetForm';
import TicketDetailMUI from './components/TicketDetailMUI';
import VersionDialog from './components/VersionDialog';

// 建立智慧醫療藍白主題
const medicalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // 醫療藍
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00acc1', // 青藍色
      light: '#26c6da',
      dark: '#0097a7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // 淺灰白
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c', // 深灰
      secondary: '#4a5568', // 中灰
    },
    success: {
      main: '#10b981', // 醫療綠
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b', // 醫療橙
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // 醫療紅
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6', // 資訊藍
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    body1: {
      fontSize: '1rem',
      color: '#4a5568',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#4a5568',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
          color: '#ffffff', // 確保AppBar中的文字為白色
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

// 主應用程式元件
const AppMUI: React.FC = () => {
  // 狀態管理
  const [targets, setTargets] = useState<ProductionTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<ProductionTarget | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [createTargetDialogOpen, setCreateTargetDialogOpen] = useState(false);
  const [ticketDetailDialogOpen, setTicketDetailDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 載入目標列表
  const loadTargets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await TargetService.getTargets(1, 100); // 載入所有目標

      if (response.success && response.data) {
        setTargets(response.data.targets);
      } else {
        setError(response.message || '載入預生產目標失敗');
      }
    } catch (error: any) {
      console.error('載入預生產目標錯誤:', error);
      setError('載入預生產目標失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, []);

  // 元件載入時載入目標列表
  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  /**
   * 處理目標選擇
   * @param target 選中的預生產目標
   */
  const handleTargetSelect = (target: ProductionTarget) => {
    setSelectedTarget(target);
    setDrawerOpen(false); // 關閉側邊欄
  };

  /**
   * 處理工單選擇
   * @param ticket 選中的工單
   */
  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketDetailDialogOpen(true);
  };

  /**
   * 處理新增目標成功
   * @param target 新建立的目標
   */
  const handleCreateTargetSuccess = (target: ProductionTarget) => {
    setTargets(prev => [...prev, target]); // 將新目標添加到列表中
    setCreateTargetDialogOpen(false);
    setSelectedTarget(target); // 自動選中新建立的目標
  };

  /**
   * 處理目標新增（從 TargetList 組件）
   * @param newTarget 新建立的目標
   */
  const handleTargetCreate = (newTarget: ProductionTarget) => {
    setTargets(prev => [...prev, newTarget]); // 將新目標添加到列表中
    setSelectedTarget(newTarget); // 自動選中新建立的目標
  };

  /**
   * 處理目標更新
   * @param targetId 目標 ID
   * @param updatedTarget 更新後的目標
   */
  const handleTargetUpdate = (targetId: string, updatedTarget: ProductionTarget) => {
    // 更新目標列表中的對應目標
    setTargets((prev: ProductionTarget[]) => prev.map((target: ProductionTarget) => 
      target.id === targetId ? updatedTarget : target
    ));
    
    // 如果當前選中的目標被更新，更新選中狀態
    if (selectedTarget && selectedTarget.id === targetId) {
      setSelectedTarget(updatedTarget);
    }
  };

  /**
   * 處理目標刪除
   * @param targetId 目標 ID
   */
  const handleTargetDelete = (targetId: string) => {
    setTargets(prev => prev.filter(target => target.id !== targetId));
    
    // 如果當前選中的目標被刪除，清除選中狀態
    if (selectedTarget && selectedTarget.id === targetId) {
      setSelectedTarget(null);
    }
  };

  /**
   * 處理工單更新
   * @param updatedTicket 更新後的工單
   */
  const handleTicketUpdate = (updatedTicket: Ticket) => {
    setSelectedTicket(updatedTicket);
    // 這裡可以觸發排程列表的重新載入
  };

  /**
   * 處理對話框關閉
   */
  const handleCloseDialogs = () => {
    setCreateTargetDialogOpen(false);
    setTicketDetailDialogOpen(false);
    setSelectedTicket(null);
  };

  /**
   * 處理側邊欄切換
   */
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={medicalTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* 應用程式標題列 */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="開啟選單"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
              工單管理系統
            </Typography>
            <Typography variant="body2" sx={{ mr: 2, color: 'white' }}>
              預生產目標與工單排程管理
            </Typography>
            <Button
              color="inherit"
              startIcon={<InfoIcon />}
              onClick={() => setVersionDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              版本資訊
            </Button>
          </Toolbar>
        </AppBar>

        {/* 側邊欄 */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: 300,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 300,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', height: '100%' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="儀表板" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="工單管理" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText primary="排程管理" />
                </ListItemButton>
              </ListItem>
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setCreateTargetDialogOpen(true)}
              >
                新增預生產目標
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* 主要內容區域 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Toolbar /> {/* 為 AppBar 留出空間 */}
          
          <Box sx={{ display: 'flex', flex: 1, height: 'calc(100vh - 64px)' }}>
            {/* 左側：預生產目標列表 */}
            <Box sx={{ width: { xs: '100%', md: '33.33%' }, height: '100%' }}>
              <Paper 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
                <TargetList
                  targets={targets}
                  onTargetSelect={handleTargetSelect}
                  selectedTargetId={selectedTarget?.id}
                  onTargetUpdate={handleTargetUpdate}
                  onTargetDelete={handleTargetDelete}
                  onTargetCreate={handleTargetCreate}
                />
              </Paper>
            </Box>

            {/* 右側：工單排程 */}
            <Box sx={{ width: { xs: '100%', md: '66.67%' }, height: '100%' }}>
              <Paper 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                }}
              >
                <TicketSchedule
                  selectedTarget={selectedTarget}
                  onTicketSelect={handleTicketSelect}
                  onTargetUpdate={handleTargetUpdate}
                />
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* 新增預生產目標對話框 */}
        <CreateTargetForm
          open={createTargetDialogOpen}
          onClose={() => setCreateTargetDialogOpen(false)}
          onSuccess={handleCreateTargetSuccess}
        />

        {/* 工單詳情對話框 */}
        <TicketDetailMUI
          open={ticketDetailDialogOpen}
          ticket={selectedTicket || undefined}
          onClose={() => setTicketDetailDialogOpen(false)}
          onUpdate={handleTicketUpdate}
        />

        {/* 建立工單對話框 */}
        <CreateTicketForm
          open={createTicketDialogOpen}
          onClose={() => setCreateTicketDialogOpen(false)}
          onSuccess={handleCreateTicketSuccess}
        />

        {/* 錯誤訊息 */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              position: 'fixed', 
              top: 16, 
              right: 16, 
              zIndex: 9999,
              minWidth: 300,
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* 載入中覆蓋層 */}
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}

        {/* 版本資訊對話框 */}
        <VersionDialog
          open={versionDialogOpen}
          onClose={() => setVersionDialogOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default AppMUI;

```

```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { ProductionTarget } from './types/target';
import { Ticket } from './types/ticket';
import { TargetService } from './services/targetApi';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// 匯入自定義元件
import TargetList from './components/TargetList';
import TicketSchedule from './components/TicketSchedule';
import CreateTargetForm from './components/CreateTargetForm';
import TicketDetailMUI from './components/TicketDetailMUI';
import VersionDialog from './components/VersionDialog';

// 建立智慧醫療藍白主題
const medicalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // 醫療藍
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00acc1', // 青藍色
      light: '#26c6da',
      dark: '#0097a7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // 淺灰白
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c', // 深灰
      secondary: '#4a5568', // 中灰
    },
    success: {
      main: '#10b981', // 醫療綠
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b', // 醫療橙
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // 醫療紅
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6', // 資訊藍
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    body1: {
      fontSize: '1rem',
      color: '#4a5568',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#4a5568',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
          color: '#ffffff', // 確保AppBar中的文字為白色
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

// 主應用程式元件
const AppMUI: React.FC = () => {
  // 狀態管理
  const [targets, setTargets] = useState<ProductionTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<ProductionTarget | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [createTargetDialogOpen, setCreateTargetDialogOpen] = useState(false);
  const [ticketDetailDialogOpen, setTicketDetailDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 載入目標列表
  const loadTargets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await TargetService.getTargets(1, 100); // 載入所有目標

      if (response.success && response.data) {
        setTargets(response.data.targets);
      } else {
        setError(response.message || '載入預生產目標失敗');
      }
    } catch (error: any) {
      console.error('載入預生產目標錯誤:', error);
      setError('載入預生產目標失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, []);

  // 元件載入時載入目標列表
  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  /**
   * 處理目標選擇
   * @param target 選中的預生產目標
   */
  const handleTargetSelect = (target: ProductionTarget) => {
    setSelectedTarget(target);
    setDrawerOpen(false); // 關閉側邊欄
  };

  /**
   * 處理工單選擇
   * @param ticket 選中的工單
   */
  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketDetailDialogOpen(true);
  };

  /**
   * 處理新增目標成功
   * @param target 新建立的目標
   */
  const handleCreateTargetSuccess = (target: ProductionTarget) => {
    setTargets(prev => [...prev, target]); // 將新目標添加到列表中
    setCreateTargetDialogOpen(false);
    setSelectedTarget(target); // 自動選中新建立的目標
  };

  /**
   * 處理目標新增（從 TargetList 組件）
   * @param newTarget 新建立的目標
   */
  const handleTargetCreate = (newTarget: ProductionTarget) => {
    setTargets(prev => [...prev, newTarget]); // 將新目標添加到列表中
    setSelectedTarget(newTarget); // 自動選中新建立的目標
  };

  /**
   * 處理目標更新
   * @param targetId 目標 ID
   * @param updatedTarget 更新後的目標
   */
  const handleTargetUpdate = (targetId: string, updatedTarget: ProductionTarget) => {
    // 更新目標列表中的對應目標
    setTargets((prev: ProductionTarget[]) => prev.map((target: ProductionTarget) => 
      target.id === targetId ? updatedTarget : target
    ));
    
    // 如果當前選中的目標被更新，更新選中狀態
    if (selectedTarget && selectedTarget.id === targetId) {
      setSelectedTarget(updatedTarget);
    }
  };

  /**
   * 處理目標刪除
   * @param targetId 目標 ID
   */
  const handleTargetDelete = (targetId: string) => {
    setTargets(prev => prev.filter(target => target.id !== targetId));
    
    // 如果當前選中的目標被刪除，清除選中狀態
    if (selectedTarget && selectedTarget.id === targetId) {
      setSelectedTarget(null);
    }
  };

  /**
   * 處理工單更新
   * @param updatedTicket 更新後的工單
   */
  const handleTicketUpdate = (updatedTicket: Ticket) => {
    setSelectedTicket(updatedTicket);
    // 這裡可以觸發排程列表的重新載入
  };

  /**
   * 處理對話框關閉
   */
  const handleCloseDialogs = () => {
    setCreateTargetDialogOpen(false);
    setTicketDetailDialogOpen(false);
    setSelectedTicket(null);
  };

  /**
   * 處理側邊欄切換
   */
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={medicalTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* 應用程式標題列 */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="開啟選單"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
              工單管理系統
            </Typography>
            <Typography variant="body2" sx={{ mr: 2, color: 'white' }}>
              預生產目標與工單排程管理
            </Typography>
            <Button
              color="inherit"
              startIcon={<InfoIcon />}
              onClick={() => setVersionDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              版本資訊
            </Button>
          </Toolbar>
        </AppBar>

        {/* 側邊欄 */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: 300,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 300,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', height: '100%' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="儀表板" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="工單管理" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText primary="排程管理" />
                </ListItemButton>
              </ListItem>
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setCreateTargetDialogOpen(true)}
              >
                新增預生產目標
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* 主要內容區域 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Toolbar /> {/* 為 AppBar 留出空間 */}
          
          <Box sx={{ display: 'flex', flex: 1, height: 'calc(100vh - 64px)' }}>
            {/* 左側：預生產目標列表 */}
            <Box sx={{ width: { xs: '100%', md: '33.33%' }, height: '100%' }}>
              <Paper 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
                <TargetList
                  targets={targets}
                  onTargetSelect={handleTargetSelect}
                  selectedTargetId={selectedTarget?.id}
                  onTargetUpdate={handleTargetUpdate}
                  onTargetDelete={handleTargetDelete}
                  onTargetCreate={handleTargetCreate}
                />
              </Paper>
            </Box>

            {/* 右側：工單排程 */}
            <Box sx={{ width: { xs: '100%', md: '66.67%' }, height: '100%' }}>
              <Paper 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                }}
              >
                <TicketSchedule
                  selectedTarget={selectedTarget}
                  onTicketSelect={handleTicketSelect}
                  onTargetUpdate={handleTargetUpdate}
                />
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* 新增預生產目標對話框 */}
        <CreateTargetForm
          open={createTargetDialogOpen}
          onClose={() => setCreateTargetDialogOpen(false)}
          onSuccess={handleCreateTargetSuccess}
        />

        {/* 工單詳情對話框 */}
        <TicketDetailMUI
          open={ticketDetailDialogOpen}
          ticket={selectedTicket || undefined}
          onClose={() => setTicketDetailDialogOpen(false)}
          onUpdate={handleTicketUpdate}
        />

        {/* 錯誤訊息 */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              position: 'fixed', 
              top: 16, 
              right: 16, 
              zIndex: 9999,
              minWidth: 300,
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* 載入中覆蓋層 */}
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}

        {/* 版本資訊對話框 */}
        <VersionDialog
          open={versionDialogOpen}
          onClose={() => setVersionDialogOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default AppMUI;

```

檢查是否有語法錯誤：


已移除「建立工單」功能，變更如下：

1. 移除標題欄中的「建立工單」按鈕（第 342-349 行）
2. 移除 `CreateTicketForm` 組件的匯入
3. 移除 `createTicketDialogOpen` 狀態變數
4. 移除 `handleCreateTicketSuccess` 處理函數
5. 移除建立工單對話框組件

現在標題欄只會顯示：
- "預生產目標與工單排程管理"
- "版本資訊" 按鈕

變更已完成，沒有語法錯誤。頁面會自動重新載入並反映這些變更。

---

**User**

請新增[今日排程]，若今日為11/2，當user點選[今日排程]，系統會把每一個生產目標中11/2的排成整理在一起

---

**Cursor**


查看 `TicketSchedule.tsx` 與 API，準備實作「今日排程」功能：


實作「今日排程」功能：
1. 新增後端 API 端點，支援依日期篩選排程
2. 在前端新增「今日排程」按鈕
3. 實作載入與顯示邏輯，依目標分組

先更新後端 API：


實作「今日排程」：先更新後端 API 以支援日期篩選，再更新前端組件。


```javascript
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

```

新增前端 API 方法以取得今日排程：


```typescript
import axios from 'axios';
import { 
  ProductionTarget, 
  CreateTargetRequest, 
  UpdateTargetRequest, 
  TargetListResponse,
  TicketSchedule,
  TicketScheduleWithRelations,
  CreateScheduleRequest,
  UpdateScheduleRequest
} from '../types/target';
import { ApiResponse } from '../types/ticket';

// 建立 axios 實例，設定基礎 URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 預生產目標 API 服務類別
export class TargetService {
  /**
   * 取得所有預生產目標列表
   * @param page 頁碼
   * @param limit 每頁數量
   * @param status 狀態篩選
   */
  static async getTargets(
    page: number = 1, 
    limit: number = 10, 
    status?: string
  ): Promise<ApiResponse<TargetListResponse>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });

      const response = await api.get(`/targets?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('取得預生產目標列表失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '取得預生產目標列表失敗',
      };
    }
  }

  /**
   * 取得單一預生產目標詳情
   * @param targetId 目標 ID
   */
  static async getTarget(targetId: string): Promise<ApiResponse<ProductionTarget>> {
    try {
      const response = await api.get(`/targets/${targetId}`);
      return response.data;
    } catch (error: any) {
      console.error('取得預生產目標詳情失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '取得預生產目標詳情失敗',
      };
    }
  }

  /**
   * 建立新的預生產目標
   * @param data 目標資料
   */
  static async createTarget(data: CreateTargetRequest): Promise<ApiResponse<ProductionTarget>> {
    try {
      const response = await api.post('/targets', data);
      return response.data;
    } catch (error: any) {
      console.error('建立預生產目標失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '建立預生產目標失敗',
      };
    }
  }

  /**
   * 更新預生產目標
   * @param targetId 目標 ID
   * @param data 更新資料
   */
  static async updateTarget(
    targetId: string, 
    data: UpdateTargetRequest
  ): Promise<ApiResponse<ProductionTarget>> {
    try {
      const response = await api.put(`/targets/${targetId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('更新預生產目標失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '更新預生產目標失敗',
      };
    }
  }

  /**
   * 刪除預生產目標
   * @param targetId 目標 ID
   */
  static async deleteTarget(targetId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/targets/${targetId}`);
      return response.data;
    } catch (error: any) {
      console.error('刪除預生產目標失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '刪除預生產目標失敗',
      };
    }
  }

  /**
   * 取得指定目標的工單排程
   * @param targetId 目標 ID
   */
  static async getTargetSchedules(targetId: string): Promise<ApiResponse<TicketSchedule[]>> {
    try {
      const response = await api.get(`/schedules/target/${targetId}`);
      return response.data;
    } catch (error: any) {
      console.error('取得工單排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '取得工單排程失敗',
      };
    }
  }

  /**
   * 取得指定日期的所有排程
   * @param date 日期 (格式: YYYY-MM-DD)
   */
  static async getSchedulesByDate(date: string): Promise<ApiResponse<TicketScheduleWithRelations[]>> {
    try {
      const response = await api.get(`/schedules?date=${date}&limit=1000`);
      if (response.data.success && response.data.data?.schedules) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.schedules,
        };
      }
      return {
        success: false,
        message: response.data.message || '取得今日排程失敗',
      };
    } catch (error: any) {
      console.error('取得今日排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '取得今日排程失敗',
      };
    }
  }

  /**
   * 建立工單排程
   * @param data 排程資料
   */
  static async createSchedule(data: CreateScheduleRequest): Promise<ApiResponse<TicketScheduleWithRelations>> {
    try {
      const response = await api.post('/schedules', data);
      return response.data;
    } catch (error: any) {
      console.error('建立工單排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '建立工單排程失敗',
      };
    }
  }

  /**
   * 更新工單排程
   * @param scheduleId 排程 ID
   * @param data 更新資料
   */
  static async updateSchedule(
    scheduleId: string, 
    data: UpdateScheduleRequest
  ): Promise<ApiResponse<TicketSchedule>> {
    try {
      const response = await api.put(`/schedules/${scheduleId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('更新工單排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '更新工單排程失敗',
      };
    }
  }

  /**
   * 刪除工單排程
   * @param scheduleId 排程 ID
   */
  static async deleteSchedule(scheduleId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/schedules/${scheduleId}`);
      return response.data;
    } catch (error: any) {
      console.error('刪除工單排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '刪除工單排程失敗',
      };
    }
  }
}

```

更新 TicketSchedule 組件，新增「今日排程」功能：


更新 TicketSchedule 組件，新增「今日排程」功能：


```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  PriorityHigh as HighPriorityIcon,
  Circle as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { ProductionTarget, TicketSchedule, TicketScheduleWithRelations, CreateScheduleRequest, UpdateScheduleRequest, TargetStatus } from '../types/target';
import { Ticket } from '../types/ticket';
import { TargetService } from '../services/targetApi';
import { TicketService } from '../services/api';
import { formatTicketDisplay, getStationDisplay, getTicketName } from '../utils/stationMapping';

// 工單排程元件屬性介面
interface TicketScheduleProps {
  selectedTarget: ProductionTarget | null; // 選中的預生產目標
  onTicketSelect: (ticket: Ticket) => void; // 工單選擇回調函數
  onTargetUpdate?: (targetId: string, updatedTarget: ProductionTarget) => void; // 目標更新回調函數
}

// 工單排程元件
const TicketScheduleComponent: React.FC<TicketScheduleProps> = ({ 
  selectedTarget, 
  onTicketSelect,
  onTargetUpdate
}) => {
  // 狀態管理
  const [schedules, setSchedules] = useState<TicketSchedule[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTodaySchedules, setShowTodaySchedules] = useState(false); // 是否顯示今日排程
  const [todaySchedules, setTodaySchedules] = useState<TicketScheduleWithRelations[]>([]); // 今日排程資料
  
  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TicketSchedule | null>(null);

  // 新增排程表單狀態
  const [newSchedule, setNewSchedule] = useState<CreateScheduleRequest>({
    ticketId: '',
    targetId: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'MEDIUM',
  });

  // 表單驗證錯誤狀態
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * 載入工單排程資料
   */
  const loadSchedules = useCallback(async () => {
    if (!selectedTarget) {
      setSchedules([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 載入指定目標的工單排程
      const scheduleResponse = await TargetService.getTargetSchedules(selectedTarget.id);
      
      if (scheduleResponse.success && scheduleResponse.data) {
        setSchedules(scheduleResponse.data);
      } else {
        setError(scheduleResponse.message || '載入工單排程失敗');
      }

      // 載入所有工單（用於新增排程時選擇）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入工單排程錯誤:', error);
      setError('載入工單排程失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [selectedTarget]);

  /**
   * 處理新增排程
   */
  const handleCreateSchedule = async () => {
    // 表單驗證
    const errors: { [key: string]: string } = {};
    if (!newSchedule.ticketId) {
      errors.ticketId = '請選擇工單';
    }
    if (!newSchedule.scheduledDate) {
      errors.scheduledDate = '請選擇排程日期';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 確保資料格式符合後端 API 驗證規則
      const scheduleData: any = {
        ticketId: newSchedule.ticketId,
        targetId: selectedTarget!.id,
        scheduledDate: newSchedule.scheduledDate,
      };
      
      // 可選欄位
      if (newSchedule.scheduledTime) {
        scheduleData.scheduledTime = newSchedule.scheduledTime;
      }
      if (newSchedule.priority) {
        scheduleData.priority = newSchedule.priority;
      }
      
      // 調試：顯示要發送的資料
      console.log('準備建立排程資料:', scheduleData);
      console.log('可用工單列表:', tickets);
      console.log('原始 newSchedule:', newSchedule);
      
      const response = await TargetService.createSchedule(scheduleData);

      if (response.success && response.data) {
        setSchedules(prev => [...prev, response.data!]);
        
        // 如果目標狀態被自動更新為「進行中」，通知父組件
        if (response.data.target && response.data.target.status === TargetStatus.IN_PROGRESS && onTargetUpdate) {
          // 將 API 回應的 target 轉換為 ProductionTarget 類型
          const updatedTarget: ProductionTarget = {
            id: response.data.target.id,
            name: response.data.target.name,
            description: response.data.target.description,
            expectedCompletionDate: response.data.target.expectedCompletionDate,
            status: response.data.target.status,
            createdAt: response.data.target.createdAt,
            updatedAt: response.data.target.updatedAt,
          };
          onTargetUpdate(response.data.targetId, updatedTarget);
        }
        
        setCreateDialogOpen(false);
        setNewSchedule({
          ticketId: '',
          targetId: '',
          scheduledDate: '',
          scheduledTime: '',
          priority: 'MEDIUM',
        });
        setFormErrors({});
      } else {
        setError(response.message || '建立工單排程失敗');
      }
    } catch (error) {
      console.error('建立工單排程錯誤:', error);
      setError('建立工單排程失敗，請稍後再試');
    }
  };

  /**
   * 處理刪除排程
   * @param scheduleId 排程 ID
   */
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('確定要刪除這個工單排程嗎？')) {
      return;
    }

    try {
      const response = await TargetService.deleteSchedule(scheduleId);

      if (response.success) {
        setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      } else {
        setError(response.message || '刪除工單排程失敗');
      }
    } catch (error) {
      console.error('刪除工單排程錯誤:', error);
      setError('刪除工單排程失敗，請稍後再試');
    }
  };

  /**
   * 取得優先級顏色
   * @param priority 優先級
   */
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  /**
   * 取得優先級圖示
   * @param priority 優先級
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <HighPriorityIcon />;
      case 'MEDIUM':
        return <MediumPriorityIcon />;
      case 'LOW':
        return <LowPriorityIcon />;
      default:
        return <MediumPriorityIcon />;
    }
  };

  /**
   * 取得優先級文字
   * @param priority 優先級
   */
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return '未知';
    }
  };

  /**
   * 取得狀態顏色
   * @param status 狀態
   */
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CLOSED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * 取得狀態圖示
   * @param status 狀態
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ScheduleIcon />;
      case 'IN_PROGRESS':
        return <PlayArrowIcon />;
      case 'COMPLETED':
      case 'CLOSED':
        return <CheckCircleIcon />;
      case 'CANCELLED':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  /**
   * 取得狀態文字
   * @param status 狀態
   */
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return '待處理';
      case 'IN_PROGRESS':
        return '進行中';
      case 'COMPLETED':
        return '已完成';
      case 'CLOSED':
        return '已關閉';
      case 'CANCELLED':
        return '已取消';
      default:
        return '未知狀態';
    }
  };

  // 當選中目標變更時載入排程資料
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // 如果沒有選中目標，顯示提示訊息
  if (!selectedTarget) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            請選擇預生產目標
          </Typography>
          <Typography variant="body2" color="text.secondary">
            從左側列表選擇一個預生產目標，查看其工單排程
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 標題列 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                工單排程
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              size="small"
            >
              新增排程
            </Button>
          </Box>
        </Box>

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 載入中 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 排程列表 */}
        {!loading && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {schedules.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  尚無工單排程
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  點擊「新增排程」按鈕為此目標安排工單
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  新增排程
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {schedules.map((schedule) => {
                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                  
                  return (
                    <Box key={schedule.id}>
                      <Card sx={{ 
                        '&:hover': { 
                          boxShadow: 3,
                          cursor: 'pointer' 
                        } 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="div">
                                  {(() => {
                                    const ticket = tickets.find(t => t.id === schedule.ticketId);
                                    return ticket ? getTicketName(ticket.deviceId) : '未知工單';
                                  })()}
                                </Typography>
                                <Chip
                                  icon={getStatusIcon(schedule.status)}
                                  label={getStatusText(schedule.status)}
                                  color={getStatusColor(schedule.status)}
                                  size="small"
                                />
                                <Chip
                                  icon={getPriorityIcon(schedule.priority)}
                                  label={getPriorityText(schedule.priority)}
                                  color={getPriorityColor(schedule.priority)}
                                  size="small"
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Station: {(() => {
                                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                                  return ticket ? getStationDisplay(ticket.deviceId) : '未知';
                                })()}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {dayjs(schedule.scheduledDate).format('YYYY-MM-DD')}
                                  </Typography>
                                </Box>
                                {schedule.scheduledTime && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {schedule.scheduledTime}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="查看詳情">
                                <IconButton
                                  size="small"
                                  onClick={() => ticket && onTicketSelect(ticket)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="編輯排程">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingSchedule(schedule);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              {/* 工單照片按鈕 - 只有AOI工單才顯示，包含上傳和查看功能 */}
                              {(() => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                // 只對AOI工單顯示相機圖示
                                return ticket && ticket.deviceId === 'AOI' ? (
                                  <Tooltip title={`${getTicketName(ticket.deviceId)}照片管理（上傳/查看）`}>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const photoUrl = `/ticket/${ticket.id}/photos`;
                                        window.open(photoUrl, '_blank');
                                      }}
                                      sx={{ color: 'primary.main' }}
                                    >
                                      <PhotoCamera />
                                    </IconButton>
                                  </Tooltip>
                                ) : null;
                              })()}
                              <Tooltip title="刪除排程">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* 新增排程對話框 */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>新增工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                select
                label="選擇工單"
                value={newSchedule.ticketId}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, ticketId: e.target.value }))}
                error={!!formErrors.ticketId}
                helperText={formErrors.ticketId}
                required
              >
                {tickets.map((ticket) => (
                  <MenuItem key={ticket.id} value={ticket.id}>
                    <Typography>
                      {getTicketName(ticket.deviceId)}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
              
              <DatePicker
                label="排程日期"
                value={newSchedule.scheduledDate ? dayjs(newSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.scheduledDate,
                    helperText: formErrors.scheduledDate,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={newSchedule.scheduledTime ? dayjs(newSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={newSchedule.priority}
                onChange={(e) => setNewSchedule(prev => ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }))}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSchedule} variant="contained">
              建立排程
            </Button>
          </DialogActions>
        </Dialog>

        {/* 編輯排程對話框 */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>編輯工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <DatePicker
                label="排程日期"
                value={editingSchedule?.scheduledDate ? dayjs(editingSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={editingSchedule?.scheduledTime ? dayjs(editingSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={editingSchedule?.priority || 'MEDIUM'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }) : null)}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="狀態"
                value={editingSchedule?.status || 'OPEN'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' 
                }) : null)}
              >
                <MenuItem value="OPEN">待處理</MenuItem>
                <MenuItem value="IN_PROGRESS">進行中</MenuItem>
                <MenuItem value="COMPLETED">已完成</MenuItem>
                <MenuItem value="CANCELLED">已取消</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={async () => {
                if (editingSchedule) {
                  // 確保資料格式符合後端 API 驗證規則
                  const updateData: any = {};
                  
                  // 日期格式：YYYY-MM-DD
                  if (editingSchedule.scheduledDate) {
                    updateData.scheduledDate = editingSchedule.scheduledDate;
                  }
                  
                  // 時間格式：HH:mm
                  if (editingSchedule.scheduledTime) {
                    updateData.scheduledTime = editingSchedule.scheduledTime;
                  }
                  
                  // 優先級：HIGH, MEDIUM, LOW
                  if (editingSchedule.priority) {
                    updateData.priority = editingSchedule.priority;
                  }
                  
                  // 狀態：OPEN, IN_PROGRESS, COMPLETED, CANCELLED
                  if (editingSchedule.status) {
                    updateData.status = editingSchedule.status;
                  }
                  
                  console.log('準備更新排程資料:', updateData);
                  
                  try {
                    const response = await TargetService.updateSchedule(editingSchedule.id, updateData);
                    
                    if (response.success && response.data) {
                      setSchedules(prev => prev.map(schedule => 
                        schedule.id === editingSchedule.id ? response.data! : schedule
                      ));
                      setEditDialogOpen(false);
                      setEditingSchedule(null);
                    } else {
                      setError(response.message || '更新工單排程失敗');
                    }
                  } catch (error) {
                    console.error('更新工單排程錯誤:', error);
                    setError('更新工單排程失敗，請稍後再試');
                  }
                }
              }} 
              variant="contained"
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketScheduleComponent;

```

```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  PriorityHigh as HighPriorityIcon,
  Circle as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { ProductionTarget, TicketSchedule, TicketScheduleWithRelations, CreateScheduleRequest, UpdateScheduleRequest, TargetStatus } from '../types/target';
import { Ticket } from '../types/ticket';
import { TargetService } from '../services/targetApi';
import { TicketService } from '../services/api';
import { formatTicketDisplay, getStationDisplay, getTicketName } from '../utils/stationMapping';

// 工單排程元件屬性介面
interface TicketScheduleProps {
  selectedTarget: ProductionTarget | null; // 選中的預生產目標
  onTicketSelect: (ticket: Ticket) => void; // 工單選擇回調函數
  onTargetUpdate?: (targetId: string, updatedTarget: ProductionTarget) => void; // 目標更新回調函數
}

// 工單排程元件
const TicketScheduleComponent: React.FC<TicketScheduleProps> = ({ 
  selectedTarget, 
  onTicketSelect,
  onTargetUpdate
}) => {
  // 狀態管理
  const [schedules, setSchedules] = useState<TicketSchedule[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTodaySchedules, setShowTodaySchedules] = useState(false); // 是否顯示今日排程
  const [todaySchedules, setTodaySchedules] = useState<TicketScheduleWithRelations[]>([]); // 今日排程資料
  
  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TicketSchedule | null>(null);

  // 新增排程表單狀態
  const [newSchedule, setNewSchedule] = useState<CreateScheduleRequest>({
    ticketId: '',
    targetId: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'MEDIUM',
  });

  // 表單驗證錯誤狀態
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * 載入工單排程資料
   */
  const loadSchedules = useCallback(async () => {
    if (!selectedTarget) {
      setSchedules([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 載入指定目標的工單排程
      const scheduleResponse = await TargetService.getTargetSchedules(selectedTarget.id);
      
      if (scheduleResponse.success && scheduleResponse.data) {
        setSchedules(scheduleResponse.data);
      } else {
        setError(scheduleResponse.message || '載入工單排程失敗');
      }

      // 載入所有工單（用於新增排程時選擇）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入工單排程錯誤:', error);
      setError('載入工單排程失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [selectedTarget]);

  /**
   * 載入今日排程
   */
  const loadTodaySchedules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 取得今天的日期（格式: YYYY-MM-DD）
      const today = dayjs().format('YYYY-MM-DD');
      
      // 載入今日所有排程
      const response = await TargetService.getSchedulesByDate(today);
      
      if (response.success && response.data) {
        setTodaySchedules(response.data);
        setShowTodaySchedules(true);
      } else {
        setError(response.message || '載入今日排程失敗');
        setTodaySchedules([]);
      }

      // 載入所有工單（用於顯示工單名稱）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入今日排程錯誤:', error);
      setError('載入今日排程失敗，請稍後再試');
      setTodaySchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 切換顯示模式（今日排程 / 目標排程）
   */
  const handleToggleView = () => {
    if (showTodaySchedules) {
      // 切換回目標排程模式
      setShowTodaySchedules(false);
      if (selectedTarget) {
        loadSchedules();
      }
    } else {
      // 切換到今日排程模式
      loadTodaySchedules();
    }
  };

  /**
   * 處理新增排程
   */
  const handleCreateSchedule = async () => {
    // 表單驗證
    const errors: { [key: string]: string } = {};
    if (!newSchedule.ticketId) {
      errors.ticketId = '請選擇工單';
    }
    if (!newSchedule.scheduledDate) {
      errors.scheduledDate = '請選擇排程日期';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 確保資料格式符合後端 API 驗證規則
      const scheduleData: any = {
        ticketId: newSchedule.ticketId,
        targetId: selectedTarget!.id,
        scheduledDate: newSchedule.scheduledDate,
      };
      
      // 可選欄位
      if (newSchedule.scheduledTime) {
        scheduleData.scheduledTime = newSchedule.scheduledTime;
      }
      if (newSchedule.priority) {
        scheduleData.priority = newSchedule.priority;
      }
      
      // 調試：顯示要發送的資料
      console.log('準備建立排程資料:', scheduleData);
      console.log('可用工單列表:', tickets);
      console.log('原始 newSchedule:', newSchedule);
      
      const response = await TargetService.createSchedule(scheduleData);

      if (response.success && response.data) {
        setSchedules(prev => [...prev, response.data!]);
        
        // 如果目標狀態被自動更新為「進行中」，通知父組件
        if (response.data.target && response.data.target.status === TargetStatus.IN_PROGRESS && onTargetUpdate) {
          // 將 API 回應的 target 轉換為 ProductionTarget 類型
          const updatedTarget: ProductionTarget = {
            id: response.data.target.id,
            name: response.data.target.name,
            description: response.data.target.description,
            expectedCompletionDate: response.data.target.expectedCompletionDate,
            status: response.data.target.status,
            createdAt: response.data.target.createdAt,
            updatedAt: response.data.target.updatedAt,
          };
          onTargetUpdate(response.data.targetId, updatedTarget);
        }
        
        setCreateDialogOpen(false);
        setNewSchedule({
          ticketId: '',
          targetId: '',
          scheduledDate: '',
          scheduledTime: '',
          priority: 'MEDIUM',
        });
        setFormErrors({});
      } else {
        setError(response.message || '建立工單排程失敗');
      }
    } catch (error) {
      console.error('建立工單排程錯誤:', error);
      setError('建立工單排程失敗，請稍後再試');
    }
  };

  /**
   * 處理刪除排程
   * @param scheduleId 排程 ID
   */
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('確定要刪除這個工單排程嗎？')) {
      return;
    }

    try {
      const response = await TargetService.deleteSchedule(scheduleId);

      if (response.success) {
        setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      } else {
        setError(response.message || '刪除工單排程失敗');
      }
    } catch (error) {
      console.error('刪除工單排程錯誤:', error);
      setError('刪除工單排程失敗，請稍後再試');
    }
  };

  /**
   * 取得優先級顏色
   * @param priority 優先級
   */
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  /**
   * 取得優先級圖示
   * @param priority 優先級
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <HighPriorityIcon />;
      case 'MEDIUM':
        return <MediumPriorityIcon />;
      case 'LOW':
        return <LowPriorityIcon />;
      default:
        return <MediumPriorityIcon />;
    }
  };

  /**
   * 取得優先級文字
   * @param priority 優先級
   */
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return '未知';
    }
  };

  /**
   * 取得狀態顏色
   * @param status 狀態
   */
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CLOSED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * 取得狀態圖示
   * @param status 狀態
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ScheduleIcon />;
      case 'IN_PROGRESS':
        return <PlayArrowIcon />;
      case 'COMPLETED':
      case 'CLOSED':
        return <CheckCircleIcon />;
      case 'CANCELLED':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  /**
   * 取得狀態文字
   * @param status 狀態
   */
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return '待處理';
      case 'IN_PROGRESS':
        return '進行中';
      case 'COMPLETED':
        return '已完成';
      case 'CLOSED':
        return '已關閉';
      case 'CANCELLED':
        return '已取消';
      default:
        return '未知狀態';
    }
  };

  // 當選中目標變更時載入排程資料
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // 如果沒有選中目標，顯示提示訊息
  if (!selectedTarget) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            請選擇預生產目標
          </Typography>
          <Typography variant="body2" color="text.secondary">
            從左側列表選擇一個預生產目標，查看其工單排程
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 標題列 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                工單排程
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              size="small"
            >
              新增排程
            </Button>
          </Box>
        </Box>

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 載入中 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 排程列表 */}
        {!loading && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {schedules.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  尚無工單排程
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  點擊「新增排程」按鈕為此目標安排工單
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  新增排程
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {schedules.map((schedule) => {
                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                  
                  return (
                    <Box key={schedule.id}>
                      <Card sx={{ 
                        '&:hover': { 
                          boxShadow: 3,
                          cursor: 'pointer' 
                        } 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="div">
                                  {(() => {
                                    const ticket = tickets.find(t => t.id === schedule.ticketId);
                                    return ticket ? getTicketName(ticket.deviceId) : '未知工單';
                                  })()}
                                </Typography>
                                <Chip
                                  icon={getStatusIcon(schedule.status)}
                                  label={getStatusText(schedule.status)}
                                  color={getStatusColor(schedule.status)}
                                  size="small"
                                />
                                <Chip
                                  icon={getPriorityIcon(schedule.priority)}
                                  label={getPriorityText(schedule.priority)}
                                  color={getPriorityColor(schedule.priority)}
                                  size="small"
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Station: {(() => {
                                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                                  return ticket ? getStationDisplay(ticket.deviceId) : '未知';
                                })()}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {dayjs(schedule.scheduledDate).format('YYYY-MM-DD')}
                                  </Typography>
                                </Box>
                                {schedule.scheduledTime && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {schedule.scheduledTime}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="查看詳情">
                                <IconButton
                                  size="small"
                                  onClick={() => ticket && onTicketSelect(ticket)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="編輯排程">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingSchedule(schedule);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              {/* 工單照片按鈕 - 只有AOI工單才顯示，包含上傳和查看功能 */}
                              {(() => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                // 只對AOI工單顯示相機圖示
                                return ticket && ticket.deviceId === 'AOI' ? (
                                  <Tooltip title={`${getTicketName(ticket.deviceId)}照片管理（上傳/查看）`}>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const photoUrl = `/ticket/${ticket.id}/photos`;
                                        window.open(photoUrl, '_blank');
                                      }}
                                      sx={{ color: 'primary.main' }}
                                    >
                                      <PhotoCamera />
                                    </IconButton>
                                  </Tooltip>
                                ) : null;
                              })()}
                              <Tooltip title="刪除排程">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* 新增排程對話框 */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>新增工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                select
                label="選擇工單"
                value={newSchedule.ticketId}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, ticketId: e.target.value }))}
                error={!!formErrors.ticketId}
                helperText={formErrors.ticketId}
                required
              >
                {tickets.map((ticket) => (
                  <MenuItem key={ticket.id} value={ticket.id}>
                    <Typography>
                      {getTicketName(ticket.deviceId)}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
              
              <DatePicker
                label="排程日期"
                value={newSchedule.scheduledDate ? dayjs(newSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.scheduledDate,
                    helperText: formErrors.scheduledDate,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={newSchedule.scheduledTime ? dayjs(newSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={newSchedule.priority}
                onChange={(e) => setNewSchedule(prev => ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }))}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSchedule} variant="contained">
              建立排程
            </Button>
          </DialogActions>
        </Dialog>

        {/* 編輯排程對話框 */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>編輯工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <DatePicker
                label="排程日期"
                value={editingSchedule?.scheduledDate ? dayjs(editingSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={editingSchedule?.scheduledTime ? dayjs(editingSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={editingSchedule?.priority || 'MEDIUM'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }) : null)}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="狀態"
                value={editingSchedule?.status || 'OPEN'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' 
                }) : null)}
              >
                <MenuItem value="OPEN">待處理</MenuItem>
                <MenuItem value="IN_PROGRESS">進行中</MenuItem>
                <MenuItem value="COMPLETED">已完成</MenuItem>
                <MenuItem value="CANCELLED">已取消</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={async () => {
                if (editingSchedule) {
                  // 確保資料格式符合後端 API 驗證規則
                  const updateData: any = {};
                  
                  // 日期格式：YYYY-MM-DD
                  if (editingSchedule.scheduledDate) {
                    updateData.scheduledDate = editingSchedule.scheduledDate;
                  }
                  
                  // 時間格式：HH:mm
                  if (editingSchedule.scheduledTime) {
                    updateData.scheduledTime = editingSchedule.scheduledTime;
                  }
                  
                  // 優先級：HIGH, MEDIUM, LOW
                  if (editingSchedule.priority) {
                    updateData.priority = editingSchedule.priority;
                  }
                  
                  // 狀態：OPEN, IN_PROGRESS, COMPLETED, CANCELLED
                  if (editingSchedule.status) {
                    updateData.status = editingSchedule.status;
                  }
                  
                  console.log('準備更新排程資料:', updateData);
                  
                  try {
                    const response = await TargetService.updateSchedule(editingSchedule.id, updateData);
                    
                    if (response.success && response.data) {
                      setSchedules(prev => prev.map(schedule => 
                        schedule.id === editingSchedule.id ? response.data! : schedule
                      ));
                      setEditDialogOpen(false);
                      setEditingSchedule(null);
                    } else {
                      setError(response.message || '更新工單排程失敗');
                    }
                  } catch (error) {
                    console.error('更新工單排程錯誤:', error);
                    setError('更新工單排程失敗，請稍後再試');
                  }
                }
              }} 
              variant="contained"
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketScheduleComponent;

```

更新 UI，新增「今日排程」按鈕，並實作按目標分組的顯示邏輯：


```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  PriorityHigh as HighPriorityIcon,
  Circle as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { ProductionTarget, TicketSchedule, TicketScheduleWithRelations, CreateScheduleRequest, UpdateScheduleRequest, TargetStatus } from '../types/target';
import { Ticket } from '../types/ticket';
import { TargetService } from '../services/targetApi';
import { TicketService } from '../services/api';
import { formatTicketDisplay, getStationDisplay, getTicketName } from '../utils/stationMapping';

// 工單排程元件屬性介面
interface TicketScheduleProps {
  selectedTarget: ProductionTarget | null; // 選中的預生產目標
  onTicketSelect: (ticket: Ticket) => void; // 工單選擇回調函數
  onTargetUpdate?: (targetId: string, updatedTarget: ProductionTarget) => void; // 目標更新回調函數
}

// 工單排程元件
const TicketScheduleComponent: React.FC<TicketScheduleProps> = ({ 
  selectedTarget, 
  onTicketSelect,
  onTargetUpdate
}) => {
  // 狀態管理
  const [schedules, setSchedules] = useState<TicketSchedule[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTodaySchedules, setShowTodaySchedules] = useState(false); // 是否顯示今日排程
  const [todaySchedules, setTodaySchedules] = useState<TicketScheduleWithRelations[]>([]); // 今日排程資料
  
  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TicketSchedule | null>(null);

  // 新增排程表單狀態
  const [newSchedule, setNewSchedule] = useState<CreateScheduleRequest>({
    ticketId: '',
    targetId: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'MEDIUM',
  });

  // 表單驗證錯誤狀態
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * 載入工單排程資料
   */
  const loadSchedules = useCallback(async () => {
    if (!selectedTarget) {
      setSchedules([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 載入指定目標的工單排程
      const scheduleResponse = await TargetService.getTargetSchedules(selectedTarget.id);
      
      if (scheduleResponse.success && scheduleResponse.data) {
        setSchedules(scheduleResponse.data);
      } else {
        setError(scheduleResponse.message || '載入工單排程失敗');
      }

      // 載入所有工單（用於新增排程時選擇）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入工單排程錯誤:', error);
      setError('載入工單排程失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [selectedTarget]);

  /**
   * 載入今日排程
   */
  const loadTodaySchedules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 取得今天的日期（格式: YYYY-MM-DD）
      const today = dayjs().format('YYYY-MM-DD');
      
      // 載入今日所有排程
      const response = await TargetService.getSchedulesByDate(today);
      
      if (response.success && response.data) {
        setTodaySchedules(response.data);
        setShowTodaySchedules(true);
      } else {
        setError(response.message || '載入今日排程失敗');
        setTodaySchedules([]);
      }

      // 載入所有工單（用於顯示工單名稱）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入今日排程錯誤:', error);
      setError('載入今日排程失敗，請稍後再試');
      setTodaySchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 切換顯示模式（今日排程 / 目標排程）
   */
  const handleToggleView = () => {
    if (showTodaySchedules) {
      // 切換回目標排程模式
      setShowTodaySchedules(false);
      if (selectedTarget) {
        loadSchedules();
      }
    } else {
      // 切換到今日排程模式
      loadTodaySchedules();
    }
  };

  /**
   * 處理新增排程
   */
  const handleCreateSchedule = async () => {
    // 表單驗證
    const errors: { [key: string]: string } = {};
    if (!newSchedule.ticketId) {
      errors.ticketId = '請選擇工單';
    }
    if (!newSchedule.scheduledDate) {
      errors.scheduledDate = '請選擇排程日期';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 確保資料格式符合後端 API 驗證規則
      const scheduleData: any = {
        ticketId: newSchedule.ticketId,
        targetId: selectedTarget!.id,
        scheduledDate: newSchedule.scheduledDate,
      };
      
      // 可選欄位
      if (newSchedule.scheduledTime) {
        scheduleData.scheduledTime = newSchedule.scheduledTime;
      }
      if (newSchedule.priority) {
        scheduleData.priority = newSchedule.priority;
      }
      
      // 調試：顯示要發送的資料
      console.log('準備建立排程資料:', scheduleData);
      console.log('可用工單列表:', tickets);
      console.log('原始 newSchedule:', newSchedule);
      
      const response = await TargetService.createSchedule(scheduleData);

      if (response.success && response.data) {
        setSchedules(prev => [...prev, response.data!]);
        
        // 如果目標狀態被自動更新為「進行中」，通知父組件
        if (response.data.target && response.data.target.status === TargetStatus.IN_PROGRESS && onTargetUpdate) {
          // 將 API 回應的 target 轉換為 ProductionTarget 類型
          const updatedTarget: ProductionTarget = {
            id: response.data.target.id,
            name: response.data.target.name,
            description: response.data.target.description,
            expectedCompletionDate: response.data.target.expectedCompletionDate,
            status: response.data.target.status,
            createdAt: response.data.target.createdAt,
            updatedAt: response.data.target.updatedAt,
          };
          onTargetUpdate(response.data.targetId, updatedTarget);
        }
        
        setCreateDialogOpen(false);
        setNewSchedule({
          ticketId: '',
          targetId: '',
          scheduledDate: '',
          scheduledTime: '',
          priority: 'MEDIUM',
        });
        setFormErrors({});
      } else {
        setError(response.message || '建立工單排程失敗');
      }
    } catch (error) {
      console.error('建立工單排程錯誤:', error);
      setError('建立工單排程失敗，請稍後再試');
    }
  };

  /**
   * 處理刪除排程
   * @param scheduleId 排程 ID
   */
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('確定要刪除這個工單排程嗎？')) {
      return;
    }

    try {
      const response = await TargetService.deleteSchedule(scheduleId);

      if (response.success) {
        setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      } else {
        setError(response.message || '刪除工單排程失敗');
      }
    } catch (error) {
      console.error('刪除工單排程錯誤:', error);
      setError('刪除工單排程失敗，請稍後再試');
    }
  };

  /**
   * 取得優先級顏色
   * @param priority 優先級
   */
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  /**
   * 取得優先級圖示
   * @param priority 優先級
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <HighPriorityIcon />;
      case 'MEDIUM':
        return <MediumPriorityIcon />;
      case 'LOW':
        return <LowPriorityIcon />;
      default:
        return <MediumPriorityIcon />;
    }
  };

  /**
   * 取得優先級文字
   * @param priority 優先級
   */
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return '未知';
    }
  };

  /**
   * 取得狀態顏色
   * @param status 狀態
   */
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CLOSED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * 取得狀態圖示
   * @param status 狀態
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ScheduleIcon />;
      case 'IN_PROGRESS':
        return <PlayArrowIcon />;
      case 'COMPLETED':
      case 'CLOSED':
        return <CheckCircleIcon />;
      case 'CANCELLED':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  /**
   * 取得狀態文字
   * @param status 狀態
   */
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return '待處理';
      case 'IN_PROGRESS':
        return '進行中';
      case 'COMPLETED':
        return '已完成';
      case 'CLOSED':
        return '已關閉';
      case 'CANCELLED':
        return '已取消';
      default:
        return '未知狀態';
    }
  };

  // 當選中目標變更時載入排程資料
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // 如果沒有選中目標，顯示提示訊息
  if (!selectedTarget) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            請選擇預生產目標
          </Typography>
          <Typography variant="body2" color="text.secondary">
            從左側列表選擇一個預生產目標，查看其工單排程
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 標題列 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                {showTodaySchedules ? '今日排程' : '工單排程'}
              </Typography>
              {showTodaySchedules && (
                <Typography variant="body2" color="text.secondary">
                  {dayjs().format('YYYY年MM月DD日')}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={showTodaySchedules ? "outlined" : "contained"}
                startIcon={<CalendarIcon />}
                onClick={handleToggleView}
                size="small"
              >
                今日排程
              </Button>
              {!showTodaySchedules && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  size="small"
                >
                  新增排程
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 載入中 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 排程列表 */}
        {!loading && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {schedules.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  尚無工單排程
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  點擊「新增排程」按鈕為此目標安排工單
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  新增排程
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {schedules.map((schedule) => {
                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                  
                  return (
                    <Box key={schedule.id}>
                      <Card sx={{ 
                        '&:hover': { 
                          boxShadow: 3,
                          cursor: 'pointer' 
                        } 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="div">
                                  {(() => {
                                    const ticket = tickets.find(t => t.id === schedule.ticketId);
                                    return ticket ? getTicketName(ticket.deviceId) : '未知工單';
                                  })()}
                                </Typography>
                                <Chip
                                  icon={getStatusIcon(schedule.status)}
                                  label={getStatusText(schedule.status)}
                                  color={getStatusColor(schedule.status)}
                                  size="small"
                                />
                                <Chip
                                  icon={getPriorityIcon(schedule.priority)}
                                  label={getPriorityText(schedule.priority)}
                                  color={getPriorityColor(schedule.priority)}
                                  size="small"
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Station: {(() => {
                                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                                  return ticket ? getStationDisplay(ticket.deviceId) : '未知';
                                })()}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {dayjs(schedule.scheduledDate).format('YYYY-MM-DD')}
                                  </Typography>
                                </Box>
                                {schedule.scheduledTime && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {schedule.scheduledTime}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="查看詳情">
                                <IconButton
                                  size="small"
                                  onClick={() => ticket && onTicketSelect(ticket)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="編輯排程">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingSchedule(schedule);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              {/* 工單照片按鈕 - 只有AOI工單才顯示，包含上傳和查看功能 */}
                              {(() => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                // 只對AOI工單顯示相機圖示
                                return ticket && ticket.deviceId === 'AOI' ? (
                                  <Tooltip title={`${getTicketName(ticket.deviceId)}照片管理（上傳/查看）`}>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const photoUrl = `/ticket/${ticket.id}/photos`;
                                        window.open(photoUrl, '_blank');
                                      }}
                                      sx={{ color: 'primary.main' }}
                                    >
                                      <PhotoCamera />
                                    </IconButton>
                                  </Tooltip>
                                ) : null;
                              })()}
                              <Tooltip title="刪除排程">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* 新增排程對話框 */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>新增工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                select
                label="選擇工單"
                value={newSchedule.ticketId}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, ticketId: e.target.value }))}
                error={!!formErrors.ticketId}
                helperText={formErrors.ticketId}
                required
              >
                {tickets.map((ticket) => (
                  <MenuItem key={ticket.id} value={ticket.id}>
                    <Typography>
                      {getTicketName(ticket.deviceId)}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
              
              <DatePicker
                label="排程日期"
                value={newSchedule.scheduledDate ? dayjs(newSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.scheduledDate,
                    helperText: formErrors.scheduledDate,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={newSchedule.scheduledTime ? dayjs(newSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={newSchedule.priority}
                onChange={(e) => setNewSchedule(prev => ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }))}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSchedule} variant="contained">
              建立排程
            </Button>
          </DialogActions>
        </Dialog>

        {/* 編輯排程對話框 */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>編輯工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <DatePicker
                label="排程日期"
                value={editingSchedule?.scheduledDate ? dayjs(editingSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={editingSchedule?.scheduledTime ? dayjs(editingSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={editingSchedule?.priority || 'MEDIUM'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }) : null)}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="狀態"
                value={editingSchedule?.status || 'OPEN'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' 
                }) : null)}
              >
                <MenuItem value="OPEN">待處理</MenuItem>
                <MenuItem value="IN_PROGRESS">進行中</MenuItem>
                <MenuItem value="COMPLETED">已完成</MenuItem>
                <MenuItem value="CANCELLED">已取消</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={async () => {
                if (editingSchedule) {
                  // 確保資料格式符合後端 API 驗證規則
                  const updateData: any = {};
                  
                  // 日期格式：YYYY-MM-DD
                  if (editingSchedule.scheduledDate) {
                    updateData.scheduledDate = editingSchedule.scheduledDate;
                  }
                  
                  // 時間格式：HH:mm
                  if (editingSchedule.scheduledTime) {
                    updateData.scheduledTime = editingSchedule.scheduledTime;
                  }
                  
                  // 優先級：HIGH, MEDIUM, LOW
                  if (editingSchedule.priority) {
                    updateData.priority = editingSchedule.priority;
                  }
                  
                  // 狀態：OPEN, IN_PROGRESS, COMPLETED, CANCELLED
                  if (editingSchedule.status) {
                    updateData.status = editingSchedule.status;
                  }
                  
                  console.log('準備更新排程資料:', updateData);
                  
                  try {
                    const response = await TargetService.updateSchedule(editingSchedule.id, updateData);
                    
                    if (response.success && response.data) {
                      setSchedules(prev => prev.map(schedule => 
                        schedule.id === editingSchedule.id ? response.data! : schedule
                      ));
                      setEditDialogOpen(false);
                      setEditingSchedule(null);
                    } else {
                      setError(response.message || '更新工單排程失敗');
                    }
                  } catch (error) {
                    console.error('更新工單排程錯誤:', error);
                    setError('更新工單排程失敗，請稍後再試');
                  }
                }
              }} 
              variant="contained"
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketScheduleComponent;

```

更新排程列表顯示邏輯，支援按目標分組的今日排程：


```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  PriorityHigh as HighPriorityIcon,
  Circle as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { ProductionTarget, TicketSchedule, TicketScheduleWithRelations, CreateScheduleRequest, UpdateScheduleRequest, TargetStatus } from '../types/target';
import { Ticket } from '../types/ticket';
import { TargetService } from '../services/targetApi';
import { TicketService } from '../services/api';
import { formatTicketDisplay, getStationDisplay, getTicketName } from '../utils/stationMapping';

// 工單排程元件屬性介面
interface TicketScheduleProps {
  selectedTarget: ProductionTarget | null; // 選中的預生產目標
  onTicketSelect: (ticket: Ticket) => void; // 工單選擇回調函數
  onTargetUpdate?: (targetId: string, updatedTarget: ProductionTarget) => void; // 目標更新回調函數
}

// 工單排程元件
const TicketScheduleComponent: React.FC<TicketScheduleProps> = ({ 
  selectedTarget, 
  onTicketSelect,
  onTargetUpdate
}) => {
  // 狀態管理
  const [schedules, setSchedules] = useState<TicketSchedule[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTodaySchedules, setShowTodaySchedules] = useState(false); // 是否顯示今日排程
  const [todaySchedules, setTodaySchedules] = useState<TicketScheduleWithRelations[]>([]); // 今日排程資料
  
  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TicketSchedule | null>(null);

  // 新增排程表單狀態
  const [newSchedule, setNewSchedule] = useState<CreateScheduleRequest>({
    ticketId: '',
    targetId: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'MEDIUM',
  });

  // 表單驗證錯誤狀態
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * 載入工單排程資料
   */
  const loadSchedules = useCallback(async () => {
    if (!selectedTarget) {
      setSchedules([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 載入指定目標的工單排程
      const scheduleResponse = await TargetService.getTargetSchedules(selectedTarget.id);
      
      if (scheduleResponse.success && scheduleResponse.data) {
        setSchedules(scheduleResponse.data);
      } else {
        setError(scheduleResponse.message || '載入工單排程失敗');
      }

      // 載入所有工單（用於新增排程時選擇）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入工單排程錯誤:', error);
      setError('載入工單排程失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [selectedTarget]);

  /**
   * 載入今日排程
   */
  const loadTodaySchedules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 取得今天的日期（格式: YYYY-MM-DD）
      const today = dayjs().format('YYYY-MM-DD');
      
      // 載入今日所有排程
      const response = await TargetService.getSchedulesByDate(today);
      
      if (response.success && response.data) {
        setTodaySchedules(response.data);
        setShowTodaySchedules(true);
      } else {
        setError(response.message || '載入今日排程失敗');
        setTodaySchedules([]);
      }

      // 載入所有工單（用於顯示工單名稱）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入今日排程錯誤:', error);
      setError('載入今日排程失敗，請稍後再試');
      setTodaySchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 切換顯示模式（今日排程 / 目標排程）
   */
  const handleToggleView = () => {
    if (showTodaySchedules) {
      // 切換回目標排程模式
      setShowTodaySchedules(false);
      if (selectedTarget) {
        loadSchedules();
      }
    } else {
      // 切換到今日排程模式
      loadTodaySchedules();
    }
  };

  /**
   * 處理新增排程
   */
  const handleCreateSchedule = async () => {
    // 表單驗證
    const errors: { [key: string]: string } = {};
    if (!newSchedule.ticketId) {
      errors.ticketId = '請選擇工單';
    }
    if (!newSchedule.scheduledDate) {
      errors.scheduledDate = '請選擇排程日期';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 確保資料格式符合後端 API 驗證規則
      const scheduleData: any = {
        ticketId: newSchedule.ticketId,
        targetId: selectedTarget!.id,
        scheduledDate: newSchedule.scheduledDate,
      };
      
      // 可選欄位
      if (newSchedule.scheduledTime) {
        scheduleData.scheduledTime = newSchedule.scheduledTime;
      }
      if (newSchedule.priority) {
        scheduleData.priority = newSchedule.priority;
      }
      
      // 調試：顯示要發送的資料
      console.log('準備建立排程資料:', scheduleData);
      console.log('可用工單列表:', tickets);
      console.log('原始 newSchedule:', newSchedule);
      
      const response = await TargetService.createSchedule(scheduleData);

      if (response.success && response.data) {
        setSchedules(prev => [...prev, response.data!]);
        
        // 如果目標狀態被自動更新為「進行中」，通知父組件
        if (response.data.target && response.data.target.status === TargetStatus.IN_PROGRESS && onTargetUpdate) {
          // 將 API 回應的 target 轉換為 ProductionTarget 類型
          const updatedTarget: ProductionTarget = {
            id: response.data.target.id,
            name: response.data.target.name,
            description: response.data.target.description,
            expectedCompletionDate: response.data.target.expectedCompletionDate,
            status: response.data.target.status,
            createdAt: response.data.target.createdAt,
            updatedAt: response.data.target.updatedAt,
          };
          onTargetUpdate(response.data.targetId, updatedTarget);
        }
        
        setCreateDialogOpen(false);
        setNewSchedule({
          ticketId: '',
          targetId: '',
          scheduledDate: '',
          scheduledTime: '',
          priority: 'MEDIUM',
        });
        setFormErrors({});
      } else {
        setError(response.message || '建立工單排程失敗');
      }
    } catch (error) {
      console.error('建立工單排程錯誤:', error);
      setError('建立工單排程失敗，請稍後再試');
    }
  };

  /**
   * 處理刪除排程
   * @param scheduleId 排程 ID
   */
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('確定要刪除這個工單排程嗎？')) {
      return;
    }

    try {
      const response = await TargetService.deleteSchedule(scheduleId);

      if (response.success) {
        setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
      } else {
        setError(response.message || '刪除工單排程失敗');
      }
    } catch (error) {
      console.error('刪除工單排程錯誤:', error);
      setError('刪除工單排程失敗，請稍後再試');
    }
  };

  /**
   * 取得優先級顏色
   * @param priority 優先級
   */
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  /**
   * 取得優先級圖示
   * @param priority 優先級
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <HighPriorityIcon />;
      case 'MEDIUM':
        return <MediumPriorityIcon />;
      case 'LOW':
        return <LowPriorityIcon />;
      default:
        return <MediumPriorityIcon />;
    }
  };

  /**
   * 取得優先級文字
   * @param priority 優先級
   */
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return '未知';
    }
  };

  /**
   * 取得狀態顏色
   * @param status 狀態
   */
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CLOSED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * 取得狀態圖示
   * @param status 狀態
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ScheduleIcon />;
      case 'IN_PROGRESS':
        return <PlayArrowIcon />;
      case 'COMPLETED':
      case 'CLOSED':
        return <CheckCircleIcon />;
      case 'CANCELLED':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  /**
   * 取得狀態文字
   * @param status 狀態
   */
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return '待處理';
      case 'IN_PROGRESS':
        return '進行中';
      case 'COMPLETED':
        return '已完成';
      case 'CLOSED':
        return '已關閉';
      case 'CANCELLED':
        return '已取消';
      default:
        return '未知狀態';
    }
  };

  // 當選中目標變更時載入排程資料
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // 如果沒有選中目標，顯示提示訊息
  if (!selectedTarget) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            請選擇預生產目標
          </Typography>
          <Typography variant="body2" color="text.secondary">
            從左側列表選擇一個預生產目標，查看其工單排程
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 標題列 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                {showTodaySchedules ? '今日排程' : '工單排程'}
              </Typography>
              {showTodaySchedules && (
                <Typography variant="body2" color="text.secondary">
                  {dayjs().format('YYYY年MM月DD日')}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={showTodaySchedules ? "outlined" : "contained"}
                startIcon={<CalendarIcon />}
                onClick={handleToggleView}
                size="small"
              >
                今日排程
              </Button>
              {!showTodaySchedules && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  size="small"
                >
                  新增排程
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 載入中 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 排程列表 */}
        {!loading && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {showTodaySchedules ? (
              // 今日排程模式：按目標分組顯示
              todaySchedules.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    今日尚無排程
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs().format('YYYY年MM月DD日')} 沒有任何工單排程
                  </Typography>
                </Paper>
              ) : (
                // 按目標分組顯示今日排程
                (() => {
                  // 按目標 ID 分組
                  const groupedByTarget = todaySchedules.reduce((acc, schedule) => {
                    const targetId = schedule.targetId;
                    if (!acc[targetId]) {
                      acc[targetId] = {
                        target: schedule.target,
                        schedules: [],
                      };
                    }
                    acc[targetId].schedules.push(schedule);
                    return acc;
                  }, {} as Record<string, { target: any; schedules: TicketScheduleWithRelations[] }>);

                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {Object.values(groupedByTarget).map((group, index) => (
                        <Card key={group.target.id} sx={{ border: 1, borderColor: 'divider' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                              {group.target.name}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {group.schedules.map((schedule) => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                return (
                                  <Card 
                                    key={schedule.id}
                                    sx={{ 
                                      backgroundColor: 'background.paper',
                                      '&:hover': { 
                                        boxShadow: 2,
                                        cursor: 'pointer' 
                                      } 
                                    }}
                                    onClick={() => ticket && onTicketSelect(ticket)}
                                  >
                                    <CardContent>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" component="div">
                                              {ticket ? getTicketName(ticket.deviceId) : '未知工單'}
                                            </Typography>
                                            <Chip
                                              icon={getStatusIcon(schedule.status)}
                                              label={getStatusText(schedule.status)}
                                              color={getStatusColor(schedule.status)}
                                              size="small"
                                            />
                                            <Chip
                                              icon={getPriorityIcon(schedule.priority)}
                                              label={getPriorityText(schedule.priority)}
                                              color={getPriorityColor(schedule.priority)}
                                              size="small"
                                            />
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                              <CalendarIcon fontSize="small" color="action" />
                                              <Typography variant="body2" color="text.secondary">
                                                {schedule.scheduledDate}
                                              </Typography>
                                            </Box>
                                            {schedule.scheduledTime && (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <TimeIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                  {schedule.scheduledTime}
                                                </Typography>
                                              </Box>
                                            )}
                                          </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingSchedule(schedule);
                                              setEditDialogOpen(true);
                                            }}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSchedule(schedule.id);
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  );
                })()
              )
            ) : schedules.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  尚無工單排程
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  點擊「新增排程」按鈕為此目標安排工單
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  新增排程
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {schedules.map((schedule) => {
                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                  
                  return (
                    <Box key={schedule.id}>
                      <Card sx={{ 
                        '&:hover': { 
                          boxShadow: 3,
                          cursor: 'pointer' 
                        } 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="div">
                                  {(() => {
                                    const ticket = tickets.find(t => t.id === schedule.ticketId);
                                    return ticket ? getTicketName(ticket.deviceId) : '未知工單';
                                  })()}
                                </Typography>
                                <Chip
                                  icon={getStatusIcon(schedule.status)}
                                  label={getStatusText(schedule.status)}
                                  color={getStatusColor(schedule.status)}
                                  size="small"
                                />
                                <Chip
                                  icon={getPriorityIcon(schedule.priority)}
                                  label={getPriorityText(schedule.priority)}
                                  color={getPriorityColor(schedule.priority)}
                                  size="small"
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Station: {(() => {
                                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                                  return ticket ? getStationDisplay(ticket.deviceId) : '未知';
                                })()}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {dayjs(schedule.scheduledDate).format('YYYY-MM-DD')}
                                  </Typography>
                                </Box>
                                {schedule.scheduledTime && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {schedule.scheduledTime}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="查看詳情">
                                <IconButton
                                  size="small"
                                  onClick={() => ticket && onTicketSelect(ticket)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="編輯排程">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingSchedule(schedule);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              {/* 工單照片按鈕 - 只有AOI工單才顯示，包含上傳和查看功能 */}
                              {(() => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                // 只對AOI工單顯示相機圖示
                                return ticket && ticket.deviceId === 'AOI' ? (
                                  <Tooltip title={`${getTicketName(ticket.deviceId)}照片管理（上傳/查看）`}>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const photoUrl = `/ticket/${ticket.id}/photos`;
                                        window.open(photoUrl, '_blank');
                                      }}
                                      sx={{ color: 'primary.main' }}
                                    >
                                      <PhotoCamera />
                                    </IconButton>
                                  </Tooltip>
                                ) : null;
                              })()}
                              <Tooltip title="刪除排程">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* 新增排程對話框 */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>新增工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                select
                label="選擇工單"
                value={newSchedule.ticketId}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, ticketId: e.target.value }))}
                error={!!formErrors.ticketId}
                helperText={formErrors.ticketId}
                required
              >
                {tickets.map((ticket) => (
                  <MenuItem key={ticket.id} value={ticket.id}>
                    <Typography>
                      {getTicketName(ticket.deviceId)}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
              
              <DatePicker
                label="排程日期"
                value={newSchedule.scheduledDate ? dayjs(newSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.scheduledDate,
                    helperText: formErrors.scheduledDate,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={newSchedule.scheduledTime ? dayjs(newSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={newSchedule.priority}
                onChange={(e) => setNewSchedule(prev => ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }))}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSchedule} variant="contained">
              建立排程
            </Button>
          </DialogActions>
        </Dialog>

        {/* 編輯排程對話框 */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>編輯工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <DatePicker
                label="排程日期"
                value={editingSchedule?.scheduledDate ? dayjs(editingSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={editingSchedule?.scheduledTime ? dayjs(editingSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={editingSchedule?.priority || 'MEDIUM'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }) : null)}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="狀態"
                value={editingSchedule?.status || 'OPEN'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' 
                }) : null)}
              >
                <MenuItem value="OPEN">待處理</MenuItem>
                <MenuItem value="IN_PROGRESS">進行中</MenuItem>
                <MenuItem value="COMPLETED">已完成</MenuItem>
                <MenuItem value="CANCELLED">已取消</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={async () => {
                if (editingSchedule) {
                  // 確保資料格式符合後端 API 驗證規則
                  const updateData: any = {};
                  
                  // 日期格式：YYYY-MM-DD
                  if (editingSchedule.scheduledDate) {
                    updateData.scheduledDate = editingSchedule.scheduledDate;
                  }
                  
                  // 時間格式：HH:mm
                  if (editingSchedule.scheduledTime) {
                    updateData.scheduledTime = editingSchedule.scheduledTime;
                  }
                  
                  // 優先級：HIGH, MEDIUM, LOW
                  if (editingSchedule.priority) {
                    updateData.priority = editingSchedule.priority;
                  }
                  
                  // 狀態：OPEN, IN_PROGRESS, COMPLETED, CANCELLED
                  if (editingSchedule.status) {
                    updateData.status = editingSchedule.status;
                  }
                  
                  console.log('準備更新排程資料:', updateData);
                  
                  try {
                    const response = await TargetService.updateSchedule(editingSchedule.id, updateData);
                    
                    if (response.success && response.data) {
                      setSchedules(prev => prev.map(schedule => 
                        schedule.id === editingSchedule.id ? response.data! : schedule
                      ));
                      setEditDialogOpen(false);
                      setEditingSchedule(null);
                    } else {
                      setError(response.message || '更新工單排程失敗');
                    }
                  } catch (error) {
                    console.error('更新工單排程錯誤:', error);
                    setError('更新工單排程失敗，請稍後再試');
                  }
                }
              }} 
              variant="contained"
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketScheduleComponent;

```

更新刪除排程函數，使其在今日排程模式下也能正確更新：


```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  PriorityHigh as HighPriorityIcon,
  Circle as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { ProductionTarget, TicketSchedule, TicketScheduleWithRelations, CreateScheduleRequest, UpdateScheduleRequest, TargetStatus } from '../types/target';
import { Ticket } from '../types/ticket';
import { TargetService } from '../services/targetApi';
import { TicketService } from '../services/api';
import { formatTicketDisplay, getStationDisplay, getTicketName } from '../utils/stationMapping';

// 工單排程元件屬性介面
interface TicketScheduleProps {
  selectedTarget: ProductionTarget | null; // 選中的預生產目標
  onTicketSelect: (ticket: Ticket) => void; // 工單選擇回調函數
  onTargetUpdate?: (targetId: string, updatedTarget: ProductionTarget) => void; // 目標更新回調函數
}

// 工單排程元件
const TicketScheduleComponent: React.FC<TicketScheduleProps> = ({ 
  selectedTarget, 
  onTicketSelect,
  onTargetUpdate
}) => {
  // 狀態管理
  const [schedules, setSchedules] = useState<TicketSchedule[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTodaySchedules, setShowTodaySchedules] = useState(false); // 是否顯示今日排程
  const [todaySchedules, setTodaySchedules] = useState<TicketScheduleWithRelations[]>([]); // 今日排程資料
  
  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TicketSchedule | null>(null);

  // 新增排程表單狀態
  const [newSchedule, setNewSchedule] = useState<CreateScheduleRequest>({
    ticketId: '',
    targetId: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'MEDIUM',
  });

  // 表單驗證錯誤狀態
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * 載入工單排程資料
   */
  const loadSchedules = useCallback(async () => {
    if (!selectedTarget) {
      setSchedules([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 載入指定目標的工單排程
      const scheduleResponse = await TargetService.getTargetSchedules(selectedTarget.id);
      
      if (scheduleResponse.success && scheduleResponse.data) {
        setSchedules(scheduleResponse.data);
      } else {
        setError(scheduleResponse.message || '載入工單排程失敗');
      }

      // 載入所有工單（用於新增排程時選擇）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入工單排程錯誤:', error);
      setError('載入工單排程失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [selectedTarget]);

  /**
   * 載入今日排程
   */
  const loadTodaySchedules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 取得今天的日期（格式: YYYY-MM-DD）
      const today = dayjs().format('YYYY-MM-DD');
      
      // 載入今日所有排程
      const response = await TargetService.getSchedulesByDate(today);
      
      if (response.success && response.data) {
        setTodaySchedules(response.data);
        setShowTodaySchedules(true);
      } else {
        setError(response.message || '載入今日排程失敗');
        setTodaySchedules([]);
      }

      // 載入所有工單（用於顯示工單名稱）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入今日排程錯誤:', error);
      setError('載入今日排程失敗，請稍後再試');
      setTodaySchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 切換顯示模式（今日排程 / 目標排程）
   */
  const handleToggleView = () => {
    if (showTodaySchedules) {
      // 切換回目標排程模式
      setShowTodaySchedules(false);
      if (selectedTarget) {
        loadSchedules();
      }
    } else {
      // 切換到今日排程模式
      loadTodaySchedules();
    }
  };

  /**
   * 處理新增排程
   */
  const handleCreateSchedule = async () => {
    // 表單驗證
    const errors: { [key: string]: string } = {};
    if (!newSchedule.ticketId) {
      errors.ticketId = '請選擇工單';
    }
    if (!newSchedule.scheduledDate) {
      errors.scheduledDate = '請選擇排程日期';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 確保資料格式符合後端 API 驗證規則
      const scheduleData: any = {
        ticketId: newSchedule.ticketId,
        targetId: selectedTarget!.id,
        scheduledDate: newSchedule.scheduledDate,
      };
      
      // 可選欄位
      if (newSchedule.scheduledTime) {
        scheduleData.scheduledTime = newSchedule.scheduledTime;
      }
      if (newSchedule.priority) {
        scheduleData.priority = newSchedule.priority;
      }
      
      // 調試：顯示要發送的資料
      console.log('準備建立排程資料:', scheduleData);
      console.log('可用工單列表:', tickets);
      console.log('原始 newSchedule:', newSchedule);
      
      const response = await TargetService.createSchedule(scheduleData);

      if (response.success && response.data) {
        setSchedules(prev => [...prev, response.data!]);
        
        // 如果目標狀態被自動更新為「進行中」，通知父組件
        if (response.data.target && response.data.target.status === TargetStatus.IN_PROGRESS && onTargetUpdate) {
          // 將 API 回應的 target 轉換為 ProductionTarget 類型
          const updatedTarget: ProductionTarget = {
            id: response.data.target.id,
            name: response.data.target.name,
            description: response.data.target.description,
            expectedCompletionDate: response.data.target.expectedCompletionDate,
            status: response.data.target.status,
            createdAt: response.data.target.createdAt,
            updatedAt: response.data.target.updatedAt,
          };
          onTargetUpdate(response.data.targetId, updatedTarget);
        }
        
        setCreateDialogOpen(false);
        setNewSchedule({
          ticketId: '',
          targetId: '',
          scheduledDate: '',
          scheduledTime: '',
          priority: 'MEDIUM',
        });
        setFormErrors({});
      } else {
        setError(response.message || '建立工單排程失敗');
      }
    } catch (error) {
      console.error('建立工單排程錯誤:', error);
      setError('建立工單排程失敗，請稍後再試');
    }
  };

  /**
   * 處理刪除排程
   * @param scheduleId 排程 ID
   */
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('確定要刪除這個工單排程嗎？')) {
      return;
    }

    try {
      const response = await TargetService.deleteSchedule(scheduleId);

      if (response.success) {
        if (showTodaySchedules) {
          // 更新今日排程列表
          setTodaySchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
        } else {
          // 更新目標排程列表
          setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
        }
      } else {
        setError(response.message || '刪除工單排程失敗');
      }
    } catch (error) {
      console.error('刪除工單排程錯誤:', error);
      setError('刪除工單排程失敗，請稍後再試');
    }
  };

  /**
   * 取得優先級顏色
   * @param priority 優先級
   */
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  /**
   * 取得優先級圖示
   * @param priority 優先級
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <HighPriorityIcon />;
      case 'MEDIUM':
        return <MediumPriorityIcon />;
      case 'LOW':
        return <LowPriorityIcon />;
      default:
        return <MediumPriorityIcon />;
    }
  };

  /**
   * 取得優先級文字
   * @param priority 優先級
   */
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return '未知';
    }
  };

  /**
   * 取得狀態顏色
   * @param status 狀態
   */
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CLOSED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * 取得狀態圖示
   * @param status 狀態
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ScheduleIcon />;
      case 'IN_PROGRESS':
        return <PlayArrowIcon />;
      case 'COMPLETED':
      case 'CLOSED':
        return <CheckCircleIcon />;
      case 'CANCELLED':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  /**
   * 取得狀態文字
   * @param status 狀態
   */
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return '待處理';
      case 'IN_PROGRESS':
        return '進行中';
      case 'COMPLETED':
        return '已完成';
      case 'CLOSED':
        return '已關閉';
      case 'CANCELLED':
        return '已取消';
      default:
        return '未知狀態';
    }
  };

  // 當選中目標變更時載入排程資料
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // 如果沒有選中目標，顯示提示訊息
  if (!selectedTarget) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            請選擇預生產目標
          </Typography>
          <Typography variant="body2" color="text.secondary">
            從左側列表選擇一個預生產目標，查看其工單排程
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 標題列 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                {showTodaySchedules ? '今日排程' : '工單排程'}
              </Typography>
              {showTodaySchedules && (
                <Typography variant="body2" color="text.secondary">
                  {dayjs().format('YYYY年MM月DD日')}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={showTodaySchedules ? "outlined" : "contained"}
                startIcon={<CalendarIcon />}
                onClick={handleToggleView}
                size="small"
              >
                今日排程
              </Button>
              {!showTodaySchedules && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  size="small"
                >
                  新增排程
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 載入中 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 排程列表 */}
        {!loading && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {showTodaySchedules ? (
              // 今日排程模式：按目標分組顯示
              todaySchedules.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    今日尚無排程
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs().format('YYYY年MM月DD日')} 沒有任何工單排程
                  </Typography>
                </Paper>
              ) : (
                // 按目標分組顯示今日排程
                (() => {
                  // 按目標 ID 分組
                  const groupedByTarget = todaySchedules.reduce((acc, schedule) => {
                    const targetId = schedule.targetId;
                    if (!acc[targetId]) {
                      acc[targetId] = {
                        target: schedule.target,
                        schedules: [],
                      };
                    }
                    acc[targetId].schedules.push(schedule);
                    return acc;
                  }, {} as Record<string, { target: any; schedules: TicketScheduleWithRelations[] }>);

                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {Object.values(groupedByTarget).map((group, index) => (
                        <Card key={group.target.id} sx={{ border: 1, borderColor: 'divider' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                              {group.target.name}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {group.schedules.map((schedule) => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                return (
                                  <Card 
                                    key={schedule.id}
                                    sx={{ 
                                      backgroundColor: 'background.paper',
                                      '&:hover': { 
                                        boxShadow: 2,
                                        cursor: 'pointer' 
                                      } 
                                    }}
                                    onClick={() => ticket && onTicketSelect(ticket)}
                                  >
                                    <CardContent>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" component="div">
                                              {ticket ? getTicketName(ticket.deviceId) : '未知工單'}
                                            </Typography>
                                            <Chip
                                              icon={getStatusIcon(schedule.status)}
                                              label={getStatusText(schedule.status)}
                                              color={getStatusColor(schedule.status)}
                                              size="small"
                                            />
                                            <Chip
                                              icon={getPriorityIcon(schedule.priority)}
                                              label={getPriorityText(schedule.priority)}
                                              color={getPriorityColor(schedule.priority)}
                                              size="small"
                                            />
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                              <CalendarIcon fontSize="small" color="action" />
                                              <Typography variant="body2" color="text.secondary">
                                                {schedule.scheduledDate}
                                              </Typography>
                                            </Box>
                                            {schedule.scheduledTime && (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <TimeIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                  {schedule.scheduledTime}
                                                </Typography>
                                              </Box>
                                            )}
                                          </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingSchedule(schedule);
                                              setEditDialogOpen(true);
                                            }}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSchedule(schedule.id);
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  );
                })()
              )
            ) : schedules.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  尚無工單排程
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  點擊「新增排程」按鈕為此目標安排工單
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  新增排程
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {schedules.map((schedule) => {
                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                  
                  return (
                    <Box key={schedule.id}>
                      <Card sx={{ 
                        '&:hover': { 
                          boxShadow: 3,
                          cursor: 'pointer' 
                        } 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="div">
                                  {(() => {
                                    const ticket = tickets.find(t => t.id === schedule.ticketId);
                                    return ticket ? getTicketName(ticket.deviceId) : '未知工單';
                                  })()}
                                </Typography>
                                <Chip
                                  icon={getStatusIcon(schedule.status)}
                                  label={getStatusText(schedule.status)}
                                  color={getStatusColor(schedule.status)}
                                  size="small"
                                />
                                <Chip
                                  icon={getPriorityIcon(schedule.priority)}
                                  label={getPriorityText(schedule.priority)}
                                  color={getPriorityColor(schedule.priority)}
                                  size="small"
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Station: {(() => {
                                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                                  return ticket ? getStationDisplay(ticket.deviceId) : '未知';
                                })()}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {dayjs(schedule.scheduledDate).format('YYYY-MM-DD')}
                                  </Typography>
                                </Box>
                                {schedule.scheduledTime && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {schedule.scheduledTime}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="查看詳情">
                                <IconButton
                                  size="small"
                                  onClick={() => ticket && onTicketSelect(ticket)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="編輯排程">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingSchedule(schedule);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              {/* 工單照片按鈕 - 只有AOI工單才顯示，包含上傳和查看功能 */}
                              {(() => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                // 只對AOI工單顯示相機圖示
                                return ticket && ticket.deviceId === 'AOI' ? (
                                  <Tooltip title={`${getTicketName(ticket.deviceId)}照片管理（上傳/查看）`}>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const photoUrl = `/ticket/${ticket.id}/photos`;
                                        window.open(photoUrl, '_blank');
                                      }}
                                      sx={{ color: 'primary.main' }}
                                    >
                                      <PhotoCamera />
                                    </IconButton>
                                  </Tooltip>
                                ) : null;
                              })()}
                              <Tooltip title="刪除排程">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* 新增排程對話框 */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>新增工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                select
                label="選擇工單"
                value={newSchedule.ticketId}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, ticketId: e.target.value }))}
                error={!!formErrors.ticketId}
                helperText={formErrors.ticketId}
                required
              >
                {tickets.map((ticket) => (
                  <MenuItem key={ticket.id} value={ticket.id}>
                    <Typography>
                      {getTicketName(ticket.deviceId)}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
              
              <DatePicker
                label="排程日期"
                value={newSchedule.scheduledDate ? dayjs(newSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.scheduledDate,
                    helperText: formErrors.scheduledDate,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={newSchedule.scheduledTime ? dayjs(newSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={newSchedule.priority}
                onChange={(e) => setNewSchedule(prev => ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }))}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSchedule} variant="contained">
              建立排程
            </Button>
          </DialogActions>
        </Dialog>

        {/* 編輯排程對話框 */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>編輯工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <DatePicker
                label="排程日期"
                value={editingSchedule?.scheduledDate ? dayjs(editingSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={editingSchedule?.scheduledTime ? dayjs(editingSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={editingSchedule?.priority || 'MEDIUM'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }) : null)}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="狀態"
                value={editingSchedule?.status || 'OPEN'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' 
                }) : null)}
              >
                <MenuItem value="OPEN">待處理</MenuItem>
                <MenuItem value="IN_PROGRESS">進行中</MenuItem>
                <MenuItem value="COMPLETED">已完成</MenuItem>
                <MenuItem value="CANCELLED">已取消</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={async () => {
                if (editingSchedule) {
                  // 確保資料格式符合後端 API 驗證規則
                  const updateData: any = {};
                  
                  // 日期格式：YYYY-MM-DD
                  if (editingSchedule.scheduledDate) {
                    updateData.scheduledDate = editingSchedule.scheduledDate;
                  }
                  
                  // 時間格式：HH:mm
                  if (editingSchedule.scheduledTime) {
                    updateData.scheduledTime = editingSchedule.scheduledTime;
                  }
                  
                  // 優先級：HIGH, MEDIUM, LOW
                  if (editingSchedule.priority) {
                    updateData.priority = editingSchedule.priority;
                  }
                  
                  // 狀態：OPEN, IN_PROGRESS, COMPLETED, CANCELLED
                  if (editingSchedule.status) {
                    updateData.status = editingSchedule.status;
                  }
                  
                  console.log('準備更新排程資料:', updateData);
                  
                  try {
                    const response = await TargetService.updateSchedule(editingSchedule.id, updateData);
                    
                    if (response.success && response.data) {
                      setSchedules(prev => prev.map(schedule => 
                        schedule.id === editingSchedule.id ? response.data! : schedule
                      ));
                      setEditDialogOpen(false);
                      setEditingSchedule(null);
                    } else {
                      setError(response.message || '更新工單排程失敗');
                    }
                  } catch (error) {
                    console.error('更新工單排程錯誤:', error);
                    setError('更新工單排程失敗，請稍後再試');
                  }
                }
              }} 
              variant="contained"
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketScheduleComponent;

```

更新新增排程函數，確保在新增今日排程後正確更新列表：


```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  PriorityHigh as HighPriorityIcon,
  Circle as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { ProductionTarget, TicketSchedule, TicketScheduleWithRelations, CreateScheduleRequest, UpdateScheduleRequest, TargetStatus } from '../types/target';
import { Ticket } from '../types/ticket';
import { TargetService } from '../services/targetApi';
import { TicketService } from '../services/api';
import { formatTicketDisplay, getStationDisplay, getTicketName } from '../utils/stationMapping';

// 工單排程元件屬性介面
interface TicketScheduleProps {
  selectedTarget: ProductionTarget | null; // 選中的預生產目標
  onTicketSelect: (ticket: Ticket) => void; // 工單選擇回調函數
  onTargetUpdate?: (targetId: string, updatedTarget: ProductionTarget) => void; // 目標更新回調函數
}

// 工單排程元件
const TicketScheduleComponent: React.FC<TicketScheduleProps> = ({ 
  selectedTarget, 
  onTicketSelect,
  onTargetUpdate
}) => {
  // 狀態管理
  const [schedules, setSchedules] = useState<TicketSchedule[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTodaySchedules, setShowTodaySchedules] = useState(false); // 是否顯示今日排程
  const [todaySchedules, setTodaySchedules] = useState<TicketScheduleWithRelations[]>([]); // 今日排程資料
  
  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TicketSchedule | null>(null);

  // 新增排程表單狀態
  const [newSchedule, setNewSchedule] = useState<CreateScheduleRequest>({
    ticketId: '',
    targetId: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'MEDIUM',
  });

  // 表單驗證錯誤狀態
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * 載入工單排程資料
   */
  const loadSchedules = useCallback(async () => {
    if (!selectedTarget) {
      setSchedules([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 載入指定目標的工單排程
      const scheduleResponse = await TargetService.getTargetSchedules(selectedTarget.id);
      
      if (scheduleResponse.success && scheduleResponse.data) {
        setSchedules(scheduleResponse.data);
      } else {
        setError(scheduleResponse.message || '載入工單排程失敗');
      }

      // 載入所有工單（用於新增排程時選擇）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入工單排程錯誤:', error);
      setError('載入工單排程失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [selectedTarget]);

  /**
   * 載入今日排程
   */
  const loadTodaySchedules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 取得今天的日期（格式: YYYY-MM-DD）
      const today = dayjs().format('YYYY-MM-DD');
      
      // 載入今日所有排程
      const response = await TargetService.getSchedulesByDate(today);
      
      if (response.success && response.data) {
        setTodaySchedules(response.data);
        setShowTodaySchedules(true);
      } else {
        setError(response.message || '載入今日排程失敗');
        setTodaySchedules([]);
      }

      // 載入所有工單（用於顯示工單名稱）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入今日排程錯誤:', error);
      setError('載入今日排程失敗，請稍後再試');
      setTodaySchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 切換顯示模式（今日排程 / 目標排程）
   */
  const handleToggleView = () => {
    if (showTodaySchedules) {
      // 切換回目標排程模式
      setShowTodaySchedules(false);
      if (selectedTarget) {
        loadSchedules();
      }
    } else {
      // 切換到今日排程模式
      loadTodaySchedules();
    }
  };

  /**
   * 處理新增排程
   */
  const handleCreateSchedule = async () => {
    // 表單驗證
    const errors: { [key: string]: string } = {};
    if (!newSchedule.ticketId) {
      errors.ticketId = '請選擇工單';
    }
    if (!newSchedule.scheduledDate) {
      errors.scheduledDate = '請選擇排程日期';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 確保資料格式符合後端 API 驗證規則
      const scheduleData: any = {
        ticketId: newSchedule.ticketId,
        targetId: selectedTarget!.id,
        scheduledDate: newSchedule.scheduledDate,
      };
      
      // 可選欄位
      if (newSchedule.scheduledTime) {
        scheduleData.scheduledTime = newSchedule.scheduledTime;
      }
      if (newSchedule.priority) {
        scheduleData.priority = newSchedule.priority;
      }
      
      // 調試：顯示要發送的資料
      console.log('準備建立排程資料:', scheduleData);
      console.log('可用工單列表:', tickets);
      console.log('原始 newSchedule:', newSchedule);
      
      const response = await TargetService.createSchedule(scheduleData);

      if (response.success && response.data) {
        setSchedules(prev => [...prev, response.data!]);
        
        // 如果新排程是今日的，且當前處於今日排程模式，更新今日排程列表
        const today = dayjs().format('YYYY-MM-DD');
        if (showTodaySchedules && response.data.scheduledDate === today) {
          setTodaySchedules(prev => [...prev, response.data!]);
        }
        
        // 如果目標狀態被自動更新為「進行中」，通知父組件
        if (response.data.target && response.data.target.status === TargetStatus.IN_PROGRESS && onTargetUpdate) {
          // 將 API 回應的 target 轉換為 ProductionTarget 類型
          const updatedTarget: ProductionTarget = {
            id: response.data.target.id,
            name: response.data.target.name,
            description: response.data.target.description,
            expectedCompletionDate: response.data.expectedCompletionDate,
            status: response.data.target.status,
            createdAt: response.data.target.createdAt,
            updatedAt: response.data.target.updatedAt,
          };
          onTargetUpdate(response.data.targetId, updatedTarget);
        }
        
        setCreateDialogOpen(false);
        setNewSchedule({
          ticketId: '',
          targetId: '',
          scheduledDate: '',
          scheduledTime: '',
          priority: 'MEDIUM',
        });
        setFormErrors({});
      } else {
        setError(response.message || '建立工單排程失敗');
      }
    } catch (error) {
      console.error('建立工單排程錯誤:', error);
      setError('建立工單排程失敗，請稍後再試');
    }
  };

  /**
   * 處理刪除排程
   * @param scheduleId 排程 ID
   */
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('確定要刪除這個工單排程嗎？')) {
      return;
    }

    try {
      const response = await TargetService.deleteSchedule(scheduleId);

      if (response.success) {
        if (showTodaySchedules) {
          // 更新今日排程列表
          setTodaySchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
        } else {
          // 更新目標排程列表
          setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
        }
      } else {
        setError(response.message || '刪除工單排程失敗');
      }
    } catch (error) {
      console.error('刪除工單排程錯誤:', error);
      setError('刪除工單排程失敗，請稍後再試');
    }
  };

  /**
   * 取得優先級顏色
   * @param priority 優先級
   */
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  /**
   * 取得優先級圖示
   * @param priority 優先級
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <HighPriorityIcon />;
      case 'MEDIUM':
        return <MediumPriorityIcon />;
      case 'LOW':
        return <LowPriorityIcon />;
      default:
        return <MediumPriorityIcon />;
    }
  };

  /**
   * 取得優先級文字
   * @param priority 優先級
   */
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return '未知';
    }
  };

  /**
   * 取得狀態顏色
   * @param status 狀態
   */
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CLOSED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * 取得狀態圖示
   * @param status 狀態
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ScheduleIcon />;
      case 'IN_PROGRESS':
        return <PlayArrowIcon />;
      case 'COMPLETED':
      case 'CLOSED':
        return <CheckCircleIcon />;
      case 'CANCELLED':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  /**
   * 取得狀態文字
   * @param status 狀態
   */
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return '待處理';
      case 'IN_PROGRESS':
        return '進行中';
      case 'COMPLETED':
        return '已完成';
      case 'CLOSED':
        return '已關閉';
      case 'CANCELLED':
        return '已取消';
      default:
        return '未知狀態';
    }
  };

  // 當選中目標變更時載入排程資料
  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  // 如果沒有選中目標，顯示提示訊息
  if (!selectedTarget) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            請選擇預生產目標
          </Typography>
          <Typography variant="body2" color="text.secondary">
            從左側列表選擇一個預生產目標，查看其工單排程
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 標題列 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                {showTodaySchedules ? '今日排程' : '工單排程'}
              </Typography>
              {showTodaySchedules && (
                <Typography variant="body2" color="text.secondary">
                  {dayjs().format('YYYY年MM月DD日')}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={showTodaySchedules ? "outlined" : "contained"}
                startIcon={<CalendarIcon />}
                onClick={handleToggleView}
                size="small"
              >
                今日排程
              </Button>
              {!showTodaySchedules && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  size="small"
                >
                  新增排程
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 載入中 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 排程列表 */}
        {!loading && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {showTodaySchedules ? (
              // 今日排程模式：按目標分組顯示
              todaySchedules.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    今日尚無排程
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs().format('YYYY年MM月DD日')} 沒有任何工單排程
                  </Typography>
                </Paper>
              ) : (
                // 按目標分組顯示今日排程
                (() => {
                  // 按目標 ID 分組
                  const groupedByTarget = todaySchedules.reduce((acc, schedule) => {
                    const targetId = schedule.targetId;
                    if (!acc[targetId]) {
                      acc[targetId] = {
                        target: schedule.target,
                        schedules: [],
                      };
                    }
                    acc[targetId].schedules.push(schedule);
                    return acc;
                  }, {} as Record<string, { target: any; schedules: TicketScheduleWithRelations[] }>);

                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {Object.values(groupedByTarget).map((group, index) => (
                        <Card key={group.target.id} sx={{ border: 1, borderColor: 'divider' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                              {group.target.name}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {group.schedules.map((schedule) => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                return (
                                  <Card 
                                    key={schedule.id}
                                    sx={{ 
                                      backgroundColor: 'background.paper',
                                      '&:hover': { 
                                        boxShadow: 2,
                                        cursor: 'pointer' 
                                      } 
                                    }}
                                    onClick={() => ticket && onTicketSelect(ticket)}
                                  >
                                    <CardContent>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" component="div">
                                              {ticket ? getTicketName(ticket.deviceId) : '未知工單'}
                                            </Typography>
                                            <Chip
                                              icon={getStatusIcon(schedule.status)}
                                              label={getStatusText(schedule.status)}
                                              color={getStatusColor(schedule.status)}
                                              size="small"
                                            />
                                            <Chip
                                              icon={getPriorityIcon(schedule.priority)}
                                              label={getPriorityText(schedule.priority)}
                                              color={getPriorityColor(schedule.priority)}
                                              size="small"
                                            />
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                              <CalendarIcon fontSize="small" color="action" />
                                              <Typography variant="body2" color="text.secondary">
                                                {schedule.scheduledDate}
                                              </Typography>
                                            </Box>
                                            {schedule.scheduledTime && (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <TimeIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                  {schedule.scheduledTime}
                                                </Typography>
                                              </Box>
                                            )}
                                          </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingSchedule(schedule);
                                              setEditDialogOpen(true);
                                            }}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSchedule(schedule.id);
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  );
                })()
              )
            ) : schedules.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  尚無工單排程
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  點擊「新增排程」按鈕為此目標安排工單
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  新增排程
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {schedules.map((schedule) => {
                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                  
                  return (
                    <Box key={schedule.id}>
                      <Card sx={{ 
                        '&:hover': { 
                          boxShadow: 3,
                          cursor: 'pointer' 
                        } 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="div">
                                  {(() => {
                                    const ticket = tickets.find(t => t.id === schedule.ticketId);
                                    return ticket ? getTicketName(ticket.deviceId) : '未知工單';
                                  })()}
                                </Typography>
                                <Chip
                                  icon={getStatusIcon(schedule.status)}
                                  label={getStatusText(schedule.status)}
                                  color={getStatusColor(schedule.status)}
                                  size="small"
                                />
                                <Chip
                                  icon={getPriorityIcon(schedule.priority)}
                                  label={getPriorityText(schedule.priority)}
                                  color={getPriorityColor(schedule.priority)}
                                  size="small"
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Station: {(() => {
                                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                                  return ticket ? getStationDisplay(ticket.deviceId) : '未知';
                                })()}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {dayjs(schedule.scheduledDate).format('YYYY-MM-DD')}
                                  </Typography>
                                </Box>
                                {schedule.scheduledTime && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {schedule.scheduledTime}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="查看詳情">
                                <IconButton
                                  size="small"
                                  onClick={() => ticket && onTicketSelect(ticket)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="編輯排程">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingSchedule(schedule);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              {/* 工單照片按鈕 - 只有AOI工單才顯示，包含上傳和查看功能 */}
                              {(() => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                // 只對AOI工單顯示相機圖示
                                return ticket && ticket.deviceId === 'AOI' ? (
                                  <Tooltip title={`${getTicketName(ticket.deviceId)}照片管理（上傳/查看）`}>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const photoUrl = `/ticket/${ticket.id}/photos`;
                                        window.open(photoUrl, '_blank');
                                      }}
                                      sx={{ color: 'primary.main' }}
                                    >
                                      <PhotoCamera />
                                    </IconButton>
                                  </Tooltip>
                                ) : null;
                              })()}
                              <Tooltip title="刪除排程">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* 新增排程對話框 */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>新增工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                select
                label="選擇工單"
                value={newSchedule.ticketId}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, ticketId: e.target.value }))}
                error={!!formErrors.ticketId}
                helperText={formErrors.ticketId}
                required
              >
                {tickets.map((ticket) => (
                  <MenuItem key={ticket.id} value={ticket.id}>
                    <Typography>
                      {getTicketName(ticket.deviceId)}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
              
              <DatePicker
                label="排程日期"
                value={newSchedule.scheduledDate ? dayjs(newSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.scheduledDate,
                    helperText: formErrors.scheduledDate,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={newSchedule.scheduledTime ? dayjs(newSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={newSchedule.priority}
                onChange={(e) => setNewSchedule(prev => ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }))}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSchedule} variant="contained">
              建立排程
            </Button>
          </DialogActions>
        </Dialog>

        {/* 編輯排程對話框 */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>編輯工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <DatePicker
                label="排程日期"
                value={editingSchedule?.scheduledDate ? dayjs(editingSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={editingSchedule?.scheduledTime ? dayjs(editingSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={editingSchedule?.priority || 'MEDIUM'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }) : null)}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="狀態"
                value={editingSchedule?.status || 'OPEN'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' 
                }) : null)}
              >
                <MenuItem value="OPEN">待處理</MenuItem>
                <MenuItem value="IN_PROGRESS">進行中</MenuItem>
                <MenuItem value="COMPLETED">已完成</MenuItem>
                <MenuItem value="CANCELLED">已取消</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={async () => {
                if (editingSchedule) {
                  // 確保資料格式符合後端 API 驗證規則
                  const updateData: any = {};
                  
                  // 日期格式：YYYY-MM-DD
                  if (editingSchedule.scheduledDate) {
                    updateData.scheduledDate = editingSchedule.scheduledDate;
                  }
                  
                  // 時間格式：HH:mm
                  if (editingSchedule.scheduledTime) {
                    updateData.scheduledTime = editingSchedule.scheduledTime;
                  }
                  
                  // 優先級：HIGH, MEDIUM, LOW
                  if (editingSchedule.priority) {
                    updateData.priority = editingSchedule.priority;
                  }
                  
                  // 狀態：OPEN, IN_PROGRESS, COMPLETED, CANCELLED
                  if (editingSchedule.status) {
                    updateData.status = editingSchedule.status;
                  }
                  
                  console.log('準備更新排程資料:', updateData);
                  
                  try {
                    const response = await TargetService.updateSchedule(editingSchedule.id, updateData);
                    
                    if (response.success && response.data) {
                      setSchedules(prev => prev.map(schedule => 
                        schedule.id === editingSchedule.id ? response.data! : schedule
                      ));
                      setEditDialogOpen(false);
                      setEditingSchedule(null);
                    } else {
                      setError(response.message || '更新工單排程失敗');
                    }
                  } catch (error) {
                    console.error('更新工單排程錯誤:', error);
                    setError('更新工單排程失敗，請稍後再試');
                  }
                }
              }} 
              variant="contained"
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketScheduleComponent;

```

檢查並更新 useEffect，確保在目標改變時正確處理：


更新 useEffect，確保在目標改變時正確處理，並檢查語法錯誤：


```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  PriorityHigh as HighPriorityIcon,
  Circle as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { ProductionTarget, TicketSchedule, TicketScheduleWithRelations, CreateScheduleRequest, UpdateScheduleRequest, TargetStatus } from '../types/target';
import { Ticket } from '../types/ticket';
import { TargetService } from '../services/targetApi';
import { TicketService } from '../services/api';
import { formatTicketDisplay, getStationDisplay, getTicketName } from '../utils/stationMapping';

// 工單排程元件屬性介面
interface TicketScheduleProps {
  selectedTarget: ProductionTarget | null; // 選中的預生產目標
  onTicketSelect: (ticket: Ticket) => void; // 工單選擇回調函數
  onTargetUpdate?: (targetId: string, updatedTarget: ProductionTarget) => void; // 目標更新回調函數
}

// 工單排程元件
const TicketScheduleComponent: React.FC<TicketScheduleProps> = ({ 
  selectedTarget, 
  onTicketSelect,
  onTargetUpdate
}) => {
  // 狀態管理
  const [schedules, setSchedules] = useState<TicketSchedule[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTodaySchedules, setShowTodaySchedules] = useState(false); // 是否顯示今日排程
  const [todaySchedules, setTodaySchedules] = useState<TicketScheduleWithRelations[]>([]); // 今日排程資料
  
  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TicketSchedule | null>(null);

  // 新增排程表單狀態
  const [newSchedule, setNewSchedule] = useState<CreateScheduleRequest>({
    ticketId: '',
    targetId: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'MEDIUM',
  });

  // 表單驗證錯誤狀態
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * 載入工單排程資料
   */
  const loadSchedules = useCallback(async () => {
    if (!selectedTarget) {
      setSchedules([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 載入指定目標的工單排程
      const scheduleResponse = await TargetService.getTargetSchedules(selectedTarget.id);
      
      if (scheduleResponse.success && scheduleResponse.data) {
        setSchedules(scheduleResponse.data);
      } else {
        setError(scheduleResponse.message || '載入工單排程失敗');
      }

      // 載入所有工單（用於新增排程時選擇）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入工單排程錯誤:', error);
      setError('載入工單排程失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [selectedTarget]);

  /**
   * 載入今日排程
   */
  const loadTodaySchedules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 取得今天的日期（格式: YYYY-MM-DD）
      const today = dayjs().format('YYYY-MM-DD');
      
      // 載入今日所有排程
      const response = await TargetService.getSchedulesByDate(today);
      
      if (response.success && response.data) {
        setTodaySchedules(response.data);
        setShowTodaySchedules(true);
      } else {
        setError(response.message || '載入今日排程失敗');
        setTodaySchedules([]);
      }

      // 載入所有工單（用於顯示工單名稱）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入今日排程錯誤:', error);
      setError('載入今日排程失敗，請稍後再試');
      setTodaySchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 切換顯示模式（今日排程 / 目標排程）
   */
  const handleToggleView = () => {
    if (showTodaySchedules) {
      // 切換回目標排程模式
      setShowTodaySchedules(false);
      if (selectedTarget) {
        loadSchedules();
      }
    } else {
      // 切換到今日排程模式
      loadTodaySchedules();
    }
  };

  /**
   * 處理新增排程
   */
  const handleCreateSchedule = async () => {
    // 表單驗證
    const errors: { [key: string]: string } = {};
    if (!newSchedule.ticketId) {
      errors.ticketId = '請選擇工單';
    }
    if (!newSchedule.scheduledDate) {
      errors.scheduledDate = '請選擇排程日期';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 確保資料格式符合後端 API 驗證規則
      const scheduleData: any = {
        ticketId: newSchedule.ticketId,
        targetId: selectedTarget!.id,
        scheduledDate: newSchedule.scheduledDate,
      };
      
      // 可選欄位
      if (newSchedule.scheduledTime) {
        scheduleData.scheduledTime = newSchedule.scheduledTime;
      }
      if (newSchedule.priority) {
        scheduleData.priority = newSchedule.priority;
      }
      
      // 調試：顯示要發送的資料
      console.log('準備建立排程資料:', scheduleData);
      console.log('可用工單列表:', tickets);
      console.log('原始 newSchedule:', newSchedule);
      
      const response = await TargetService.createSchedule(scheduleData);

      if (response.success && response.data) {
        setSchedules(prev => [...prev, response.data!]);
        
        // 如果新排程是今日的，且當前處於今日排程模式，更新今日排程列表
        const today = dayjs().format('YYYY-MM-DD');
        if (showTodaySchedules && response.data.scheduledDate === today) {
          setTodaySchedules(prev => [...prev, response.data!]);
        }
        
        // 如果目標狀態被自動更新為「進行中」，通知父組件
        if (response.data.target && response.data.target.status === TargetStatus.IN_PROGRESS && onTargetUpdate) {
          // 將 API 回應的 target 轉換為 ProductionTarget 類型
          const updatedTarget: ProductionTarget = {
            id: response.data.target.id,
            name: response.data.target.name,
            description: response.data.target.description,
            expectedCompletionDate: response.data.expectedCompletionDate,
            status: response.data.target.status,
            createdAt: response.data.target.createdAt,
            updatedAt: response.data.target.updatedAt,
          };
          onTargetUpdate(response.data.targetId, updatedTarget);
        }
        
        setCreateDialogOpen(false);
        setNewSchedule({
          ticketId: '',
          targetId: '',
          scheduledDate: '',
          scheduledTime: '',
          priority: 'MEDIUM',
        });
        setFormErrors({});
      } else {
        setError(response.message || '建立工單排程失敗');
      }
    } catch (error) {
      console.error('建立工單排程錯誤:', error);
      setError('建立工單排程失敗，請稍後再試');
    }
  };

  /**
   * 處理刪除排程
   * @param scheduleId 排程 ID
   */
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('確定要刪除這個工單排程嗎？')) {
      return;
    }

    try {
      const response = await TargetService.deleteSchedule(scheduleId);

      if (response.success) {
        if (showTodaySchedules) {
          // 更新今日排程列表
          setTodaySchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
        } else {
          // 更新目標排程列表
          setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
        }
      } else {
        setError(response.message || '刪除工單排程失敗');
      }
    } catch (error) {
      console.error('刪除工單排程錯誤:', error);
      setError('刪除工單排程失敗，請稍後再試');
    }
  };

  /**
   * 取得優先級顏色
   * @param priority 優先級
   */
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  /**
   * 取得優先級圖示
   * @param priority 優先級
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <HighPriorityIcon />;
      case 'MEDIUM':
        return <MediumPriorityIcon />;
      case 'LOW':
        return <LowPriorityIcon />;
      default:
        return <MediumPriorityIcon />;
    }
  };

  /**
   * 取得優先級文字
   * @param priority 優先級
   */
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return '未知';
    }
  };

  /**
   * 取得狀態顏色
   * @param status 狀態
   */
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CLOSED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * 取得狀態圖示
   * @param status 狀態
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ScheduleIcon />;
      case 'IN_PROGRESS':
        return <PlayArrowIcon />;
      case 'COMPLETED':
      case 'CLOSED':
        return <CheckCircleIcon />;
      case 'CANCELLED':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  /**
   * 取得狀態文字
   * @param status 狀態
   */
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return '待處理';
      case 'IN_PROGRESS':
        return '進行中';
      case 'COMPLETED':
        return '已完成';
      case 'CLOSED':
        return '已關閉';
      case 'CANCELLED':
        return '已取消';
      default:
        return '未知狀態';
    }
  };

  // 當選中目標變更時載入排程資料（僅在非今日排程模式下）
  useEffect(() => {
    if (!showTodaySchedules && selectedTarget) {
      loadSchedules();
    }
  }, [selectedTarget, showTodaySchedules, loadSchedules]);
  
  // 當切換回目標排程模式時，重置今日排程狀態
  useEffect(() => {
    if (!showTodaySchedules) {
      setTodaySchedules([]);
    }
  }, [showTodaySchedules]);

  // 如果沒有選中目標，顯示提示訊息
  if (!selectedTarget) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            請選擇預生產目標
          </Typography>
          <Typography variant="body2" color="text.secondary">
            從左側列表選擇一個預生產目標，查看其工單排程
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 標題列 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                {showTodaySchedules ? '今日排程' : '工單排程'}
              </Typography>
              {showTodaySchedules && (
                <Typography variant="body2" color="text.secondary">
                  {dayjs().format('YYYY年MM月DD日')}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={showTodaySchedules ? "outlined" : "contained"}
                startIcon={<CalendarIcon />}
                onClick={handleToggleView}
                size="small"
              >
                今日排程
              </Button>
              {!showTodaySchedules && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  size="small"
                >
                  新增排程
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 載入中 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 排程列表 */}
        {!loading && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {showTodaySchedules ? (
              // 今日排程模式：按目標分組顯示
              todaySchedules.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    今日尚無排程
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs().format('YYYY年MM月DD日')} 沒有任何工單排程
                  </Typography>
                </Paper>
              ) : (
                // 按目標分組顯示今日排程
                (() => {
                  // 按目標 ID 分組
                  const groupedByTarget = todaySchedules.reduce((acc, schedule) => {
                    const targetId = schedule.targetId;
                    if (!acc[targetId]) {
                      acc[targetId] = {
                        target: schedule.target,
                        schedules: [],
                      };
                    }
                    acc[targetId].schedules.push(schedule);
                    return acc;
                  }, {} as Record<string, { target: any; schedules: TicketScheduleWithRelations[] }>);

                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {Object.values(groupedByTarget).map((group, index) => (
                        <Card key={group.target.id} sx={{ border: 1, borderColor: 'divider' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                              {group.target.name}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {group.schedules.map((schedule) => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                return (
                                  <Card 
                                    key={schedule.id}
                                    sx={{ 
                                      backgroundColor: 'background.paper',
                                      '&:hover': { 
                                        boxShadow: 2,
                                        cursor: 'pointer' 
                                      } 
                                    }}
                                    onClick={() => ticket && onTicketSelect(ticket)}
                                  >
                                    <CardContent>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" component="div">
                                              {ticket ? getTicketName(ticket.deviceId) : '未知工單'}
                                            </Typography>
                                            <Chip
                                              icon={getStatusIcon(schedule.status)}
                                              label={getStatusText(schedule.status)}
                                              color={getStatusColor(schedule.status)}
                                              size="small"
                                            />
                                            <Chip
                                              icon={getPriorityIcon(schedule.priority)}
                                              label={getPriorityText(schedule.priority)}
                                              color={getPriorityColor(schedule.priority)}
                                              size="small"
                                            />
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                              <CalendarIcon fontSize="small" color="action" />
                                              <Typography variant="body2" color="text.secondary">
                                                {schedule.scheduledDate}
                                              </Typography>
                                            </Box>
                                            {schedule.scheduledTime && (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <TimeIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                  {schedule.scheduledTime}
                                                </Typography>
                                              </Box>
                                            )}
                                          </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingSchedule(schedule);
                                              setEditDialogOpen(true);
                                            }}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSchedule(schedule.id);
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  );
                })()
              )
            ) : schedules.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  尚無工單排程
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  點擊「新增排程」按鈕為此目標安排工單
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  新增排程
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {schedules.map((schedule) => {
                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                  
                  return (
                    <Box key={schedule.id}>
                      <Card sx={{ 
                        '&:hover': { 
                          boxShadow: 3,
                          cursor: 'pointer' 
                        } 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="div">
                                  {(() => {
                                    const ticket = tickets.find(t => t.id === schedule.ticketId);
                                    return ticket ? getTicketName(ticket.deviceId) : '未知工單';
                                  })()}
                                </Typography>
                                <Chip
                                  icon={getStatusIcon(schedule.status)}
                                  label={getStatusText(schedule.status)}
                                  color={getStatusColor(schedule.status)}
                                  size="small"
                                />
                                <Chip
                                  icon={getPriorityIcon(schedule.priority)}
                                  label={getPriorityText(schedule.priority)}
                                  color={getPriorityColor(schedule.priority)}
                                  size="small"
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Station: {(() => {
                                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                                  return ticket ? getStationDisplay(ticket.deviceId) : '未知';
                                })()}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {dayjs(schedule.scheduledDate).format('YYYY-MM-DD')}
                                  </Typography>
                                </Box>
                                {schedule.scheduledTime && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {schedule.scheduledTime}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="查看詳情">
                                <IconButton
                                  size="small"
                                  onClick={() => ticket && onTicketSelect(ticket)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="編輯排程">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingSchedule(schedule);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              {/* 工單照片按鈕 - 只有AOI工單才顯示，包含上傳和查看功能 */}
                              {(() => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                // 只對AOI工單顯示相機圖示
                                return ticket && ticket.deviceId === 'AOI' ? (
                                  <Tooltip title={`${getTicketName(ticket.deviceId)}照片管理（上傳/查看）`}>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const photoUrl = `/ticket/${ticket.id}/photos`;
                                        window.open(photoUrl, '_blank');
                                      }}
                                      sx={{ color: 'primary.main' }}
                                    >
                                      <PhotoCamera />
                                    </IconButton>
                                  </Tooltip>
                                ) : null;
                              })()}
                              <Tooltip title="刪除排程">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* 新增排程對話框 */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>新增工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                select
                label="選擇工單"
                value={newSchedule.ticketId}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, ticketId: e.target.value }))}
                error={!!formErrors.ticketId}
                helperText={formErrors.ticketId}
                required
              >
                {tickets.map((ticket) => (
                  <MenuItem key={ticket.id} value={ticket.id}>
                    <Typography>
                      {getTicketName(ticket.deviceId)}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
              
              <DatePicker
                label="排程日期"
                value={newSchedule.scheduledDate ? dayjs(newSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.scheduledDate,
                    helperText: formErrors.scheduledDate,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={newSchedule.scheduledTime ? dayjs(newSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={newSchedule.priority}
                onChange={(e) => setNewSchedule(prev => ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }))}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSchedule} variant="contained">
              建立排程
            </Button>
          </DialogActions>
        </Dialog>

        {/* 編輯排程對話框 */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>編輯工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <DatePicker
                label="排程日期"
                value={editingSchedule?.scheduledDate ? dayjs(editingSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={editingSchedule?.scheduledTime ? dayjs(editingSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={editingSchedule?.priority || 'MEDIUM'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }) : null)}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="狀態"
                value={editingSchedule?.status || 'OPEN'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' 
                }) : null)}
              >
                <MenuItem value="OPEN">待處理</MenuItem>
                <MenuItem value="IN_PROGRESS">進行中</MenuItem>
                <MenuItem value="COMPLETED">已完成</MenuItem>
                <MenuItem value="CANCELLED">已取消</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={async () => {
                if (editingSchedule) {
                  // 確保資料格式符合後端 API 驗證規則
                  const updateData: any = {};
                  
                  // 日期格式：YYYY-MM-DD
                  if (editingSchedule.scheduledDate) {
                    updateData.scheduledDate = editingSchedule.scheduledDate;
                  }
                  
                  // 時間格式：HH:mm
                  if (editingSchedule.scheduledTime) {
                    updateData.scheduledTime = editingSchedule.scheduledTime;
                  }
                  
                  // 優先級：HIGH, MEDIUM, LOW
                  if (editingSchedule.priority) {
                    updateData.priority = editingSchedule.priority;
                  }
                  
                  // 狀態：OPEN, IN_PROGRESS, COMPLETED, CANCELLED
                  if (editingSchedule.status) {
                    updateData.status = editingSchedule.status;
                  }
                  
                  console.log('準備更新排程資料:', updateData);
                  
                  try {
                    const response = await TargetService.updateSchedule(editingSchedule.id, updateData);
                    
                    if (response.success && response.data) {
                      setSchedules(prev => prev.map(schedule => 
                        schedule.id === editingSchedule.id ? response.data! : schedule
                      ));
                      setEditDialogOpen(false);
                      setEditingSchedule(null);
                    } else {
                      setError(response.message || '更新工單排程失敗');
                    }
                  } catch (error) {
                    console.error('更新工單排程錯誤:', error);
                    setError('更新工單排程失敗，請稍後再試');
                  }
                }
              }} 
              variant="contained"
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketScheduleComponent;

```

修正類型錯誤：


```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  PriorityHigh as HighPriorityIcon,
  Circle as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { ProductionTarget, TicketSchedule, TicketScheduleWithRelations, CreateScheduleRequest, UpdateScheduleRequest, TargetStatus } from '../types/target';
import { Ticket } from '../types/ticket';
import { TargetService } from '../services/targetApi';
import { TicketService } from '../services/api';
import { formatTicketDisplay, getStationDisplay, getTicketName } from '../utils/stationMapping';

// 工單排程元件屬性介面
interface TicketScheduleProps {
  selectedTarget: ProductionTarget | null; // 選中的預生產目標
  onTicketSelect: (ticket: Ticket) => void; // 工單選擇回調函數
  onTargetUpdate?: (targetId: string, updatedTarget: ProductionTarget) => void; // 目標更新回調函數
}

// 工單排程元件
const TicketScheduleComponent: React.FC<TicketScheduleProps> = ({ 
  selectedTarget, 
  onTicketSelect,
  onTargetUpdate
}) => {
  // 狀態管理
  const [schedules, setSchedules] = useState<TicketSchedule[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTodaySchedules, setShowTodaySchedules] = useState(false); // 是否顯示今日排程
  const [todaySchedules, setTodaySchedules] = useState<TicketScheduleWithRelations[]>([]); // 今日排程資料
  
  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TicketSchedule | null>(null);

  // 新增排程表單狀態
  const [newSchedule, setNewSchedule] = useState<CreateScheduleRequest>({
    ticketId: '',
    targetId: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'MEDIUM',
  });

  // 表單驗證錯誤狀態
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * 載入工單排程資料
   */
  const loadSchedules = useCallback(async () => {
    if (!selectedTarget) {
      setSchedules([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 載入指定目標的工單排程
      const scheduleResponse = await TargetService.getTargetSchedules(selectedTarget.id);
      
      if (scheduleResponse.success && scheduleResponse.data) {
        setSchedules(scheduleResponse.data);
      } else {
        setError(scheduleResponse.message || '載入工單排程失敗');
      }

      // 載入所有工單（用於新增排程時選擇）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入工單排程錯誤:', error);
      setError('載入工單排程失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [selectedTarget]);

  /**
   * 載入今日排程
   */
  const loadTodaySchedules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 取得今天的日期（格式: YYYY-MM-DD）
      const today = dayjs().format('YYYY-MM-DD');
      
      // 載入今日所有排程
      const response = await TargetService.getSchedulesByDate(today);
      
      if (response.success && response.data) {
        setTodaySchedules(response.data);
        setShowTodaySchedules(true);
      } else {
        setError(response.message || '載入今日排程失敗');
        setTodaySchedules([]);
      }

      // 載入所有工單（用於顯示工單名稱）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入今日排程錯誤:', error);
      setError('載入今日排程失敗，請稍後再試');
      setTodaySchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 切換顯示模式（今日排程 / 目標排程）
   */
  const handleToggleView = () => {
    if (showTodaySchedules) {
      // 切換回目標排程模式
      setShowTodaySchedules(false);
      if (selectedTarget) {
        loadSchedules();
      }
    } else {
      // 切換到今日排程模式
      loadTodaySchedules();
    }
  };

  /**
   * 處理新增排程
   */
  const handleCreateSchedule = async () => {
    // 表單驗證
    const errors: { [key: string]: string } = {};
    if (!newSchedule.ticketId) {
      errors.ticketId = '請選擇工單';
    }
    if (!newSchedule.scheduledDate) {
      errors.scheduledDate = '請選擇排程日期';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 確保資料格式符合後端 API 驗證規則
      const scheduleData: any = {
        ticketId: newSchedule.ticketId,
        targetId: selectedTarget!.id,
        scheduledDate: newSchedule.scheduledDate,
      };
      
      // 可選欄位
      if (newSchedule.scheduledTime) {
        scheduleData.scheduledTime = newSchedule.scheduledTime;
      }
      if (newSchedule.priority) {
        scheduleData.priority = newSchedule.priority;
      }
      
      // 調試：顯示要發送的資料
      console.log('準備建立排程資料:', scheduleData);
      console.log('可用工單列表:', tickets);
      console.log('原始 newSchedule:', newSchedule);
      
      const response = await TargetService.createSchedule(scheduleData);

      if (response.success && response.data) {
        setSchedules(prev => [...prev, response.data!]);
        
        // 如果新排程是今日的，且當前處於今日排程模式，更新今日排程列表
        const today = dayjs().format('YYYY-MM-DD');
        if (showTodaySchedules && response.data.scheduledDate === today) {
          setTodaySchedules(prev => [...prev, response.data!]);
        }
        
        // 如果目標狀態被自動更新為「進行中」，通知父組件
        if (response.data.target && response.data.target.status === TargetStatus.IN_PROGRESS && onTargetUpdate) {
          // 將 API 回應的 target 轉換為 ProductionTarget 類型
          const updatedTarget: ProductionTarget = {
            id: response.data.target.id,
            name: response.data.target.name,
            description: response.data.target.description,
            expectedCompletionDate: response.data.target.expectedCompletionDate,
            status: response.data.target.status,
            createdAt: response.data.target.createdAt,
            updatedAt: response.data.target.updatedAt,
          };
          onTargetUpdate(response.data.targetId, updatedTarget);
        }
        
        setCreateDialogOpen(false);
        setNewSchedule({
          ticketId: '',
          targetId: '',
          scheduledDate: '',
          scheduledTime: '',
          priority: 'MEDIUM',
        });
        setFormErrors({});
      } else {
        setError(response.message || '建立工單排程失敗');
      }
    } catch (error) {
      console.error('建立工單排程錯誤:', error);
      setError('建立工單排程失敗，請稍後再試');
    }
  };

  /**
   * 處理刪除排程
   * @param scheduleId 排程 ID
   */
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('確定要刪除這個工單排程嗎？')) {
      return;
    }

    try {
      const response = await TargetService.deleteSchedule(scheduleId);

      if (response.success) {
        if (showTodaySchedules) {
          // 更新今日排程列表
          setTodaySchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
        } else {
          // 更新目標排程列表
          setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
        }
      } else {
        setError(response.message || '刪除工單排程失敗');
      }
    } catch (error) {
      console.error('刪除工單排程錯誤:', error);
      setError('刪除工單排程失敗，請稍後再試');
    }
  };

  /**
   * 取得優先級顏色
   * @param priority 優先級
   */
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  /**
   * 取得優先級圖示
   * @param priority 優先級
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <HighPriorityIcon />;
      case 'MEDIUM':
        return <MediumPriorityIcon />;
      case 'LOW':
        return <LowPriorityIcon />;
      default:
        return <MediumPriorityIcon />;
    }
  };

  /**
   * 取得優先級文字
   * @param priority 優先級
   */
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return '未知';
    }
  };

  /**
   * 取得狀態顏色
   * @param status 狀態
   */
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CLOSED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * 取得狀態圖示
   * @param status 狀態
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ScheduleIcon />;
      case 'IN_PROGRESS':
        return <PlayArrowIcon />;
      case 'COMPLETED':
      case 'CLOSED':
        return <CheckCircleIcon />;
      case 'CANCELLED':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  /**
   * 取得狀態文字
   * @param status 狀態
   */
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return '待處理';
      case 'IN_PROGRESS':
        return '進行中';
      case 'COMPLETED':
        return '已完成';
      case 'CLOSED':
        return '已關閉';
      case 'CANCELLED':
        return '已取消';
      default:
        return '未知狀態';
    }
  };

  // 當選中目標變更時載入排程資料（僅在非今日排程模式下）
  useEffect(() => {
    if (!showTodaySchedules && selectedTarget) {
      loadSchedules();
    }
  }, [selectedTarget, showTodaySchedules, loadSchedules]);
  
  // 當切換回目標排程模式時，重置今日排程狀態
  useEffect(() => {
    if (!showTodaySchedules) {
      setTodaySchedules([]);
    }
  }, [showTodaySchedules]);

  // 如果沒有選中目標，顯示提示訊息
  if (!selectedTarget) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            請選擇預生產目標
          </Typography>
          <Typography variant="body2" color="text.secondary">
            從左側列表選擇一個預生產目標，查看其工單排程
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 標題列 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                {showTodaySchedules ? '今日排程' : '工單排程'}
              </Typography>
              {showTodaySchedules && (
                <Typography variant="body2" color="text.secondary">
                  {dayjs().format('YYYY年MM月DD日')}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={showTodaySchedules ? "outlined" : "contained"}
                startIcon={<CalendarIcon />}
                onClick={handleToggleView}
                size="small"
              >
                今日排程
              </Button>
              {!showTodaySchedules && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  size="small"
                >
                  新增排程
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 載入中 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 排程列表 */}
        {!loading && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {showTodaySchedules ? (
              // 今日排程模式：按目標分組顯示
              todaySchedules.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    今日尚無排程
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs().format('YYYY年MM月DD日')} 沒有任何工單排程
                  </Typography>
                </Paper>
              ) : (
                // 按目標分組顯示今日排程
                (() => {
                  // 按目標 ID 分組
                  const groupedByTarget = todaySchedules.reduce((acc, schedule) => {
                    const targetId = schedule.targetId;
                    if (!acc[targetId]) {
                      acc[targetId] = {
                        target: schedule.target,
                        schedules: [],
                      };
                    }
                    acc[targetId].schedules.push(schedule);
                    return acc;
                  }, {} as Record<string, { target: any; schedules: TicketScheduleWithRelations[] }>);

                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {Object.values(groupedByTarget).map((group, index) => (
                        <Card key={group.target.id} sx={{ border: 1, borderColor: 'divider' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                              {group.target.name}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {group.schedules.map((schedule) => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                return (
                                  <Card 
                                    key={schedule.id}
                                    sx={{ 
                                      backgroundColor: 'background.paper',
                                      '&:hover': { 
                                        boxShadow: 2,
                                        cursor: 'pointer' 
                                      } 
                                    }}
                                    onClick={() => ticket && onTicketSelect(ticket)}
                                  >
                                    <CardContent>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" component="div">
                                              {ticket ? getTicketName(ticket.deviceId) : '未知工單'}
                                            </Typography>
                                            <Chip
                                              icon={getStatusIcon(schedule.status)}
                                              label={getStatusText(schedule.status)}
                                              color={getStatusColor(schedule.status)}
                                              size="small"
                                            />
                                            <Chip
                                              icon={getPriorityIcon(schedule.priority)}
                                              label={getPriorityText(schedule.priority)}
                                              color={getPriorityColor(schedule.priority)}
                                              size="small"
                                            />
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                              <CalendarIcon fontSize="small" color="action" />
                                              <Typography variant="body2" color="text.secondary">
                                                {schedule.scheduledDate}
                                              </Typography>
                                            </Box>
                                            {schedule.scheduledTime && (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <TimeIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                  {schedule.scheduledTime}
                                                </Typography>
                                              </Box>
                                            )}
                                          </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingSchedule(schedule);
                                              setEditDialogOpen(true);
                                            }}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSchedule(schedule.id);
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  );
                })()
              )
            ) : schedules.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  尚無工單排程
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  點擊「新增排程」按鈕為此目標安排工單
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  新增排程
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {schedules.map((schedule) => {
                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                  
                  return (
                    <Box key={schedule.id}>
                      <Card sx={{ 
                        '&:hover': { 
                          boxShadow: 3,
                          cursor: 'pointer' 
                        } 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="div">
                                  {(() => {
                                    const ticket = tickets.find(t => t.id === schedule.ticketId);
                                    return ticket ? getTicketName(ticket.deviceId) : '未知工單';
                                  })()}
                                </Typography>
                                <Chip
                                  icon={getStatusIcon(schedule.status)}
                                  label={getStatusText(schedule.status)}
                                  color={getStatusColor(schedule.status)}
                                  size="small"
                                />
                                <Chip
                                  icon={getPriorityIcon(schedule.priority)}
                                  label={getPriorityText(schedule.priority)}
                                  color={getPriorityColor(schedule.priority)}
                                  size="small"
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Station: {(() => {
                                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                                  return ticket ? getStationDisplay(ticket.deviceId) : '未知';
                                })()}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {dayjs(schedule.scheduledDate).format('YYYY-MM-DD')}
                                  </Typography>
                                </Box>
                                {schedule.scheduledTime && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {schedule.scheduledTime}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="查看詳情">
                                <IconButton
                                  size="small"
                                  onClick={() => ticket && onTicketSelect(ticket)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="編輯排程">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingSchedule(schedule);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              {/* 工單照片按鈕 - 只有AOI工單才顯示，包含上傳和查看功能 */}
                              {(() => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                // 只對AOI工單顯示相機圖示
                                return ticket && ticket.deviceId === 'AOI' ? (
                                  <Tooltip title={`${getTicketName(ticket.deviceId)}照片管理（上傳/查看）`}>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const photoUrl = `/ticket/${ticket.id}/photos`;
                                        window.open(photoUrl, '_blank');
                                      }}
                                      sx={{ color: 'primary.main' }}
                                    >
                                      <PhotoCamera />
                                    </IconButton>
                                  </Tooltip>
                                ) : null;
                              })()}
                              <Tooltip title="刪除排程">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* 新增排程對話框 */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>新增工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                select
                label="選擇工單"
                value={newSchedule.ticketId}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, ticketId: e.target.value }))}
                error={!!formErrors.ticketId}
                helperText={formErrors.ticketId}
                required
              >
                {tickets.map((ticket) => (
                  <MenuItem key={ticket.id} value={ticket.id}>
                    <Typography>
                      {getTicketName(ticket.deviceId)}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
              
              <DatePicker
                label="排程日期"
                value={newSchedule.scheduledDate ? dayjs(newSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.scheduledDate,
                    helperText: formErrors.scheduledDate,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={newSchedule.scheduledTime ? dayjs(newSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={newSchedule.priority}
                onChange={(e) => setNewSchedule(prev => ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }))}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSchedule} variant="contained">
              建立排程
            </Button>
          </DialogActions>
        </Dialog>

        {/* 編輯排程對話框 */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>編輯工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <DatePicker
                label="排程日期"
                value={editingSchedule?.scheduledDate ? dayjs(editingSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={editingSchedule?.scheduledTime ? dayjs(editingSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={editingSchedule?.priority || 'MEDIUM'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }) : null)}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="狀態"
                value={editingSchedule?.status || 'OPEN'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' 
                }) : null)}
              >
                <MenuItem value="OPEN">待處理</MenuItem>
                <MenuItem value="IN_PROGRESS">進行中</MenuItem>
                <MenuItem value="COMPLETED">已完成</MenuItem>
                <MenuItem value="CANCELLED">已取消</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={async () => {
                if (editingSchedule) {
                  // 確保資料格式符合後端 API 驗證規則
                  const updateData: any = {};
                  
                  // 日期格式：YYYY-MM-DD
                  if (editingSchedule.scheduledDate) {
                    updateData.scheduledDate = editingSchedule.scheduledDate;
                  }
                  
                  // 時間格式：HH:mm
                  if (editingSchedule.scheduledTime) {
                    updateData.scheduledTime = editingSchedule.scheduledTime;
                  }
                  
                  // 優先級：HIGH, MEDIUM, LOW
                  if (editingSchedule.priority) {
                    updateData.priority = editingSchedule.priority;
                  }
                  
                  // 狀態：OPEN, IN_PROGRESS, COMPLETED, CANCELLED
                  if (editingSchedule.status) {
                    updateData.status = editingSchedule.status;
                  }
                  
                  console.log('準備更新排程資料:', updateData);
                  
                  try {
                    const response = await TargetService.updateSchedule(editingSchedule.id, updateData);
                    
                    if (response.success && response.data) {
                      setSchedules(prev => prev.map(schedule => 
                        schedule.id === editingSchedule.id ? response.data! : schedule
                      ));
                      setEditDialogOpen(false);
                      setEditingSchedule(null);
                    } else {
                      setError(response.message || '更新工單排程失敗');
                    }
                  } catch (error) {
                    console.error('更新工單排程錯誤:', error);
                    setError('更新工單排程失敗，請稍後再試');
                  }
                }
              }} 
              variant="contained"
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketScheduleComponent;

```

調整邏輯，允許在今日排程模式下即使沒有選中目標也能顯示：


```typescriptreact
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  PriorityHigh as HighPriorityIcon,
  Circle as MediumPriorityIcon,
  LowPriority as LowPriorityIcon,
  PhotoCamera,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { ProductionTarget, TicketSchedule, TicketScheduleWithRelations, CreateScheduleRequest, UpdateScheduleRequest, TargetStatus } from '../types/target';
import { Ticket } from '../types/ticket';
import { TargetService } from '../services/targetApi';
import { TicketService } from '../services/api';
import { formatTicketDisplay, getStationDisplay, getTicketName } from '../utils/stationMapping';

// 工單排程元件屬性介面
interface TicketScheduleProps {
  selectedTarget: ProductionTarget | null; // 選中的預生產目標
  onTicketSelect: (ticket: Ticket) => void; // 工單選擇回調函數
  onTargetUpdate?: (targetId: string, updatedTarget: ProductionTarget) => void; // 目標更新回調函數
}

// 工單排程元件
const TicketScheduleComponent: React.FC<TicketScheduleProps> = ({ 
  selectedTarget, 
  onTicketSelect,
  onTargetUpdate
}) => {
  // 狀態管理
  const [schedules, setSchedules] = useState<TicketSchedule[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTodaySchedules, setShowTodaySchedules] = useState(false); // 是否顯示今日排程
  const [todaySchedules, setTodaySchedules] = useState<TicketScheduleWithRelations[]>([]); // 今日排程資料
  
  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TicketSchedule | null>(null);

  // 新增排程表單狀態
  const [newSchedule, setNewSchedule] = useState<CreateScheduleRequest>({
    ticketId: '',
    targetId: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'MEDIUM',
  });

  // 表單驗證錯誤狀態
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * 載入工單排程資料
   */
  const loadSchedules = useCallback(async () => {
    if (!selectedTarget) {
      setSchedules([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 載入指定目標的工單排程
      const scheduleResponse = await TargetService.getTargetSchedules(selectedTarget.id);
      
      if (scheduleResponse.success && scheduleResponse.data) {
        setSchedules(scheduleResponse.data);
      } else {
        setError(scheduleResponse.message || '載入工單排程失敗');
      }

      // 載入所有工單（用於新增排程時選擇）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入工單排程錯誤:', error);
      setError('載入工單排程失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [selectedTarget]);

  /**
   * 載入今日排程
   */
  const loadTodaySchedules = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 取得今天的日期（格式: YYYY-MM-DD）
      const today = dayjs().format('YYYY-MM-DD');
      
      // 載入今日所有排程
      const response = await TargetService.getSchedulesByDate(today);
      
      if (response.success && response.data) {
        setTodaySchedules(response.data);
        setShowTodaySchedules(true);
      } else {
        setError(response.message || '載入今日排程失敗');
        setTodaySchedules([]);
      }

      // 載入所有工單（用於顯示工單名稱）
      const ticketResponse = await TicketService.getTickets();
      
      if (ticketResponse.success && ticketResponse.data) {
        setTickets(ticketResponse.data.tickets);
      }
    } catch (error: any) {
      console.error('載入今日排程錯誤:', error);
      setError('載入今日排程失敗，請稍後再試');
      setTodaySchedules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 切換顯示模式（今日排程 / 目標排程）
   */
  const handleToggleView = () => {
    if (showTodaySchedules) {
      // 切換回目標排程模式
      setShowTodaySchedules(false);
      if (selectedTarget) {
        loadSchedules();
      }
    } else {
      // 切換到今日排程模式
      loadTodaySchedules();
    }
  };

  /**
   * 處理新增排程
   */
  const handleCreateSchedule = async () => {
    // 表單驗證
    const errors: { [key: string]: string } = {};
    if (!newSchedule.ticketId) {
      errors.ticketId = '請選擇工單';
    }
    if (!newSchedule.scheduledDate) {
      errors.scheduledDate = '請選擇排程日期';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 確保資料格式符合後端 API 驗證規則
      const scheduleData: any = {
        ticketId: newSchedule.ticketId,
        targetId: selectedTarget!.id,
        scheduledDate: newSchedule.scheduledDate,
      };
      
      // 可選欄位
      if (newSchedule.scheduledTime) {
        scheduleData.scheduledTime = newSchedule.scheduledTime;
      }
      if (newSchedule.priority) {
        scheduleData.priority = newSchedule.priority;
      }
      
      // 調試：顯示要發送的資料
      console.log('準備建立排程資料:', scheduleData);
      console.log('可用工單列表:', tickets);
      console.log('原始 newSchedule:', newSchedule);
      
      const response = await TargetService.createSchedule(scheduleData);

      if (response.success && response.data) {
        setSchedules(prev => [...prev, response.data!]);
        
        // 如果新排程是今日的，且當前處於今日排程模式，更新今日排程列表
        const today = dayjs().format('YYYY-MM-DD');
        if (showTodaySchedules && response.data.scheduledDate === today) {
          setTodaySchedules(prev => [...prev, response.data!]);
        }
        
        // 如果目標狀態被自動更新為「進行中」，通知父組件
        if (response.data.target && response.data.target.status === TargetStatus.IN_PROGRESS && onTargetUpdate) {
          // 將 API 回應的 target 轉換為 ProductionTarget 類型
          const updatedTarget: ProductionTarget = {
            id: response.data.target.id,
            name: response.data.target.name,
            description: response.data.target.description,
            expectedCompletionDate: response.data.target.expectedCompletionDate,
            status: response.data.target.status,
            createdAt: response.data.target.createdAt,
            updatedAt: response.data.target.updatedAt,
          };
          onTargetUpdate(response.data.targetId, updatedTarget);
        }
        
        setCreateDialogOpen(false);
        setNewSchedule({
          ticketId: '',
          targetId: '',
          scheduledDate: '',
          scheduledTime: '',
          priority: 'MEDIUM',
        });
        setFormErrors({});
      } else {
        setError(response.message || '建立工單排程失敗');
      }
    } catch (error) {
      console.error('建立工單排程錯誤:', error);
      setError('建立工單排程失敗，請稍後再試');
    }
  };

  /**
   * 處理刪除排程
   * @param scheduleId 排程 ID
   */
  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!window.confirm('確定要刪除這個工單排程嗎？')) {
      return;
    }

    try {
      const response = await TargetService.deleteSchedule(scheduleId);

      if (response.success) {
        if (showTodaySchedules) {
          // 更新今日排程列表
          setTodaySchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
        } else {
          // 更新目標排程列表
          setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
        }
      } else {
        setError(response.message || '刪除工單排程失敗');
      }
    } catch (error) {
      console.error('刪除工單排程錯誤:', error);
      setError('刪除工單排程失敗，請稍後再試');
    }
  };

  /**
   * 取得優先級顏色
   * @param priority 優先級
   */
  const getPriorityColor = (priority: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (priority) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  /**
   * 取得優先級圖示
   * @param priority 優先級
   */
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <HighPriorityIcon />;
      case 'MEDIUM':
        return <MediumPriorityIcon />;
      case 'LOW':
        return <LowPriorityIcon />;
      default:
        return <MediumPriorityIcon />;
    }
  };

  /**
   * 取得優先級文字
   * @param priority 優先級
   */
  const getPriorityText = (priority: string): string => {
    switch (priority) {
      case 'HIGH':
        return '高';
      case 'MEDIUM':
        return '中';
      case 'LOW':
        return '低';
      default:
        return '未知';
    }
  };

  /**
   * 取得狀態顏色
   * @param status 狀態
   */
  const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'COMPLETED':
        return 'success';
      case 'CLOSED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * 取得狀態圖示
   * @param status 狀態
   */
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <ScheduleIcon />;
      case 'IN_PROGRESS':
        return <PlayArrowIcon />;
      case 'COMPLETED':
      case 'CLOSED':
        return <CheckCircleIcon />;
      case 'CANCELLED':
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  /**
   * 取得狀態文字
   * @param status 狀態
   */
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return '待處理';
      case 'IN_PROGRESS':
        return '進行中';
      case 'COMPLETED':
        return '已完成';
      case 'CLOSED':
        return '已關閉';
      case 'CANCELLED':
        return '已取消';
      default:
        return '未知狀態';
    }
  };

  // 當選中目標變更時載入排程資料（僅在非今日排程模式下）
  useEffect(() => {
    if (!showTodaySchedules && selectedTarget) {
      loadSchedules();
    }
  }, [selectedTarget, showTodaySchedules, loadSchedules]);
  
  // 當切換回目標排程模式時，重置今日排程狀態
  useEffect(() => {
    if (!showTodaySchedules) {
      setTodaySchedules([]);
    }
  }, [showTodaySchedules]);

  // 如果沒有選中目標且不在今日排程模式，顯示提示訊息
  if (!selectedTarget && !showTodaySchedules) {
    return (
      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
          <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            請選擇預生產目標
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            從左側列表選擇一個預生產目標，查看其工單排程
          </Typography>
          <Button
            variant="contained"
            startIcon={<CalendarIcon />}
            onClick={loadTodaySchedules}
          >
            查看今日排程
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 標題列 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2" gutterBottom>
                {showTodaySchedules ? '今日排程' : '工單排程'}
              </Typography>
              {showTodaySchedules && (
                <Typography variant="body2" color="text.secondary">
                  {dayjs().format('YYYY年MM月DD日')}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={showTodaySchedules ? "outlined" : "contained"}
                startIcon={<CalendarIcon />}
                onClick={handleToggleView}
                size="small"
              >
                今日排程
              </Button>
              {!showTodaySchedules && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                  size="small"
                >
                  新增排程
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* 錯誤訊息 */}
        {error && (
          <Alert severity="error" sx={{ m: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 載入中 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        {/* 排程列表 */}
        {!loading && (
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            {showTodaySchedules ? (
              // 今日排程模式：按目標分組顯示
              todaySchedules.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    今日尚無排程
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs().format('YYYY年MM月DD日')} 沒有任何工單排程
                  </Typography>
                </Paper>
              ) : (
                // 按目標分組顯示今日排程
                (() => {
                  // 按目標 ID 分組
                  const groupedByTarget = todaySchedules.reduce((acc, schedule) => {
                    const targetId = schedule.targetId;
                    if (!acc[targetId]) {
                      acc[targetId] = {
                        target: schedule.target,
                        schedules: [],
                      };
                    }
                    acc[targetId].schedules.push(schedule);
                    return acc;
                  }, {} as Record<string, { target: any; schedules: TicketScheduleWithRelations[] }>);

                  return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {Object.values(groupedByTarget).map((group, index) => (
                        <Card key={group.target.id} sx={{ border: 1, borderColor: 'divider' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ mb: 2, pb: 1, borderBottom: 1, borderColor: 'divider' }}>
                              {group.target.name}
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {group.schedules.map((schedule) => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                return (
                                  <Card 
                                    key={schedule.id}
                                    sx={{ 
                                      backgroundColor: 'background.paper',
                                      '&:hover': { 
                                        boxShadow: 2,
                                        cursor: 'pointer' 
                                      } 
                                    }}
                                    onClick={() => ticket && onTicketSelect(ticket)}
                                  >
                                    <CardContent>
                                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" component="div">
                                              {ticket ? getTicketName(ticket.deviceId) : '未知工單'}
                                            </Typography>
                                            <Chip
                                              icon={getStatusIcon(schedule.status)}
                                              label={getStatusText(schedule.status)}
                                              color={getStatusColor(schedule.status)}
                                              size="small"
                                            />
                                            <Chip
                                              icon={getPriorityIcon(schedule.priority)}
                                              label={getPriorityText(schedule.priority)}
                                              color={getPriorityColor(schedule.priority)}
                                              size="small"
                                            />
                                          </Box>
                                          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                              <CalendarIcon fontSize="small" color="action" />
                                              <Typography variant="body2" color="text.secondary">
                                                {schedule.scheduledDate}
                                              </Typography>
                                            </Box>
                                            {schedule.scheduledTime && (
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <TimeIcon fontSize="small" color="action" />
                                                <Typography variant="body2" color="text.secondary">
                                                  {schedule.scheduledTime}
                                                </Typography>
                                              </Box>
                                            )}
                                          </Box>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingSchedule(schedule);
                                              setEditDialogOpen(true);
                                            }}
                                          >
                                            <EditIcon fontSize="small" />
                                          </IconButton>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteSchedule(schedule.id);
                                            }}
                                          >
                                            <DeleteIcon fontSize="small" />
                                          </IconButton>
                                        </Box>
                                      </Box>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  );
                })()
              )
            ) : schedules.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  尚無工單排程
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  點擊「新增排程」按鈕為此目標安排工單
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  新增排程
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {schedules.map((schedule) => {
                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                  
                  return (
                    <Box key={schedule.id}>
                      <Card sx={{ 
                        '&:hover': { 
                          boxShadow: 3,
                          cursor: 'pointer' 
                        } 
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="h6" component="div">
                                  {(() => {
                                    const ticket = tickets.find(t => t.id === schedule.ticketId);
                                    return ticket ? getTicketName(ticket.deviceId) : '未知工單';
                                  })()}
                                </Typography>
                                <Chip
                                  icon={getStatusIcon(schedule.status)}
                                  label={getStatusText(schedule.status)}
                                  color={getStatusColor(schedule.status)}
                                  size="small"
                                />
                                <Chip
                                  icon={getPriorityIcon(schedule.priority)}
                                  label={getPriorityText(schedule.priority)}
                                  color={getPriorityColor(schedule.priority)}
                                  size="small"
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Station: {(() => {
                                  const ticket = tickets.find(t => t.id === schedule.ticketId);
                                  return ticket ? getStationDisplay(ticket.deviceId) : '未知';
                                })()}
                              </Typography>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <CalendarIcon fontSize="small" />
                                  <Typography variant="body2">
                                    {dayjs(schedule.scheduledDate).format('YYYY-MM-DD')}
                                  </Typography>
                                </Box>
                                {schedule.scheduledTime && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TimeIcon fontSize="small" />
                                    <Typography variant="body2">
                                      {schedule.scheduledTime}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="查看詳情">
                                <IconButton
                                  size="small"
                                  onClick={() => ticket && onTicketSelect(ticket)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="編輯排程">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setEditingSchedule(schedule);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              {/* 工單照片按鈕 - 只有AOI工單才顯示，包含上傳和查看功能 */}
                              {(() => {
                                const ticket = tickets.find(t => t.id === schedule.ticketId);
                                // 只對AOI工單顯示相機圖示
                                return ticket && ticket.deviceId === 'AOI' ? (
                                  <Tooltip title={`${getTicketName(ticket.deviceId)}照片管理（上傳/查看）`}>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        const photoUrl = `/ticket/${ticket.id}/photos`;
                                        window.open(photoUrl, '_blank');
                                      }}
                                      sx={{ color: 'primary.main' }}
                                    >
                                      <PhotoCamera />
                                    </IconButton>
                                  </Tooltip>
                                ) : null;
                              })()}
                              <Tooltip title="刪除排程">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteSchedule(schedule.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        )}

        {/* 新增排程對話框 */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>新增工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                select
                label="選擇工單"
                value={newSchedule.ticketId}
                onChange={(e) => setNewSchedule(prev => ({ ...prev, ticketId: e.target.value }))}
                error={!!formErrors.ticketId}
                helperText={formErrors.ticketId}
                required
              >
                {tickets.map((ticket) => (
                  <MenuItem key={ticket.id} value={ticket.id}>
                    <Typography>
                      {getTicketName(ticket.deviceId)}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
              
              <DatePicker
                label="排程日期"
                value={newSchedule.scheduledDate ? dayjs(newSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.scheduledDate,
                    helperText: formErrors.scheduledDate,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={newSchedule.scheduledTime ? dayjs(newSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setNewSchedule(prev => ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={newSchedule.priority}
                onChange={(e) => setNewSchedule(prev => ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }))}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSchedule} variant="contained">
              建立排程
            </Button>
          </DialogActions>
        </Dialog>

        {/* 編輯排程對話框 */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>編輯工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <DatePicker
                label="排程日期"
                value={editingSchedule?.scheduledDate ? dayjs(editingSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
              
              <TimePicker
                label="排程時間"
                value={editingSchedule?.scheduledTime ? dayjs(editingSchedule.scheduledTime, 'HH:mm') : null}
                onChange={(time: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledTime: time ? time.format('HH:mm') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              
              <TextField
                fullWidth
                select
                label="優先級"
                value={editingSchedule?.priority || 'MEDIUM'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' 
                }) : null)}
              >
                <MenuItem value="HIGH">高</MenuItem>
                <MenuItem value="MEDIUM">中</MenuItem>
                <MenuItem value="LOW">低</MenuItem>
              </TextField>

              <TextField
                fullWidth
                select
                label="狀態"
                value={editingSchedule?.status || 'OPEN'}
                onChange={(e) => setEditingSchedule(prev => prev ? ({ 
                  ...prev, 
                  status: e.target.value as 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' 
                }) : null)}
              >
                <MenuItem value="OPEN">待處理</MenuItem>
                <MenuItem value="IN_PROGRESS">進行中</MenuItem>
                <MenuItem value="COMPLETED">已完成</MenuItem>
                <MenuItem value="CANCELLED">已取消</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button 
              onClick={async () => {
                if (editingSchedule) {
                  // 確保資料格式符合後端 API 驗證規則
                  const updateData: any = {};
                  
                  // 日期格式：YYYY-MM-DD
                  if (editingSchedule.scheduledDate) {
                    updateData.scheduledDate = editingSchedule.scheduledDate;
                  }
                  
                  // 時間格式：HH:mm
                  if (editingSchedule.scheduledTime) {
                    updateData.scheduledTime = editingSchedule.scheduledTime;
                  }
                  
                  // 優先級：HIGH, MEDIUM, LOW
                  if (editingSchedule.priority) {
                    updateData.priority = editingSchedule.priority;
                  }
                  
                  // 狀態：OPEN, IN_PROGRESS, COMPLETED, CANCELLED
                  if (editingSchedule.status) {
                    updateData.status = editingSchedule.status;
                  }
                  
                  console.log('準備更新排程資料:', updateData);
                  
                  try {
                    const response = await TargetService.updateSchedule(editingSchedule.id, updateData);
                    
                    if (response.success && response.data) {
                      setSchedules(prev => prev.map(schedule => 
                        schedule.id === editingSchedule.id ? response.data! : schedule
                      ));
                      setEditDialogOpen(false);
                      setEditingSchedule(null);
                    } else {
                      setError(response.message || '更新工單排程失敗');
                    }
                  } catch (error) {
                    console.error('更新工單排程錯誤:', error);
                    setError('更新工單排程失敗，請稍後再試');
                  }
                }
              }} 
              variant="contained"
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketScheduleComponent;

```

已實作「今日排程」功能。變更如下：

## 實作總結：

### 1. **後端 API** (`server/routes/schedules.js`)
   - 在 GET `/api/schedules` 端點新增日期篩選功能，支援 `date` 查詢參數

### 2. **前端 API 服務** (`client/src/services/targetApi.ts`)
   - 新增 `getSchedulesByDate()` 方法，用於獲取指定日期的所有排程

### 3. **前端組件** (`client/src/components/TicketSchedule.tsx`)
   - 新增「今日排程」按鈕
   - 新增狀態管理：
     - `showTodaySchedules`：控制是否顯示今日排程模式
     - `todaySchedules`：儲存今日排程資料
   - 新增 `loadTodaySchedules()` 函數：載入今日所有排程
   - 新增 `handleToggleView()` 函數：在今日排程與目標排程模式間切換
   - 按目標分組顯示今日排程：將今日所有排程依目標分組顯示
   - 更新刪除與新增排程邏輯，確保在兩種模式下都能正確更新

### 功能特點：
- 點擊「今日排程」會載入今日（例如 11/2）的所有排程
- 排程依生產目標分組顯示，每個目標為一個區塊
- 顯示格式包含：工單名稱、狀態、優先級、日期與時間
- 可編輯與刪除今日排程
- 新增排程時，若為今日排程且處於今日排程模式，會自動更新列表

功能已實作完成，語法檢查通過。可在瀏覽器中測試「今日排程」功能。

---

**User**

可以讓我檢視目前使用的API嗎?

---

**Cursor**


檢視專案中的 API 端點和文檔：


檢視所有路由文件，整理完整的 API 列表：


建立完整的 API 文檔，列出所有可用端點：


```markdown
# 工單管理系統 - 完整 API 文檔

## 基礎資訊
- **Base URL**: `http://localhost:5000`
- **Content-Type**: `application/json`
- **認證**: 無需認證（開發環境）

---

## 📋 1. 系統資訊

### 1.1 根路徑 - 查看 API 資訊
```http
GET /
```

**回應範例**:
```json
{
  "success": true,
  "message": "工單管理系統後端 API 服務",
  "version": "1.0.0",
  "endpoints": {
    "health": "/health",
    "tickets": "/api/tickets",
    "targets": "/api/targets",
    "schedules": "/api/schedules",
    "photos": "/api/photos",
    "version": "/api/version"
  },
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

### 1.2 健康檢查
```http
GET /health
```

**回應範例**:
```json
{
  "status": "OK",
  "message": "工單管理系統後端服務正常運行",
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

---

## 🎫 2. 工單管理 API (`/api/tickets`)

### 2.1 建立工單
```http
POST /api/tickets
```

**請求體**:
```json
{
  "deviceId": "CELL-001",
  "imageId": "IMG-2024-001"  // 可選
}
```

**回應範例**:
```json
{
  "success": true,
  "message": "工單建立成功",
  "data": {
    "id": "clx1234567890",
    "deviceId": "CELL-001",
    "imageId": "IMG-2024-001",
    "status": "OPEN",
    "createdAt": "2025-11-02T12:00:00.000Z",
    "updatedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

### 2.2 查詢工單列表
```http
GET /api/tickets?status=OPEN&deviceId=CELL-001&page=1&limit=10
```

**查詢參數**:
- `status` (可選): OPEN | CLOSED
- `deviceId` (可選): 設備 ID
- `page` (可選): 頁碼，預設 1
- `limit` (可選): 每頁數量，預設 10

**回應範例**:
```json
{
  "success": true,
  "message": "查詢工單列表成功",
  "data": {
    "tickets": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 2.3 查詢單一工單詳情
```http
GET /api/tickets/:id
```

**回應範例**:
```json
{
  "success": true,
  "message": "查詢工單詳情成功",
  "data": {
    "id": "clx1234567890",
    "deviceId": "CELL-001",
    "imageId": "IMG-2024-001",
    "status": "OPEN",
    "createdAt": "2025-11-02T12:00:00.000Z",
    "updatedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

### 2.4 更新工單
```http
PUT /api/tickets/:id
```

**請求體**:
```json
{
  "status": "CLOSED"  // 可選
}
```

**回應範例**:
```json
{
  "success": true,
  "message": "工單更新成功",
  "data": {
    "id": "clx1234567890",
    "deviceId": "CELL-001",
    "status": "CLOSED",
    "updatedAt": "2025-11-02T12:30:00.000Z"
  }
}
```

---

## 🎯 3. 預生產目標 API (`/api/targets`)

### 3.1 取得所有預生產目標列表
```http
GET /api/targets?page=1&limit=10&status=PLANNING
```

**查詢參數**:
- `page` (可選): 頁碼，預設 1
- `limit` (可選): 每頁數量，預設 10
- `status` (可選): PLANNING | IN_PROGRESS | COMPLETED | CANCELLED

**回應範例**:
```json
{
  "success": true,
  "message": "取得預生產目標列表成功",
  "data": {
    "targets": [
      {
        "id": "target123",
        "name": "DS1-2",
        "description": "目標描述",
        "expectedCompletionDate": "2025-11-30",
        "status": "PLANNING",
        "createdAt": "2025-11-02T12:00:00.000Z",
        "updatedAt": "2025-11-02T12:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 3.2 取得單一預生產目標詳情
```http
GET /api/targets/:id
```

**回應範例**:
```json
{
  "success": true,
  "message": "取得預生產目標詳情成功",
  "data": {
    "id": "target123",
    "name": "DS1-2",
    "description": "目標描述",
    "expectedCompletionDate": "2025-11-30",
    "status": "PLANNING",
    "createdAt": "2025-11-02T12:00:00.000Z",
    "updatedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

### 3.3 建立新的預生產目標
```http
POST /api/targets
```

**請求體**:
```json
{
  "name": "DS1-2",
  "description": "目標描述",  // 可選
  "expectedCompletionDate": "2025-11-30"
}
```

**回應範例**:
```json
{
  "success": true,
  "message": "建立預生產目標成功",
  "data": {
    "id": "target123",
    "name": "DS1-2",
    "status": "PLANNING",
    "createdAt": "2025-11-02T12:00:00.000Z",
    "updatedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

### 3.4 更新預生產目標
```http
PUT /api/targets/:id
```

**請求體**:
```json
{
  "name": "DS1-2-更新",  // 可選
  "description": "更新描述",  // 可選
  "expectedCompletionDate": "2025-12-01",  // 可選
  "status": "IN_PROGRESS"  // 可選: PLANNING | IN_PROGRESS | COMPLETED | CANCELLED
}
```

**回應範例**:
```json
{
  "success": true,
  "message": "更新預生產目標成功",
  "data": {
    "id": "target123",
    "name": "DS1-2-更新",
    "status": "IN_PROGRESS",
    "updatedAt": "2025-11-02T12:30:00.000Z"
  }
}
```

### 3.5 刪除預生產目標
```http
DELETE /api/targets/:id
```

**回應範例**:
```json
{
  "success": true,
  "message": "刪除預生產目標成功"
}
```

### 3.6 取得指定目標的工單排程
```http
GET /api/targets/:id/schedules
```

**回應範例**:
```json
{
  "success": true,
  "message": "取得工單排程成功",
  "data": [
    {
      "id": "schedule123",
      "ticketId": "ticket123",
      "targetId": "target123",
      "scheduledDate": "2025-11-02",
      "scheduledTime": "09:00",
      "priority": "HIGH",
      "status": "OPEN",
      "ticket": {
        "id": "ticket123",
        "deviceId": "CELL-001",
        "status": "OPEN"
      },
      "createdAt": "2025-11-02T12:00:00.000Z",
      "updatedAt": "2025-11-02T12:00:00.000Z"
    }
  ]
}
```

---

## 📅 4. 工單排程 API (`/api/schedules`)

### 4.1 建立工單排程
```http
POST /api/schedules
```

**請求體**:
```json
{
  "ticketId": "ticket123",
  "targetId": "target123",
  "scheduledDate": "2025-11-02",
  "scheduledTime": "09:00",  // 可選，格式: HH:mm
  "priority": "MEDIUM"  // 可選: HIGH | MEDIUM | LOW，預設: MEDIUM
}
```

**回應範例**:
```json
{
  "success": true,
  "message": "建立工單排程成功",
  "data": {
    "id": "schedule123",
    "ticketId": "ticket123",
    "targetId": "target123",
    "scheduledDate": "2025-11-02",
    "scheduledTime": "09:00",
    "priority": "MEDIUM",
    "status": "OPEN",
    "ticket": {...},
    "target": {...},
    "createdAt": "2025-11-02T12:00:00.000Z",
    "updatedAt": "2025-11-02T12:00:00.000Z"
  }
}
```

### 4.2 取得所有工單排程列表
```http
GET /api/schedules?page=1&limit=10&targetId=target123&ticketId=ticket123&status=OPEN&date=2025-11-02
```

**查詢參數**:
- `page` (可選): 頁碼，預設 1
- `limit` (可選): 每頁數量，預設 10
- `targetId` (可選): 目標 ID 篩選
- `ticketId` (可選): 工單 ID 篩選
- `status` (可選): 狀態篩選
- `date` (可選): 日期篩選，格式: YYYY-MM-DD（**新增功能：用於今日排程**）

**回應範例**:
```json
{
  "success": true,
  "message": "取得工單排程列表成功",
  "data": {
    "schedules": [
      {
        "id": "schedule123",
        "ticketId": "ticket123",
        "targetId": "target123",
        "scheduledDate": "2025-11-02",
        "scheduledTime": "09:00",
        "priority": "MEDIUM",
        "status": "OPEN",
        "ticket": {...},
        "target": {...}
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 4.3 取得指定目標的工單排程
```http
GET /api/schedules/target/:targetId
```

**回應範例**:
```json
{
  "success": true,
  "message": "取得目標工單排程成功",
  "data": [
    {
      "id": "schedule123",
      "ticketId": "ticket123",
      "targetId": "target123",
      "scheduledDate": "2025-11-02",
      "scheduledTime": "09:00",
      "priority": "HIGH",
      "status": "OPEN",
      "ticket": {...},
      "target": {...}
    }
  ]
}
```

### 4.4 取得單一工單排程詳情
```http
GET /api/schedules/:id
```

**回應範例**:
```json
{
  "success": true,
  "message": "取得工單排程詳情成功",
  "data": {
    "id": "schedule123",
    "ticketId": "ticket123",
    "targetId": "target123",
    "scheduledDate": "2025-11-02",
    "scheduledTime": "09:00",
    "priority": "HIGH",
    "status": "OPEN",
    "ticket": {...},
    "target": {...}
  }
}
```

### 4.5 更新工單排程
```http
PUT /api/schedules/:id
```

**請求體**:
```json
{
  "scheduledDate": "2025-11-03",  // 可選，格式: YYYY-MM-DD
  "scheduledTime": "10:00",  // 可選，格式: HH:mm
  "priority": "HIGH",  // 可選: HIGH | MEDIUM | LOW
  "status": "IN_PROGRESS"  // 可選: OPEN | IN_PROGRESS | COMPLETED | CANCELLED
}
```

**回應範例**:
```json
{
  "success": true,
  "message": "更新工單排程成功",
  "data": {
    "id": "schedule123",
    "scheduledDate": "2025-11-03",
    "scheduledTime": "10:00",
    "priority": "HIGH",
    "status": "IN_PROGRESS",
    "updatedAt": "2025-11-02T12:30:00.000Z"
  }
}
```

### 4.6 刪除工單排程
```http
DELETE /api/schedules/:id
```

**回應範例**:
```json
{
  "success": true,
  "message": "刪除工單排程成功"
}
```

---

## 📷 5. 照片 API (`/api/photos`)

### 5.1 上傳照片到指定工單
```http
POST /api/photos/upload
Content-Type: multipart/form-data
```

**表單資料**:
- `photo` (file): 照片文件（JPEG, JPG, PNG, GIF, BMP, WEBP，最大 10MB）
- `ticketId` (string): 工單 ID（必填）
- `description` (string): 照片描述（可選）

**回應範例**:
```json
{
  "success": true,
  "message": "照片上傳成功",
  "data": {
    "id": "photo123",
    "filename": "1761579584168_820092929.jpg",
    "originalName": "image.jpg",
    "fileSize": 102400,
    "mimeType": "image/jpeg",
    "description": "照片描述",
    "uploadedAt": "2025-11-02T12:00:00.000Z",
    "url": "/api/photos/photo123/view"
  }
}
```

### 5.2 查看照片
```http
GET /api/photos/:id/view
```

**回應**: 返回照片文件（圖片）

### 5.3 獲取指定工單的所有照片
```http
GET /api/photos/ticket/:ticketId
```

**回應範例**:
```json
{
  "success": true,
  "message": "獲取照片列表成功",
  "data": [
    {
      "id": "photo123",
      "filename": "1761579584168_820092929.jpg",
      "originalName": "image.jpg",
      "fileSize": 102400,
      "mimeType": "image/jpeg",
      "description": "照片描述",
      "uploadedAt": "2025-11-02T12:00:00.000Z",
      "url": "/api/photos/photo123/view"
    }
  ]
}
```

### 5.4 刪除照片
```http
DELETE /api/photos/:id
```

**回應範例**:
```json
{
  "success": true,
  "message": "照片刪除成功"
}
```

---

## 📦 6. 版本資訊 API (`/api/version`)

### 6.1 獲取版本資訊
```http
GET /api/version
```

**回應範例**:
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "buildNumber": "20251102",
    "changelog": [
      {
        "version": "1.0.0",
        "date": "2025-11-02",
        "changes": ["初始版本"]
      }
    ]
  },
  "timestamp": "2025-11-02T12:00:00.000Z"
}
```

### 6.2 獲取更新日誌
```http
GET /api/version/changelog
```

**回應範例**:
```json
{
  "success": true,
  "data": {
    "changelog": [...],
    "currentVersion": "1.0.0",
    "buildNumber": "20251102"
  }
}
```

### 6.3 檢查更新
```http
GET /api/version/check?version=1.0.0
```

**查詢參數**:
- `version` (可選): 客戶端版本號，預設 "1.0.0"

**回應範例**:
```json
{
  "success": true,
  "data": {
    "hasUpdate": false,
    "currentVersion": "1.0.0",
    "clientVersion": "1.0.0",
    "latestChangelog": {...},
    "updateAvailable": false
  }
}
```

---

## 🚨 錯誤處理

### 驗證錯誤 (400)
```json
{
  "success": false,
  "message": "請求資料驗證失敗",
  "errors": [
    {
      "msg": "設備 ID 為必填欄位",
      "param": "deviceId"
    }
  ]
}
```

### 資源不存在 (404)
```json
{
  "success": false,
  "message": "找不到指定的資源"
}
```

### 伺服器錯誤 (500)
```json
{
  "success": false,
  "message": "伺服器內部錯誤",
  "error": "詳細錯誤訊息"
}
```

---

## 📝 資料模型

### Ticket 工單
| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 工單唯一識別碼 |
| deviceId | String | ✅ | 設備 ID |
| imageId | String | ❌ | 影像 ID |
| status | Enum | ✅ | 工單狀態 (OPEN/CLOSED) |
| createdAt | DateTime | ✅ | 建立時間 |
| updatedAt | DateTime | ✅ | 更新時間 |

### ProductionTarget 預生產目標
| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 目標唯一識別碼 |
| name | String | ✅ | 目標名稱 |
| description | String | ❌ | 目標描述 |
| expectedCompletionDate | String | ✅ | 預計完成時間 (YYYY-MM-DD) |
| status | Enum | ✅ | 目標狀態 (PLANNING/IN_PROGRESS/COMPLETED/CANCELLED) |
| createdAt | DateTime | ✅ | 建立時間 |
| updatedAt | DateTime | ✅ | 更新時間 |

### TicketSchedule 工單排程
| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 排程唯一識別碼 |
| ticketId | String | ✅ | 工單 ID |
| targetId | String | ✅ | 預生產目標 ID |
| scheduledDate | String | ✅ | 排程日期 (YYYY-MM-DD) |
| scheduledTime | String | ❌ | 排程時間 (HH:mm) |
| priority | Enum | ✅ | 優先級 (HIGH/MEDIUM/LOW) |
| status | Enum | ✅ | 排程狀態 (OPEN/IN_PROGRESS/COMPLETED/CANCELLED) |
| createdAt | DateTime | ✅ | 建立時間 |
| updatedAt | DateTime | ✅ | 更新時間 |

### Photo 照片
| 欄位 | 型別 | 必填 | 說明 |
|------|------|------|------|
| id | String | ✅ | 照片唯一識別碼 |
| ticketId | String | ✅ | 工單 ID |
| filename | String | ✅ | 存儲文件名 |
| originalName | String | ✅ | 原始文件名 |
| filePath | String | ✅ | 文件路徑 |
| fileSize | Int | ✅ | 文件大小（字節） |
| mimeType | String | ✅ | MIME類型 |
| description | String | ❌ | 照片描述 |
| uploadedAt | DateTime | ✅ | 上傳時間 |

---

## 🔧 使用範例

### 使用 curl 測試 API

```bash
# 1. 檢查服務狀態
curl http://localhost:5000/health

# 2. 查看 API 資訊
curl http://localhost:5000/

# 3. 建立工單
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "CELL-001"}'

# 4. 查詢工單列表
curl http://localhost:5000/api/tickets?page=1&limit=10

# 5. 建立預生產目標
curl -X POST http://localhost:5000/api/targets \
  -H "Content-Type: application/json" \
  -d '{"name": "DS1-2", "expectedCompletionDate": "2025-11-30"}'

# 6. 建立工單排程
curl -X POST http://localhost:5000/api/schedules \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "ticket123", "targetId": "target123", "scheduledDate": "2025-11-02"}'

# 7. 查詢今日排程（新功能）
curl "http://localhost:5000/api/schedules?date=2025-11-02&limit=1000"

# 8. 上傳照片
curl -X POST http://localhost:5000/api/photos/upload \
  -F "photo=@image.jpg" \
  -F "ticketId=ticket123" \
  -F "description=照片描述"
```

### 使用 JavaScript/Fetch

```javascript
// 建立工單
const createTicket = async (ticketData) => {
  const response = await fetch('http://localhost:5000/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData)
  });
  return await response.json();
};

// 查詢今日排程
const getTodaySchedules = async () => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const response = await fetch(`http://localhost:5000/api/schedules?date=${today}&limit=1000`);
  return await response.json();
};

// 取得目標列表
const getTargets = async (page = 1, limit = 100) => {
  const response = await fetch(`http://localhost:5000/api/targets?page=${page}&limit=${limit}`);
  return await response.json();
};
```

---

## 📌 最新更新

### 新增功能（2025-11-02）
- ✅ **今日排程功能**: 在 `/api/schedules` 端點新增 `date` 查詢參數，支援按日期篩選排程
  - 使用方式: `GET /api/schedules?date=2025-11-02&limit=1000`
  - 可獲取指定日期的所有排程，方便實現「今日排程」功能

---

## 🔗 相關連結
- 前端應用: `http://localhost:3000`
- 後端 API: `http://localhost:5000`
- API 根路徑: `http://localhost:5000/`
- 健康檢查: `http://localhost:5000/health`

```

已在 `server/API_COMPLETE.md` 建立完整的 API 文檔，包含所有可用端點。在瀏覽器中打開：


已建立完整的 API 文檔，並在瀏覽器中打開了 API 根路徑。

## API 文檔位置

**完整文檔**: `server/API_COMPLETE.md`

**瀏覽器中查看**:
- API 資訊頁面: `http://localhost:5000/`（已打開）
- 此頁面會顯示所有可用的 API 端點列表

## 主要 API 端點摘要

### 系統資訊
- `GET /` - API 資訊與端點列表
- `GET /health` - 健康檢查

### 工單管理 (`/api/tickets`)
- `GET /api/tickets` - 查詢工單列表
- `POST /api/tickets` - 建立工單
- `GET /api/tickets/:id` - 查詢工單詳情
- `PUT /api/tickets/:id` - 更新工單

### 預生產目標 (`/api/targets`)
- `GET /api/targets` - 取得目標列表
- `POST /api/targets` - 建立目標
- `GET /api/targets/:id` - 取得目標詳情
- `PUT /api/targets/:id` - 更新目標
- `DELETE /api/targets/:id` - 刪除目標
- `GET /api/targets/:id/schedules` - 取得目標的排程

### 工單排程 (`/api/schedules`)
- `GET /api/schedules` - 取得排程列表（支援 `date` 參數用於今日排程）
- `POST /api/schedules` - 建立排程
- `GET /api/schedules/target/:targetId` - 取得指定目標的排程
- `GET /api/schedules/:id` - 取得排程詳情
- `PUT /api/schedules/:id` - 更新排程
- `DELETE /api/schedules/:id` - 刪除排程

### 照片管理 (`/api/photos`)
- `POST /api/photos/upload` - 上傳照片
- `GET /api/photos/:id/view` - 查看照片
- `GET /api/photos/ticket/:ticketId` - 取得工單的照片列表
- `DELETE /api/photos/:id` - 刪除照片

### 版本資訊 (`/api/version`)
- `GET /api/version` - 取得版本資訊
- `GET /api/version/changelog` - 取得更新日誌
- `GET /api/version/check` - 檢查更新

完整詳細的 API 文檔已保存在 `server/API_COMPLETE.md`，包含所有端點的請求範例、回應格式和說明。

---

**User**

工單系統的網頁可以讓我分享給朋友嗎? 也讓他可以測試功能並回饋

---

**Cursor**


檢查配置，確保服務可被外部訪問：


檢查並建立配置，讓朋友能從外部訪問系統：


為了讓朋友可從外部訪問，需做兩件事：
1. 讓前端可從外部訪問（設定 HOST=0.0.0.0）
2. 讓前端使用正確的 API 地址（不能是 localhost）

建立一個自動配置的啟動腳本和分享指南：


```bat
@echo off
chcp 65001 >nul
echo ========================================
echo 🚀 啟動工單管理系統（外部分享模式）
echo ========================================
echo.

REM 獲取本機 IP 地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set LOCAL_IP=%%a
    goto :ip_found
)
:ip_found
REM 清理IP地址（移除空格）
set LOCAL_IP=%LOCAL_IP: =%

echo 📍 檢測到本機 IP 地址: %LOCAL_IP%
echo.

REM 設定環境變數
set HOST=0.0.0.0
set PORT=3000
set REACT_APP_API_URL=http://%LOCAL_IP%:5000/api

echo ✅ 環境變數已設定:
echo    HOST=%HOST%
echo    PORT=%PORT%
echo    REACT_APP_API_URL=%REACT_APP_API_URL%
echo.

echo 🔧 啟動後端服務...
start "後端服務" cmd /k "cd /d %~dp0server && npm run dev"

echo 等待後端服務啟動...
timeout /t 5 /nobreak >nul

echo 🌐 啟動前端服務（允許外部訪問）...
start "前端服務" cmd /k "cd /d %~dp0client && set HOST=0.0.0.0 && set REACT_APP_API_URL=%REACT_APP_API_URL% && npm start"

echo.
echo ========================================
echo ✅ 服務啟動完成！
echo ========================================
echo.
echo 📱 分享給朋友的訪問地址：
echo    前端網頁: http://%LOCAL_IP%:3000
echo    後端API: http://%LOCAL_IP%:5000
echo.
echo 💻 本機訪問地址：
echo    前端網頁: http://localhost:3000
echo    後端API: http://localhost:5000
echo.
echo ========================================
echo 📋 分享說明：
echo ========================================
echo 1. 確保你的電腦和朋友的設備在同一網路
echo    或在同一個 WiFi 下
echo.
echo 2. 分享給朋友以下網址：
echo    http://%LOCAL_IP%:3000
echo.
echo 3. 如果無法訪問，請檢查：
echo    - Windows 防火牆是否允許 Node.js 訪問
echo    - 路由器是否允許內網訪問
echo    - 兩個設備是否在同一網路
echo.
echo 4. 防火牆設定方法：
echo    控制台 ^> 系統與安全性 ^> Windows Defender 防火牆
echo    ^> 允許應用程式通過防火牆
echo    勾選 Node.js 的「私人網路」選項
echo.
echo ========================================
echo.
echo 按任意鍵關閉此視窗...
pause >nul

```

```markdown
# 📱 工單管理系統 - 分享給朋友使用指南

## 🎯 快速開始

### 方法一：使用自動啟動腳本（推薦）

1. **雙擊運行** `start-for-sharing.bat`
2. **等待服務啟動**（約 10-15 秒）
3. **分享網址**給朋友：腳本會顯示您的 IP 地址和訪問網址

---

## 📍 獲取您的 IP 地址

如果沒有使用自動啟動腳本，您可以：

### Windows 方式：
```bash
# 雙擊運行
get-ip.bat

# 或手動查詢
ipconfig | findstr /i "IPv4"
```

### 顯示結果類似：
```
IPv4 地址 . . . . . . . . . . . . : 192.168.0.186
```

---

## 🌐 啟動服務（允許外部訪問）

### 選項 A：使用分享腳本（最簡單）
```bash
start-for-sharing.bat
```

### 選項 B：手動啟動

**1. 啟動後端服務**（已配置為允許外部訪問）
```bash
cd server
npm run dev
```

**2. 啟動前端服務**（需要設置環境變數）

在 PowerShell 中：
```powershell
cd client
$env:HOST="0.0.0.0"
$env:REACT_APP_API_URL="http://192.168.0.186:5000/api"
npm start
```

或者創建 `.env` 文件在 `client/` 目錄下：
```env
HOST=0.0.0.0
REACT_APP_API_URL=http://192.168.0.186:5000/api
```

**注意**：請將 `192.168.0.186` 替換為您的實際 IP 地址！

---

## 🔗 分享訪問地址

### 前端網頁（給朋友訪問）
```
http://您的IP地址:3000
例如：http://192.168.0.186:3000
```

### 後端 API（如需直接測試 API）
```
http://您的IP地址:5000
例如：http://192.168.0.186:5000
```

---

## ✅ 訪問條件

### 必須滿足：
1. ✅ **同一網路**：您的電腦和朋友的設備必須連接到同一個 WiFi 或區域網路
2. ✅ **服務運行中**：確保前端和後端服務都在運行
3. ✅ **防火牆允許**：Windows 防火牆需要允許 Node.js 的網路訪問

---

## 🔥 Windows 防火牆設定

### 如果朋友無法訪問，請檢查防火牆：

**方法一：通過控制台**
1. 打開「控制台」→「系統與安全性」→「Windows Defender 防火牆」
2. 點擊「允許應用程式通過防火牆」
3. 找到「Node.js」或「Node.exe」
4. 勾選「私人網路」選項
5. 如果找不到，點擊「變更設定」→「允許另一個應用程式」→ 選擇 Node.js

**方法二：通過 PowerShell（管理員權限）**
```powershell
# 允許 Node.js 通過防火牆（私有網路）
New-NetFirewallRule -DisplayName "Node.js Server" -Direction Inbound -Program "C:\Program Files\nodejs\node.exe" -Action Allow -Profile Private
```

**方法三：暫時關閉防火牆測試**
⚠️ **僅用於測試，不建議長期使用**

---

## 📱 不同設備訪問方式

### 💻 電腦/筆記本
1. 打開瀏覽器（Chrome、Edge、Firefox 等）
2. 輸入：`http://您的IP:3000`
3. 例如：`http://192.168.0.186:3000`

### 📱 手機/平板（同一 WiFi）
1. 連接到與您電腦相同的 WiFi
2. 打開手機瀏覽器
3. 輸入：`http://您的IP:3000`
4. 例如：`http://192.168.0.186:3000`

---

## 🔍 故障排除

### 問題 1：朋友無法訪問網頁
**可能原因**：
- ❌ 不在同一網路
- ❌ 防火牆阻擋
- ❌ 服務未啟動

**解決方法**：
1. 確認兩個設備在同一 WiFi
2. 檢查防火牆設定（見上方）
3. 確認服務正在運行（查看命令提示字元視窗）

### 問題 2：網頁打開但 API 錯誤
**可能原因**：
- ❌ 前端使用的 API URL 是 `localhost`，而不是您的 IP

**解決方法**：
1. 使用 `start-for-sharing.bat` 自動設置
2. 或手動設置環境變數 `REACT_APP_API_URL`

### 問題 3：可以訪問但功能不正常
**可能原因**：
- ❌ 後端服務未啟動
- ❌ 後端監聽地址錯誤

**解決方法**：
確認後端服務正在運行，並檢查 `server/index.js` 中的監聽設定為 `0.0.0.0`

---

## 🌍 跨網際網路分享（進階）

如果您想讓朋友從不同的網路（例如不同城市）訪問，需要：

1. **使用內網穿透工具**：
   - ngrok
   - localtunnel
   - Cloudflare Tunnel

2. **範例：使用 ngrok**
   ```bash
   # 安裝 ngrok
   # 下載：https://ngrok.com/
   
   # 啟動後端服務
   cd server && npm run dev
   
   # 在另一個終端運行
   ngrok http 5000
   
   # 會得到類似：https://abc123.ngrok.io
   # 分享這個網址給朋友
   ```

3. **注意事項**：
   - ⚠️ 公開分享可能帶來安全風險
   - ⚠️ 建議僅用於測試環境
   - ⚠️ 生產環境需要配置 HTTPS 和認證

---

## 📋 檢查清單

分享前請確認：
- [ ] 後端服務正在運行（端口 5000）
- [ ] 前端服務正在運行（端口 3000）
- [ ] 已經設置 `HOST=0.0.0.0`
- [ ] 已經設置 `REACT_APP_API_URL` 為您的 IP 地址
- [ ] 防火牆已允許 Node.js 訪問
- [ ] 知道您的本機 IP 地址
- [ ] 朋友與您在同一網路

---

## 💡 提示

1. **IP 地址可能會變**：重新連接 WiFi 後 IP 地址可能會改變，記得重新檢查
2. **使用固定 IP**：如果經常分享，建議在路由器中為您的電腦設置固定 IP
3. **測試連線**：可以先在您的手機（同一 WiFi）上測試是否能訪問
4. **分享 API 文檔**：可以分享 `server/API_COMPLETE.md` 給朋友查看所有 API 端點

---

## 📞 需要幫助？

如果遇到問題，請檢查：
1. 終端視窗的錯誤訊息
2. 瀏覽器開發者工具的 Console（F12）
3. 網路連線狀態
4. 服務日誌輸出

---

祝您分享順利！🎉

```

建立一個更智能的解決方案，讓前端自動使用正確的 API URL：


```typescript
/**
 * 動態獲取 API URL
 * 如果從外部訪問，自動使用當前主機的 IP 地址
 */
export const getApiUrl = (): string => {
  // 優先使用環境變數
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 如果當前訪問地址不是 localhost，自動構建 API URL
  const currentHost = window.location.hostname;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // 本機訪問，使用 localhost
    return 'http://localhost:5000/api';
  } else {
    // 外部訪問（使用 IP 地址），構建對應的 API URL
    const port = window.location.port === '3000' ? '5000' : window.location.port;
    return `http://${currentHost}:${port}/api`;
  }
};

// 獲取完整的 API 基礎 URL（不含 /api）
export const getApiBaseUrl = (): string => {
  const apiUrl = getApiUrl();
  return apiUrl.replace('/api', '');
};

```

更新 API 服務文件，使其能自動檢測並使用正確的 API URL：


```typescript
import axios, { AxiosResponse } from 'axios';
import { 
  Ticket, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  ApiResponse, 
  TicketListResponse 
} from '../types/ticket';

// 動態獲取 API URL（支援外部訪問）
const getApiBaseUrl = (): string => {
  // 優先使用環境變數
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 如果當前訪問地址不是 localhost，自動構建 API URL
  const currentHost = window.location.hostname;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // 本機訪問，使用 localhost
    return 'http://localhost:5000/api';
  } else {
    // 外部訪問（使用 IP 地址），構建對應的 API URL
    return `http://${currentHost}:5000/api`;
  }
};

// 建立 axios 實例，設定基礎 URL 和預設配置
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000, // 10 秒超時
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

// 請求攔截器 - 在發送請求前添加認證資訊等
api.interceptors.request.use(
  (config) => {
    console.log(`發送 API 請求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('請求攔截器錯誤:', error);
    return Promise.reject(error);
  }
);

// 回應攔截器 - 統一處理回應和錯誤
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API 回應成功: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API 回應錯誤:', error);
    
    // 統一錯誤處理
    if (error.response) {
      // 伺服器回應錯誤
      const { status, data } = error.response;
      console.error(`伺服器錯誤 ${status}:`, data);
    } else if (error.request) {
      // 網路錯誤
      console.error('網路錯誤:', error.request);
    } else {
      // 其他錯誤
      console.error('請求設定錯誤:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 工單 API 服務類別
export class TicketService {
  /**
   * 建立新工單
   * @param ticketData 工單資料
   * @returns Promise<ApiResponse<Ticket>>
   */
  static async createTicket(ticketData: CreateTicketRequest): Promise<ApiResponse<Ticket>> {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.error('建立工單失敗:', error);
      throw error;
    }
  }

  /**
   * 查詢工單列表
   * @param params 查詢參數
   * @returns Promise<ApiResponse<TicketListResponse>>
   */
  static async getTickets(params?: {
    status?: string;
    deviceId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<TicketListResponse>> {
    try {
      const response = await api.get('/tickets', { params });
      return response.data;
    } catch (error) {
      console.error('查詢工單列表失敗:', error);
      throw error;
    }
  }

  /**
   * 查詢單一工單詳情
   * @param id 工單 ID
   * @returns Promise<ApiResponse<Ticket>>
   */
  static async getTicket(id: string): Promise<ApiResponse<Ticket>> {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error('查詢工單詳情失敗:', error);
      throw error;
    }
  }

  /**
   * 更新工單
   * @param id 工單 ID
   * @param updateData 更新資料
   * @returns Promise<ApiResponse<Ticket>>
   */
  static async updateTicket(id: string, updateData: UpdateTicketRequest): Promise<ApiResponse<Ticket>> {
    try {
      const response = await api.put(`/tickets/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('更新工單失敗:', error);
      throw error;
    }
  }
}

export default api;

```

```typescript
import axios from 'axios';
import { 
  ProductionTarget, 
  CreateTargetRequest, 
  UpdateTargetRequest, 
  TargetListResponse,
  TicketSchedule,
  TicketScheduleWithRelations,
  CreateScheduleRequest,
  UpdateScheduleRequest
} from '../types/target';
import { ApiResponse } from '../types/ticket';

// 動態獲取 API URL（支援外部訪問）
const getApiBaseUrl = (): string => {
  // 優先使用環境變數
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 如果當前訪問地址不是 localhost，自動構建 API URL
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // 本機訪問，使用 localhost
    return 'http://localhost:5000/api';
  } else {
    // 外部訪問（使用 IP 地址），構建對應的 API URL
    return `http://${currentHost}:5000/api`;
  }
};

// 建立 axios 實例，設定基礎 URL
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 預生產目標 API 服務類別
export class TargetService {
  /**
   * 取得所有預生產目標列表
   * @param page 頁碼
   * @param limit 每頁數量
   * @param status 狀態篩選
   */
  static async getTargets(
    page: number = 1, 
    limit: number = 10, 
    status?: string
  ): Promise<ApiResponse<TargetListResponse>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });

      const response = await api.get(`/targets?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('取得預生產目標列表失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '取得預生產目標列表失敗',
      };
    }
  }

  /**
   * 取得單一預生產目標詳情
   * @param targetId 目標 ID
   */
  static async getTarget(targetId: string): Promise<ApiResponse<ProductionTarget>> {
    try {
      const response = await api.get(`/targets/${targetId}`);
      return response.data;
    } catch (error: any) {
      console.error('取得預生產目標詳情失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '取得預生產目標詳情失敗',
      };
    }
  }

  /**
   * 建立新的預生產目標
   * @param data 目標資料
   */
  static async createTarget(data: CreateTargetRequest): Promise<ApiResponse<ProductionTarget>> {
    try {
      const response = await api.post('/targets', data);
      return response.data;
    } catch (error: any) {
      console.error('建立預生產目標失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '建立預生產目標失敗',
      };
    }
  }

  /**
   * 更新預生產目標
   * @param targetId 目標 ID
   * @param data 更新資料
   */
  static async updateTarget(
    targetId: string, 
    data: UpdateTargetRequest
  ): Promise<ApiResponse<ProductionTarget>> {
    try {
      const response = await api.put(`/targets/${targetId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('更新預生產目標失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '更新預生產目標失敗',
      };
    }
  }

  /**
   * 刪除預生產目標
   * @param targetId 目標 ID
   */
  static async deleteTarget(targetId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/targets/${targetId}`);
      return response.data;
    } catch (error: any) {
      console.error('刪除預生產目標失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '刪除預生產目標失敗',
      };
    }
  }

  /**
   * 取得指定目標的工單排程
   * @param targetId 目標 ID
   */
  static async getTargetSchedules(targetId: string): Promise<ApiResponse<TicketSchedule[]>> {
    try {
      const response = await api.get(`/schedules/target/${targetId}`);
      return response.data;
    } catch (error: any) {
      console.error('取得工單排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '取得工單排程失敗',
      };
    }
  }

  /**
   * 取得指定日期的所有排程
   * @param date 日期 (格式: YYYY-MM-DD)
   */
  static async getSchedulesByDate(date: string): Promise<ApiResponse<TicketScheduleWithRelations[]>> {
    try {
      const response = await api.get(`/schedules?date=${date}&limit=1000`);
      if (response.data.success && response.data.data?.schedules) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.schedules,
        };
      }
      return {
        success: false,
        message: response.data.message || '取得今日排程失敗',
      };
    } catch (error: any) {
      console.error('取得今日排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '取得今日排程失敗',
      };
    }
  }

  /**
   * 建立工單排程
   * @param data 排程資料
   */
  static async createSchedule(data: CreateScheduleRequest): Promise<ApiResponse<TicketScheduleWithRelations>> {
    try {
      const response = await api.post('/schedules', data);
      return response.data;
    } catch (error: any) {
      console.error('建立工單排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '建立工單排程失敗',
      };
    }
  }

  /**
   * 更新工單排程
   * @param scheduleId 排程 ID
   * @param data 更新資料
   */
  static async updateSchedule(
    scheduleId: string, 
    data: UpdateScheduleRequest
  ): Promise<ApiResponse<TicketSchedule>> {
    try {
      const response = await api.put(`/schedules/${scheduleId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('更新工單排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '更新工單排程失敗',
      };
    }
  }

  /**
   * 刪除工單排程
   * @param scheduleId 排程 ID
   */
  static async deleteSchedule(scheduleId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/schedules/${scheduleId}`);
      return response.data;
    } catch (error: any) {
      console.error('刪除工單排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '刪除工單排程失敗',
      };
    }
  }
}

```

更新其他 API 服務文件：


```typescript
/**
 * 照片相關 API 服務
 * 處理照片上傳、查看、刪除等功能
 */

import axios from 'axios';

// 動態獲取 API URL（支援外部訪問）
const getApiBaseUrl = (): string => {
  // 優先使用環境變數
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 如果當前訪問地址不是 localhost，自動構建 API URL
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // 本機訪問，使用 localhost
    return 'http://localhost:5000/api';
  } else {
    // 外部訪問（使用 IP 地址），構建對應的 API URL
    return `http://${currentHost}:5000/api`;
  }
};

// API 基礎配置
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 秒超時（照片上傳可能需要更長時間）
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

// 照片介面
export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  uploadedAt: string;
  url: string;
}

// API 回應介面
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 照片列表回應介面
export interface PhotoListResponse {
  photos: Photo[];
}

/**
 * 照片服務類
 */
export class PhotoService {
  /**
   * 上傳照片
   * @param ticketId 工單ID
   * @param file 照片文件
   * @param description 照片描述
   */
  static async uploadPhoto(
    ticketId: string,
    file: File,
    description?: string
  ): Promise<ApiResponse<Photo>> {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('ticketId', ticketId);
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('上傳照片失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '上傳照片失敗',
      };
    }
  }

  /**
   * 獲取指定工單的所有照片
   * @param ticketId 工單ID
   */
  static async getTicketPhotos(ticketId: string): Promise<ApiResponse<Photo[]>> {
    try {
      const response = await api.get(`/photos/ticket/${ticketId}`);
      return response.data;
    } catch (error: any) {
      console.error('獲取照片列表失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '獲取照片列表失敗',
      };
    }
  }

  /**
   * 刪除照片
   * @param photoId 照片ID
   */
  static async deletePhoto(photoId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/photos/${photoId}`);
      return response.data;
    } catch (error: any) {
      console.error('刪除照片失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '刪除照片失敗',
      };
    }
  }

  /**
   * 獲取照片查看URL
   * @param photoId 照片ID
   */
  static getPhotoViewUrl(photoId: string): string {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/photos/${photoId}/view`;
  }
}

```

更新剩餘的 API 服務文件，並建立一個快速分享指南：


```typescript
import axios from 'axios';
import { ApiResponse } from '../types/ticket';

// 動態獲取 API URL（支援外部訪問）
const getApiBaseUrl = (): string => {
  // 優先使用環境變數
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 如果當前訪問地址不是 localhost，自動構建 API URL
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // 本機訪問，使用 localhost
    return 'http://localhost:5000/api';
  } else {
    // 外部訪問（使用 IP 地址），構建對應的 API URL
    return `http://${currentHost}:5000/api`;
  }
};

const API_BASE_URL = getApiBaseUrl();

// 版本資訊介面
export interface VersionInfo {
  version: string;
  buildNumber: string;
  releaseDate: string;
  changelog: ChangelogEntry[];
  features: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface VersionCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  clientVersion: string;
  latestChangelog: ChangelogEntry;
  updateAvailable: boolean;
}

/**
 * 版本服務類
 * 提供版本資訊、更新日誌和更新檢查功能
 */
class VersionService {
  /**
   * 獲取當前版本資訊
   * @returns Promise<ApiResponse<VersionInfo>>
   */
  async getVersionInfo(): Promise<ApiResponse<VersionInfo>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/version`);
      return response.data;
    } catch (error: any) {
      console.error('獲取版本資訊錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '獲取版本資訊失敗',
        data: undefined
      };
    }
  }

  /**
   * 獲取更新日誌
   * @returns Promise<ApiResponse<{changelog: ChangelogEntry[], currentVersion: string, buildNumber: string}>>
   */
  async getChangelog(): Promise<ApiResponse<{changelog: ChangelogEntry[], currentVersion: string, buildNumber: string}>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/version/changelog`);
      return response.data;
    } catch (error: any) {
      console.error('獲取更新日誌錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '獲取更新日誌失敗',
        data: undefined
      };
    }
  }

  /**
   * 檢查是否有更新
   * @param clientVersion 客戶端版本
   * @returns Promise<ApiResponse<VersionCheckResult>>
   */
  async checkForUpdates(clientVersion: string): Promise<ApiResponse<VersionCheckResult>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/version/check`, {
        params: { version: clientVersion }
      });
      return response.data;
    } catch (error: any) {
      console.error('檢查更新錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '檢查更新失敗',
        data: undefined
      };
    }
  }

  /**
   * 獲取本地版本資訊（從package.json）
   * @returns VersionInfo
   */
  getLocalVersionInfo(): VersionInfo {
    return {
      version: '1.2.0',
      buildNumber: '20241027-001',
      releaseDate: '2024-10-27',
      changelog: [
        {
          version: '1.2.0',
          date: '2024-10-27',
          changes: [
            '✨ 新增外部設備訪問功能',
            '🔧 修正Windows環境變數問題',
            '📱 支援手機/平板訪問',
            '🎨 優化智慧醫療藍白主題',
            '🖼️ 完善照片管理功能'
          ]
        }
      ],
      features: [
        '工單管理系統',
        '預生產目標管理', 
        '工單排程功能',
        '照片上傳管理',
        '外部設備訪問',
        '智慧醫療主題'
      ]
    };
  }
}

export default new VersionService();

```

```typescript
/**
 * 照片相關 API 服務
 * 處理照片上傳、查看、刪除等功能
 */

import axios from 'axios';

// 動態獲取 API URL（支援外部訪問）
const getApiBaseUrl = (): string => {
  // 優先使用環境變數
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 如果當前訪問地址不是 localhost，自動構建 API URL
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // 本機訪問，使用 localhost
    return 'http://localhost:5000/api';
  } else {
    // 外部訪問（使用 IP 地址），構建對應的 API URL
    return `http://${currentHost}:5000/api`;
  }
};

// API 基礎配置
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 秒超時（照片上傳可能需要更長時間）
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

// 照片介面
export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  uploadedAt: string;
  url: string;
}

// API 回應介面
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 照片列表回應介面
export interface PhotoListResponse {
  photos: Photo[];
}

/**
 * 照片服務類
 */
export class PhotoService {
  /**
   * 上傳照片
   * @param ticketId 工單ID
   * @param file 照片文件
   * @param description 照片描述
   */
  static async uploadPhoto(
    ticketId: string,
    file: File,
    description?: string
  ): Promise<ApiResponse<Photo>> {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('ticketId', ticketId);
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('上傳照片失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '上傳照片失敗',
      };
    }
  }

  /**
   * 獲取指定工單的所有照片
   * @param ticketId 工單ID
   */
  static async getTicketPhotos(ticketId: string): Promise<ApiResponse<Photo[]>> {
    try {
      const response = await api.get(`/photos/ticket/${ticketId}`);
      return response.data;
    } catch (error: any) {
      console.error('獲取照片列表失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '獲取照片列表失敗',
      };
    }
  }

  /**
   * 刪除照片
   * @param photoId 照片ID
   */
  static async deletePhoto(photoId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/photos/${photoId}`);
      return response.data;
    } catch (error: any) {
      console.error('刪除照片失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '刪除照片失敗',
      };
    }
  }

  /**
   * 獲取照片查看URL
   * @param photoId 照片ID
   */
  static getPhotoViewUrl(photoId: string): string {
    // 使用動態 API URL
    const apiBaseUrl = getApiBaseUrl();
    return `${apiBaseUrl}/photos/${photoId}/view`;
  }
}

```

建立快速分享指南：


```plaintext
╔══════════════════════════════════════════════════════════════╗
║         工單管理系統 - 快速分享給朋友指南                   ║
╚══════════════════════════════════════════════════════════════╝

📌 方法一：使用自動啟動腳本（最簡單，推薦！）
═══════════════════════════════════════════════════════════════

1. 雙擊運行：start-for-sharing.bat
2. 等待服務啟動（約 10-15 秒）
3. 腳本會顯示您的 IP 地址和分享網址
4. 將網址分享給朋友即可！

例如顯示：
  ┌─────────────────────────────────────────┐
  │ 📱 分享給朋友的訪問地址：                │
  │    前端網頁: http://192.168.0.186:3000  │
  │    後端API: http://192.168.0.186:5000  │
  └─────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════

📌 方法二：手動啟動
═══════════════════════════════════════════════════════════════

步驟 1：獲取您的 IP 地址
───────────────────────────────────────────────────────────────
  雙擊運行：get-ip.bat
  或手動查詢：ipconfig | findstr /i "IPv4"
  
  例如顯示：IPv4 地址 . . . . . . : 192.168.0.186

步驟 2：啟動服務
───────────────────────────────────────────────────────────────
  
  A. 啟動後端服務：
     打開命令提示字元，執行：
     cd server
     npm run dev
  
  B. 啟動前端服務（允許外部訪問）：
     打開新的命令提示字元，執行：
     cd client
     set HOST=0.0.0.0
     npm start

步驟 3：分享網址
───────────────────────────────────────────────────────────────
  將以下網址分享給朋友：
  http://您的IP地址:3000
  
  例如：http://192.168.0.186:3000

═══════════════════════════════════════════════════════════════

✅ 訪問條件
═══════════════════════════════════════════════════════════════

  必須滿足：
  ✓ 您的電腦和朋友的設備在同一 WiFi 網路
  ✓ 前端和後端服務都在運行
  ✓ Windows 防火牆允許 Node.js 訪問

═══════════════════════════════════════════════════════════════

🔧 如果朋友無法訪問（防火牆設定）
═══════════════════════════════════════════════════════════════

方法 1：通過控制台設定
───────────────────────────────────────────────────────────────
  1. 控制台 → 系統與安全性 → Windows Defender 防火牆
  2. 點擊「允許應用程式通過防火牆」
  3. 找到「Node.js」或「Node.exe」
  4. 勾選「私人網路」選項

方法 2：PowerShell（管理員權限）
───────────────────────────────────────────────────────────────
  New-NetFirewallRule -DisplayName "Node.js Server" `
    -Direction Inbound -Protocol TCP -LocalPort 3000,5000 `
    -Action Allow -Profile Private

方法 3：暫時關閉防火牆測試（僅測試用）
───────────────────────────────────────────────────────────────
  ⚠️ 僅用於測試，不建議長期使用

═══════════════════════════════════════════════════════════════

💡 提示
═══════════════════════════════════════════════════════════════

  • IP 地址可能會變：重新連接 WiFi 後記得重新檢查
  • 建議先在自己手機上測試（同一 WiFi）
  • 可以分享 API 文檔：server/API_COMPLETE.md
  • 詳細說明請查看：分享給朋友使用指南.md

═══════════════════════════════════════════════════════════════

📞 測試連線
═══════════════════════════════════════════════════════════════

  在朋友的設備瀏覽器中：
  1. 打開 http://您的IP:3000
  2. 如果看到工單管理系統頁面，表示成功！
  3. 如果無法連接，檢查：
     - 是否在同一 WiFi
     - 防火牆是否阻擋
     - 服務是否正在運行

═══════════════════════════════════════════════════════════════

祝您分享順利！🎉

```

已設定完成，可直接分享給朋友。以下是做法：

## 已完成的設定

1. **建立自動啟動腳本**：`start-for-sharing.bat`
   - 自動偵測 IP 地址
   - 自動設定環境變數
   - 顯示分享網址

2. **更新前端 API 服務**：自動偵測並使用正確的 API URL
   - 本機訪問時使用 `localhost`
   - 外部訪問時自動使用 IP 地址

3. **建立使用指南**：
   - `快速分享指南.txt` - 簡易快速指南
   - `分享給朋友使用指南.md` - 詳細說明文檔

## 如何分享給朋友

### 最簡單方法（推薦）

1. 雙擊運行：`start-for-sharing.bat`
2. 等待服務啟動完成
3. 腳本會顯示您的 IP 地址和分享網址，例如：
   ```
   📱 分享給朋友的訪問地址：
      前端網頁: http://192.168.0.186:3000
   ```
4. 將此網址分享給朋友即可

### 訪問條件

- 朋友的設備與您的電腦需在同一 WiFi 網路
- 服務正在運行中
- Windows 防火牆允許訪問（首次可能需要設定）

### 測試步驟

1. 先在您的手機上測試（連同一個 WiFi）：
   - 打開瀏覽器
   - 輸入：`http://您的IP:3000`
   - 若能正常使用，即可分享給朋友

2. 若無法訪問，檢查防火牆：
   - 控制台 → 系統與安全性 → Windows Defender 防火牆
   - 允許 Node.js 通過防火牆（私人網路）

## 您的當前 IP 地址

根據剛才的檢測，您的 IP 地址是：`192.168.0.186`

朋友可以通過以下網址訪問：
- 前端網頁：`http://192.168.0.186:3000`
- 後端 API：`http://192.168.0.186:5000`

現在可以雙擊運行 `start-for-sharing.bat` 啟動服務，然後分享網址給朋友測試。系統會自動處理外部訪問的 API 連接問題。

```plaintext
   📱 分享給朋友的訪問地址：
      前端網頁: http://192.168.0.186:3000
```

---

**User**

請檢查資料庫裡的資料

---

**Cursor**


檢查資料庫資料。先了解資料庫結構和位置。


建立查詢腳本，檢查資料庫內容：


```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║          資料庫內容檢查                                       ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // 1. 檢查工單 (Tickets)
    console.log('📋 工單資料 (Tickets)');
    console.log('──────────────────────────────────────────────────────────────');
    const tickets = await prisma.ticket.findMany({
      include: {
        schedules: true,
        photos: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`總數: ${tickets.length} 筆\n`);
    
    if (tickets.length > 0) {
      tickets.forEach((ticket, index) => {
        console.log(`${index + 1}. 工單 ID: ${ticket.id}`);
        console.log(`   設備 ID: ${ticket.deviceId}`);
        console.log(`   狀態: ${ticket.status}`);
        console.log(`   影像 ID: ${ticket.imageId || '(無)'}`);
        console.log(`   排程數: ${ticket.schedules.length}`);
        console.log(`   照片數: ${ticket.photos.length}`);
        console.log(`   建立時間: ${ticket.createdAt.toLocaleString('zh-TW')}`);
        console.log(`   更新時間: ${ticket.updatedAt.toLocaleString('zh-TW')}`);
        console.log('');
      });
    } else {
      console.log('  (無資料)\n');
    }

    // 2. 檢查生產目標 (ProductionTargets)
    console.log('🎯 生產目標資料 (ProductionTargets)');
    console.log('──────────────────────────────────────────────────────────────');
    const targets = await prisma.productionTarget.findMany({
      include: {
        schedules: {
          include: {
            ticket: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`總數: ${targets.length} 筆\n`);
    
    if (targets.length > 0) {
      targets.forEach((target, index) => {
        console.log(`${index + 1}. 目標 ID: ${target.id}`);
        console.log(`   名稱: ${target.name}`);
        console.log(`   描述: ${target.description || '(無)'}`);
        console.log(`   預計完成日期: ${target.expectedCompletionDate}`);
        console.log(`   狀態: ${target.status}`);
        console.log(`   排程數: ${target.schedules.length}`);
        console.log(`   建立時間: ${target.createdAt.toLocaleString('zh-TW')}`);
        console.log(`   更新時間: ${target.updatedAt.toLocaleString('zh-TW')}`);
        console.log('');
      });
    } else {
      console.log('  (無資料)\n');
    }

    // 3. 檢查工單排程 (TicketSchedules)
    console.log('📅 工單排程資料 (TicketSchedules)');
    console.log('──────────────────────────────────────────────────────────────');
    const schedules = await prisma.ticketSchedule.findMany({
      include: {
        ticket: true,
        target: true,
      },
      orderBy: [
        { scheduledDate: 'asc' },
        { scheduledTime: 'asc' },
      ]
    });
    console.log(`總數: ${schedules.length} 筆\n`);
    
    if (schedules.length > 0) {
      schedules.forEach((schedule, index) => {
        console.log(`${index + 1}. 排程 ID: ${schedule.id}`);
        console.log(`   工單 ID: ${schedule.ticketId}`);
        console.log(`   目標名稱: ${schedule.target.name}`);
        console.log(`   排程日期: ${schedule.scheduledDate}`);
        console.log(`   排程時間: ${schedule.scheduledTime || '(無)'}`);
        console.log(`   優先級: ${schedule.priority}`);
        console.log(`   狀態: ${schedule.status}`);
        console.log(`   建立時間: ${schedule.createdAt.toLocaleString('zh-TW')}`);
        console.log('');
      });
    } else {
      console.log('  (無資料)\n');
    }

    // 4. 檢查照片 (Photos)
    console.log('📷 照片資料 (Photos)');
    console.log('──────────────────────────────────────────────────────────────');
    const photos = await prisma.photo.findMany({
      include: {
        ticket: true,
      },
      orderBy: { uploadedAt: 'desc' }
    });
    console.log(`總數: ${photos.length} 筆\n`);
    
    if (photos.length > 0) {
      photos.forEach((photo, index) => {
        const fileSizeKB = (photo.fileSize / 1024).toFixed(2);
        console.log(`${index + 1}. 照片 ID: ${photo.id}`);
        console.log(`   工單 ID: ${photo.ticketId}`);
        console.log(`   原始檔名: ${photo.originalName}`);
        console.log(`   檔案大小: ${fileSizeKB} KB`);
        console.log(`   MIME 類型: ${photo.mimeType}`);
        console.log(`   描述: ${photo.description || '(無)'}`);
        console.log(`   上傳時間: ${photo.uploadedAt.toLocaleString('zh-TW')}`);
        console.log('');
      });
    } else {
      console.log('  (無資料)\n');
    }

    // 5. 統計摘要
    console.log('📊 資料統計摘要');
    console.log('──────────────────────────────────────────────────────────────');
    const ticketCount = await prisma.ticket.count();
    const targetCount = await prisma.productionTarget.count();
    const scheduleCount = await prisma.ticketSchedule.count();
    const photoCount = await prisma.photo.count();

    console.log(`工單總數: ${ticketCount}`);
    console.log(`生產目標總數: ${targetCount}`);
    console.log(`排程總數: ${scheduleCount}`);
    console.log(`照片總數: ${photoCount}`);
    console.log('');

    // 狀態統計
    const ticketStatusStats = await prisma.ticket.groupBy({
      by: ['status'],
      _count: true,
    });
    console.log('工單狀態分布:');
    ticketStatusStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count} 筆`);
    });
    console.log('');

    const targetStatusStats = await prisma.productionTarget.groupBy({
      by: ['status'],
      _count: true,
    });
    console.log('目標狀態分布:');
    targetStatusStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count} 筆`);
    });
    console.log('');

    const scheduleStatusStats = await prisma.ticketSchedule.groupBy({
      by: ['status'],
      _count: true,
    });
    console.log('排程狀態分布:');
    scheduleStatusStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat._count} 筆`);
    });
    console.log('');

    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║          資料檢查完成                                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('❌ 檢查資料庫時發生錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();

```

資料庫檢查完成。以下是目前資料庫的內容摘要：

## 資料庫內容摘要

### 📋 工單資料 (Tickets)
- 總數：9 筆
- 狀態：全部為 OPEN
- 涵蓋設備：AOI、Collect & Discard、Sub、Freeze、Thaw、Sub & Freeze、Chang Medium、TEST-001

### 🎯 生產目標資料 (ProductionTargets)
- 總數：5 筆
- 目標名稱：
  - DS6-8（預計完成：2026-03-27）
  - DS5（預計完成：2026-02-28）
  - DS3-6（預計完成：2025-10-30）
  - DS2-5（預計完成：2025-10-28）
  - DS1-2（預計完成：2026-01-31）
- 狀態：全部為 IN_PROGRESS

### 📅 工單排程資料 (TicketSchedules)
- 總數：11 筆
- 狀態分布：
  - COMPLETED：4 筆
  - IN_PROGRESS：1 筆
  - OPEN：6 筆
- 排程日期範圍：2025-10-28 至 2025-12-01
- 優先級分布：HIGH、MEDIUM、LOW

### 📷 照片資料 (Photos)
- 總數：3 筆
- 檔案大小：約 70 KB 至 395 KB
- 全部為 JPEG 格式

### 關鍵發現

1. 有 2 筆排程設定在 2025-11-02（今日排程功能可用）
2. 部分工單已上傳照片（3 筆）
3. 資料關聯正常，工單與目標的排程關係建立正確
4. 所有生產目標目前狀態為 IN_PROGRESS

需要更詳細的某個區塊資訊，或要執行特定的查詢或操作嗎？

---

**User**

11/2新增[今日排程]功能，請更新網頁版本資訊

---

**Cursor**


查看版本資訊相關檔案，確認目前的版本結構：


更新版本資訊，反映 11/2 新增的「今日排程」功能。計畫如下：


---

**User**

Implement the plan as specified. To-do's from the plan have already been created, do not create them again.

---

**Cursor**


更新版本資訊，反映 11/2 新增的「今日排程」功能。


```json
{
  "version": "1.3.0",
  "buildNumber": "20251102-001",
  "releaseDate": "2025-11-02",
  "changelog": [
    {
      "version": "1.3.0",
      "date": "2025-11-02",
      "changes": [
        "📅 新增今日排程功能",
        "🔄 優化排程查詢與顯示",
        "🎯 支援按日期篩選排程"
      ]
    },
    {
      "version": "1.2.0",
      "date": "2024-10-27",
      "changes": [
        "✨ 新增外部設備訪問功能",
        "🔧 修正Windows環境變數問題",
        "📱 支援手機/平板訪問",
        "🎨 優化智慧醫療藍白主題",
        "🖼️ 完善照片管理功能"
      ]
    },
    {
      "version": "1.1.0",
      "date": "2024-10-25",
      "changes": [
        "🎨 更新為智慧醫療藍白風格",
        "📸 新增工單照片上傳功能",
        "🔗 獨立照片管理頁面",
        "📋 完善工單類型顯示"
      ]
    },
    {
      "version": "1.0.0",
      "date": "2024-10-20",
      "changes": [
        "🚀 初始版本發布",
        "📝 基本工單管理功能",
        "🎯 預生產目標管理",
        "📅 工單排程功能"
      ]
    }
  ],
  "features": [
    "工單管理系統",
    "預生產目標管理", 
    "工單排程功能",
    "照片上傳管理",
    "外部設備訪問",
    "智慧醫療主題"
  ]
}

```

```json
{
  "version": "1.3.0",
  "buildNumber": "20251102-001",
  "releaseDate": "2025-11-02",
  "changelog": [
    {
      "version": "1.3.0",
      "date": "2025-11-02",
      "changes": [
        "📅 新增今日排程功能",
        "🔄 優化排程查詢與顯示",
        "🎯 支援按日期篩選排程"
      ]
    },
    {
      "version": "1.2.0",
      "date": "2024-10-27",
      "changes": [
        "✨ 新增外部設備訪問功能",
        "🔧 修正Windows環境變數問題",
        "📱 支援手機/平板訪問",
        "🎨 優化智慧醫療藍白主題",
        "🖼️ 完善照片管理功能"
      ]
    },
    {
      "version": "1.1.0",
      "date": "2024-10-25",
      "changes": [
        "🎨 更新為智慧醫療藍白風格",
        "📸 新增工單照片上傳功能",
        "🔗 獨立照片管理頁面",
        "📋 完善工單類型顯示"
      ]
    },
    {
      "version": "1.0.0",
      "date": "2024-10-20",
      "changes": [
        "🚀 初始版本發布",
        "📝 基本工單管理功能",
        "🎯 預生產目標管理",
        "📅 工單排程功能"
      ]
    }
  ],
  "features": [
    "工單管理系統",
    "預生產目標管理", 
    "工單排程功能",
    "今日排程功能",
    "照片上傳管理",
    "外部設備訪問",
    "智慧醫療主題"
  ]
}

```

```json
{
  "version": "1.3.0",
  "buildNumber": "20251102-001",
  "releaseDate": "2025-11-02",
  "changelog": [
    {
      "version": "1.3.0",
      "date": "2025-11-02",
      "changes": [
        "📅 新增今日排程功能",
        "🔄 優化排程查詢與顯示",
        "🎯 支援按日期篩選排程"
      ]
    },
    {
      "version": "1.2.0",
      "date": "2024-10-27",
      "changes": [
        "✨ 新增外部設備訪問功能",
        "🔧 修正Windows環境變數問題",
        "📱 支援手機/平板訪問",
        "🎨 優化智慧醫療藍白主題",
        "🖼️ 完善照片管理功能"
      ]
    },
    {
      "version": "1.1.0",
      "date": "2024-10-25",
      "changes": [
        "🎨 更新為智慧醫療藍白風格",
        "📸 新增工單照片上傳功能",
        "🔗 獨立照片管理頁面",
        "📋 完善工單類型顯示"
      ]
    },
    {
      "version": "1.0.0",
      "date": "2024-10-20",
      "changes": [
        "🚀 初始版本發布",
        "📝 基本工單管理功能",
        "🎯 預生產目標管理",
        "📅 工單排程功能"
      ]
    }
  ],
  "features": [
    "工單管理系統",
    "預生產目標管理", 
    "工單排程功能",
    "照片上傳管理",
    "外部設備訪問",
    "智慧醫療主題"
  ]
}

```

```json
{
  "version": "1.3.0",
  "buildNumber": "20251102-001",
  "releaseDate": "2025-11-02",
  "changelog": [
    {
      "version": "1.3.0",
      "date": "2025-11-02",
      "changes": [
        "📅 新增今日排程功能",
        "🔄 優化排程查詢與顯示",
        "🎯 支援按日期篩選排程"
      ]
    },
    {
      "version": "1.2.0",
      "date": "2024-10-27",
      "changes": [
        "✨ 新增外部設備訪問功能",
        "🔧 修正Windows環境變數問題",
        "📱 支援手機/平板訪問",
        "🎨 優化智慧醫療藍白主題",
        "🖼️ 完善照片管理功能"
      ]
    },
    {
      "version": "1.1.0",
      "date": "2024-10-25",
      "changes": [
        "🎨 更新為智慧醫療藍白風格",
        "📸 新增工單照片上傳功能",
        "🔗 獨立照片管理頁面",
        "📋 完善工單類型顯示"
      ]
    },
    {
      "version": "1.0.0",
      "date": "2024-10-20",
      "changes": [
        "🚀 初始版本發布",
        "📝 基本工單管理功能",
        "🎯 預生產目標管理",
        "📅 工單排程功能"
      ]
    }
  ],
  "features": [
    "工單管理系統",
    "預生產目標管理", 
    "工單排程功能",
    "今日排程功能",
    "照片上傳管理",
    "外部設備訪問",
    "智慧醫療主題"
  ]
}

```

```typescript
import axios from 'axios';
import { ApiResponse } from '../types/ticket';

// 動態獲取 API URL（支援外部訪問）
const getApiBaseUrl = (): string => {
  // 優先使用環境變數
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 如果當前訪問地址不是 localhost，自動構建 API URL
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // 本機訪問，使用 localhost
    return 'http://localhost:5000/api';
  } else {
    // 外部訪問（使用 IP 地址），構建對應的 API URL
    return `http://${currentHost}:5000/api`;
  }
};

const API_BASE_URL = getApiBaseUrl();

// 版本資訊介面
export interface VersionInfo {
  version: string;
  buildNumber: string;
  releaseDate: string;
  changelog: ChangelogEntry[];
  features: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface VersionCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  clientVersion: string;
  latestChangelog: ChangelogEntry;
  updateAvailable: boolean;
}

/**
 * 版本服務類
 * 提供版本資訊、更新日誌和更新檢查功能
 */
class VersionService {
  /**
   * 獲取當前版本資訊
   * @returns Promise<ApiResponse<VersionInfo>>
   */
  async getVersionInfo(): Promise<ApiResponse<VersionInfo>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/version`);
      return response.data;
    } catch (error: any) {
      console.error('獲取版本資訊錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '獲取版本資訊失敗',
        data: undefined
      };
    }
  }

  /**
   * 獲取更新日誌
   * @returns Promise<ApiResponse<{changelog: ChangelogEntry[], currentVersion: string, buildNumber: string}>>
   */
  async getChangelog(): Promise<ApiResponse<{changelog: ChangelogEntry[], currentVersion: string, buildNumber: string}>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/version/changelog`);
      return response.data;
    } catch (error: any) {
      console.error('獲取更新日誌錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '獲取更新日誌失敗',
        data: undefined
      };
    }
  }

  /**
   * 檢查是否有更新
   * @param clientVersion 客戶端版本
   * @returns Promise<ApiResponse<VersionCheckResult>>
   */
  async checkForUpdates(clientVersion: string): Promise<ApiResponse<VersionCheckResult>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/version/check`, {
        params: { version: clientVersion }
      });
      return response.data;
    } catch (error: any) {
      console.error('檢查更新錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '檢查更新失敗',
        data: undefined
      };
    }
  }

  /**
   * 獲取本地版本資訊（從package.json）
   * @returns VersionInfo
   */
  getLocalVersionInfo(): VersionInfo {
    return {
      version: '1.3.0',
      buildNumber: '20251102-001',
      releaseDate: '2025-11-02',
      changelog: [
        {
          version: '1.3.0',
          date: '2025-11-02',
          changes: [
            '📅 新增今日排程功能',
            '🔄 優化排程查詢與顯示',
            '🎯 支援按日期篩選排程'
          ]
        },
        {
          version: '1.2.0',
          date: '2024-10-27',
          changes: [
            '✨ 新增外部設備訪問功能',
            '🔧 修正Windows環境變數問題',
            '📱 支援手機/平板訪問',
            '🎨 優化智慧醫療藍白主題',
            '🖼️ 完善照片管理功能'
          ]
        }
      ],
      features: [
        '工單管理系統',
        '預生產目標管理', 
        '工單排程功能',
        '今日排程功能',
        '照片上傳管理',
        '外部設備訪問',
        '智慧醫療主題'
      ]
    };
  }
}

export default new VersionService();

```

已更新版本資訊，反映 11/2 新增的「今日排程」功能。

## 已完成的更新

1. **version.json** (根目錄)
   - 版本號：1.2.0 → 1.3.0
   - 建置編號：20241027-001 → 20251102-001
   - 發布日期：2024-10-27 → 2025-11-02
   - 新增版本 1.3.0 的更新日誌
   - 在功能列表中新增「今日排程功能」

2. **server/version.json**
   - 相同的更新內容

3. **client/src/services/versionApi.ts**
   - 更新 `getLocalVersionInfo()` 方法中的版本資訊
   - 包含版本號、建置編號、發布日期、更新日誌和功能列表

## 版本 1.3.0 更新內容

- 新增今日排程功能
- 優化排程查詢與顯示
- 支援按日期篩選排程

版本資訊已在三個檔案中同步更新。當使用者點擊「版本資訊」按鈕時，會看到新的版本 1.3.0 和相關更新內容。

---

**User**

Implement the plan as specified. To-do's from the plan have already been created, do not create them again.

---

**Cursor**


已完成所有更新。更新待辦清單，標記為已完成：


所有任務已完成。

## 完成狀態總結

所有版本資訊更新已完成：

1. **version.json** (根目錄) — 已更新
   - 版本號：1.3.0
   - 建置編號：20251102-001
   - 發布日期：2025-11-02
   - 新增更新日誌和功能列表

2. **server/version.json** — 已更新
   - 與根目錄版本同步

3. **client/src/services/versionApi.ts** — 已更新
   - `getLocalVersionInfo()` 方法已更新為最新版本資訊

當使用者開啟「版本資訊」對話框時，會看到：
- 版本：1.3.0
- 建置編號：20251102-001
- 發布日期：2025-11-02
- 更新日誌包含「今日排程功能」的說明
- 功能列表包含「今日排程功能」

所有檔案已同步，版本資訊已反映 11/2 新增的「今日排程」功能。

