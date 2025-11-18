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
import { ProductionTarget, ProductionScheduleRow, TicketScheduleWithRelations } from './types/target';
import { Ticket } from './types/ticket';
import { TargetService } from './services/targetApi';
import { MaterialService, MaterialRequest } from './services/materialApi';
import { getTicketName } from './utils/stationMapping';
import dayjs from 'dayjs';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { Select, MenuItem, FormControl, InputLabel, Tabs, Tab } from '@mui/material';

// 匯入自定義元件
import CreateTargetForm from './components/CreateTargetForm';
import EditTargetForm from './components/EditTargetForm';
import TicketDetailMUI from './components/TicketDetailMUI';
import VersionDialog from './components/VersionDialog';
import AIAgentPanel from './components/AIAgentPanel';
import ProductionScheduleTable from './components/ProductionScheduleTable';
import TicketSchedule from './components/TicketSchedule';
import MaterialManagement from './components/MaterialManagement';

// 建立深色高科技主題
const medicalTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00d4ff', // 霓虹青色
      light: '#33ddff',
      dark: '#00a8cc',
      contrastText: '#000000',
    },
    secondary: {
      main: '#7c3aed', // 霓虹紫色
      light: '#9965f4',
      dark: '#5b21b6',
      contrastText: '#ffffff',
    },
    background: {
      default: '#0a0e27', // 深藍黑色
      paper: '#1a1f3a', // 深藍灰
    },
    text: {
      primary: '#e0e7ff', // 淺藍白
      secondary: '#a5b4fc', // 中藍灰
    },
    success: {
      main: '#00ff88', // 霓虹綠
      light: '#33ffa3',
      dark: '#00cc6a',
    },
    warning: {
      main: '#ffb800', // 霓虹黃
      light: '#ffc633',
      dark: '#cc9300',
    },
    error: {
      main: '#ff3366', // 霓虹紅
      light: '#ff5c85',
      dark: '#cc294d',
    },
    info: {
      main: '#00d4ff', // 霓虹青色（與 primary 相同）
      light: '#33ddff',
      dark: '#00a8cc',
    },
    divider: 'rgba(0, 212, 255, 0.12)',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#00d4ff',
      textShadow: '0 0 10px rgba(0, 212, 255, 0.5)',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#00d4ff',
      textShadow: '0 0 8px rgba(0, 212, 255, 0.4)',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#e0e7ff',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#e0e7ff',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#e0e7ff',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#e0e7ff',
    },
    body1: {
      fontSize: '1rem',
      color: '#e0e7ff',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#a5b4fc',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0f1629',
          backgroundImage: 'linear-gradient(135deg, #0f1629 0%, #1a1f3a 100%)',
          boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3), 0 0 40px rgba(0, 212, 255, 0.1)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
          color: '#ffffff',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1f3a',
          backgroundImage: 'linear-gradient(135deg, #1a1f3a 0%, #0f1629 100%)',
          boxShadow: '0 4px 20px rgba(0, 212, 255, 0.15), 0 0 40px rgba(0, 212, 255, 0.05)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: 12,
          '&:hover': {
            boxShadow: '0 6px 30px rgba(0, 212, 255, 0.25), 0 0 60px rgba(0, 212, 255, 0.1)',
            borderColor: 'rgba(0, 212, 255, 0.4)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
          transition: 'all 0.3s ease',
        },
        contained: {
          background: 'linear-gradient(135deg, #00d4ff 0%, #00a8cc 100%)',
          boxShadow: '0 4px 15px rgba(0, 212, 255, 0.4), 0 0 30px rgba(0, 212, 255, 0.2)',
          color: '#000000',
          '&:hover': {
            background: 'linear-gradient(135deg, #33ddff 0%, #00d4ff 100%)',
            boxShadow: '0 6px 20px rgba(0, 212, 255, 0.6), 0 0 40px rgba(0, 212, 255, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
        outlined: {
          borderColor: 'rgba(0, 212, 255, 0.5)',
          color: '#00d4ff',
          '&:hover': {
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0, 212, 255, 0.1)',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1a1f3a',
          backgroundImage: 'linear-gradient(135deg, #1a1f3a 0%, #0f1629 100%)',
          border: '1px solid rgba(0, 212, 255, 0.15)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#0f1629',
          backgroundImage: 'linear-gradient(180deg, #0f1629 0%, #1a1f3a 100%)',
          borderRight: '1px solid rgba(0, 212, 255, 0.2)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 212, 255, 0.15)',
        },
        head: {
          backgroundColor: '#0f1629',
          color: '#00d4ff',
          fontWeight: 700,
          textShadow: '0 0 8px rgba(0, 212, 255, 0.3)',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(0, 212, 255, 0.05)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(26, 31, 58, 0.5)',
            '& fieldset': {
              borderColor: 'rgba(0, 212, 255, 0.3)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(0, 212, 255, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#00d4ff',
              boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(0, 212, 255, 0.15)',
          color: '#00d4ff',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          '&:hover': {
            backgroundColor: 'rgba(0, 212, 255, 0.25)',
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.4)',
          },
        },
      },
    },
  },
});

// 主應用程式元件
const AppMUI: React.FC = () => {
  // 狀態管理
  const [targets, setTargets] = useState<ProductionTarget[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedScheduleStatus, setSelectedScheduleStatus] = useState<string | null>(null); // 保存選中的排程狀態
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null); // 保存選中的排程 ID
  const [createTargetDialogOpen, setCreateTargetDialogOpen] = useState(false);
  const [ticketDetailDialogOpen, setTicketDetailDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scheduleTableData, setScheduleTableData] = useState<ProductionScheduleRow[]>([]);
  const [exosomeScheduleTableData, setExosomeScheduleTableData] = useState<ProductionScheduleRow[]>([]); // 外泌體生產排程數據
  const [cellScheduleTableData, setCellScheduleTableData] = useState<ProductionScheduleRow[]>([]); // 細胞生產排程數據
  const [loadingTableData, setLoadingTableData] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<ProductionTarget | null>(null);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [todaySchedulesDialogOpen, setTodaySchedulesDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<ProductionTarget | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0); // 0: 外泌體生產排程表, 1: 細胞的生產排程
  const [activeView, setActiveView] = useState<'schedule' | 'materials'>('schedule'); // 主視圖：排程管理或備料系統
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month() + 1);
  const [cellSelectedYear, setCellSelectedYear] = useState<number>(dayjs().year());
  const [deleteTargetDialogOpen, setDeleteTargetDialogOpen] = useState(false);
  const [deletingTargetId, setDeletingTargetId] = useState<string | null>(null);
  const [deletingTarget, setDeletingTarget] = useState(false);
  const [cellSelectedMonth, setCellSelectedMonth] = useState<number>(dayjs().month() + 1);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<MaterialRequest[]>([]);
  const [alertShownToday, setAlertShownToday] = useState(false); // 記錄今天是否已顯示過提醒

  // 載入目標列表
  const loadTargets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await TargetService.getTargets(1, 100); // 載入所有目標

      if (response.success && response.data) {
        setTargets(response.data.targets);
        return response.data.targets; // 返回目標列表，供調用者使用
      } else {
        setError(response.message || '載入預生產目標失敗');
        return [];
      }
    } catch (error: any) {
      console.error('載入預生產目標錯誤:', error);
      setError('載入預生產目標失敗，請稍後再試');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // 元件載入時載入目標列表
  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  // 檢查當天待備料工單
  const checkTodayPendingMaterials = useCallback(async () => {
    // 如果今天已經顯示過提醒，不再顯示
    if (alertShownToday) return;
    
    try {
      const response = await MaterialService.getMaterialRequests();
      if (response.success && response.data) {
        // 獲取今天的日期（格式：YYYY-MM-DD）
        const today = dayjs().format('YYYY-MM-DD');
        
        // 檢查是否有當天待備料的工單
        const todayPendingRequests = response.data.filter(
          (req: MaterialRequest) => {
            // 狀態必須是 PENDING
            if (req.status !== 'PENDING') return false;
            
            // 檢查是否有排程日期
            const scheduledDate = req.ticket?.schedules?.[0]?.scheduledDate;
            if (!scheduledDate) return false;
            
            // 排程日期必須是今天
            const scheduleDateStr = dayjs(scheduledDate).format('YYYY-MM-DD');
            return scheduleDateStr === today;
          }
        );
        
        // 如果有當天待備料的工單，顯示提醒
        if (todayPendingRequests.length > 0) {
          setPendingCount(todayPendingRequests.length);
          setPendingRequests(todayPendingRequests);
          setAlertDialogOpen(true);
          setAlertShownToday(true); // 標記今天已顯示過提醒
        }
      }
    } catch (err) {
      console.error('檢查待備料工單錯誤:', err);
    }
  }, [alertShownToday]);

  // 當排程頁面載入時檢查待備料工單
  useEffect(() => {
    if (activeView === 'schedule') {
      checkTodayPendingMaterials();
    }
  }, [activeView, checkTodayPendingMaterials]);

  // 載入表格資料
  const loadScheduleTableData = useCallback(async (targetsToUse?: ProductionTarget[]) => {
    setLoadingTableData(true);
    try {
      // 使用傳入的目標列表，如果沒有則使用狀態中的目標列表
      const targetsList = targetsToUse || targets;
      
      // 載入所有目標的排程資料
      const allSchedules: TicketScheduleWithRelations[] = [];
      
      for (const target of targetsList) {
        try {
          const response = await TargetService.getTargetSchedules(target.id);
          if (response.success && response.data) {
            allSchedules.push(...response.data);
          }
        } catch (error) {
          console.error(`載入目標 ${target.id} 的排程失敗:`, error);
        }
      }

      // 轉換為表格資料格式
      const tableDataMap = new Map<string, ProductionScheduleRow>();

      // 按目標分組
      targetsList.forEach(target => {
        const targetSchedules = allSchedules.filter(s => s.targetId === target.id);
        
        // 計算實際產量（已完成工單數量）
        const completedCount = targetSchedules.filter(s => s.status === 'COMPLETED').length;
        
        // 找到起始培養日期（最早的排程日期）
        const startDate = targetSchedules.length > 0
          ? targetSchedules.reduce((earliest, s) => 
              dayjs(s.scheduledDate).isBefore(dayjs(earliest)) ? s.scheduledDate : earliest,
              targetSchedules[0].scheduledDate
            )
          : target.expectedCompletionDate;

        // 計算代數（根據排程數量估算，或從目標名稱提取）
        const generation = targetSchedules.length > 0 ? Math.floor(targetSchedules.length / 3) + 1 : 1;

        // 計算盒數（根據已完成工單估算）
        const boxCount = Math.max(1, Math.floor(completedCount / 2));

        // 建立日期映射（按日期分組排程）
        const datesMap: { [date: string]: { schedules?: TicketScheduleWithRelations[]; scheduleId?: string; status?: string; notes?: string; recoveryVolume?: string; actualRecoveryVolume?: string; workOrderType?: string } } = {};
        targetSchedules.forEach(schedule => {
          const date = schedule.scheduledDate;
          if (!datesMap[date]) {
            datesMap[date] = { schedules: [] };
          }
          if (!datesMap[date].schedules) {
            datesMap[date].schedules = [];
          }
          datesMap[date].schedules!.push(schedule);
          
          // 從工單中提取回收量資訊
          const ticket = schedule.ticket;
          if (ticket) {
            // 回收量：從 collectDiscardBoxCount 或 subcultureRecycledMediumType 等欄位提取
            let recoveryVolume = '';
            if (ticket.collectDiscardBoxCount) {
              recoveryVolume = `${ticket.collectDiscardBoxCount}`;
            } else if (ticket.subcultureRecycledMediumType && ticket.subcultureRecycledMediumType !== '不回收') {
              // 如果有回收培養液，可以從其他欄位推斷
              recoveryVolume = '';
            }
            
            // 實際回收量：暫時使用回收量，未來可以從其他欄位獲取
            const actualRecoveryVolume = recoveryVolume;
            
            // 工單類型
            const workOrderType = ticket.deviceId || '';
            
            // 設置日期欄位的資料
            if (!datesMap[date].recoveryVolume && recoveryVolume) {
              datesMap[date].recoveryVolume = recoveryVolume;
            }
            if (!datesMap[date].actualRecoveryVolume && actualRecoveryVolume) {
              datesMap[date].actualRecoveryVolume = actualRecoveryVolume;
            }
            if (!datesMap[date].workOrderType && workOrderType) {
              datesMap[date].workOrderType = workOrderType;
            }
          }
          
          // 保留向後兼容的字段
          const statusText = schedule.status === 'COMPLETED' ? '已完成' :
                           schedule.status === 'IN_PROGRESS' ? '進行中' : '規劃中';
          if (!datesMap[date].status) {
            datesMap[date].status = statusText;
          }
          if (!datesMap[date].notes) {
            datesMap[date].notes = schedule.ticket?.deviceId || '';
          }
          if (!datesMap[date].scheduleId) {
            datesMap[date].scheduleId = schedule.id;
          }
        });

        // 使用目標的生產目標欄位，如果沒有則從名稱提取（如 "DS1-3" -> "3L"）
        let productionTarget = target.productionTarget || '';
        if (!productionTarget) {
          const productionTargetMatch = target.name.match(/(\d+)L/i);
          productionTarget = productionTargetMatch ? `${productionTargetMatch[1]}L` : '';
        }

        // 使用目標的起始培養日期，如果沒有則使用最早的排程日期
        const startCultureDate = target.startCultureDate || startDate;

        // 使用目標的代數，如果沒有則計算
        const targetGeneration = target.generation || generation;

        // 使用目標的盒數，如果沒有則計算
        const targetBoxCount = target.boxCount || boxCount;

        tableDataMap.set(target.id, {
          id: target.id,
          cellName: target.name, // 細胞名稱（原生產目標名稱）
          productionTarget: productionTarget, // 生產目標（如 "3L"）
          actualProduction: `${completedCount}L`, // 實際即時產量（如 "1L"）
          startCultureDate: startCultureDate,
          generation: targetGeneration,
          boxCount: targetBoxCount,
          dates: datesMap,
        });
      });

      const allTableData = Array.from(tableDataMap.values());
      setScheduleTableData(allTableData);
      
      // 區分外泌體和細胞的排程數據
      // 目前：所有現有數據都視為外泌體，細胞排程為空
      // 未來可以根據 ProductionTarget 的某個字段（如 productionType）來過濾
      const exosomeData: ProductionScheduleRow[] = [];
      const cellData: ProductionScheduleRow[] = [];
      
      // 根據目標的 productionType 來區分外泌體和細胞
      allTableData.forEach(row => {
        const target = targetsList.find(t => t.id === row.id);
        if (target?.productionType === 'CELL') {
          // 如果生產類型是細胞，歸為細胞排程
          cellData.push(row);
        } else {
          // 默認為外泌體（包括 productionType 為 EXOSOME 或未設置的情況）
          exosomeData.push(row);
        }
      });
      
      setExosomeScheduleTableData(exosomeData);
      setCellScheduleTableData(cellData); // 目前為空數組
    } catch (error) {
      console.error('載入表格資料錯誤:', error);
      setError('載入表格資料失敗');
    } finally {
      setLoadingTableData(false);
    }
  }, [targets]);

  // 當目標列表更新時，載入表格資料
  useEffect(() => {
    if (targets.length > 0) {
      loadScheduleTableData();
    }
  }, [targets, loadScheduleTableData]);


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
  };

  /**
   * 處理目標新增
   * @param newTarget 新建立的目標
   */
  const handleTargetCreate = (newTarget: ProductionTarget) => {
    setTargets(prev => [...prev, newTarget]); // 將新目標添加到列表中
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
    // 關閉編輯對話框
    setEditingTarget(null);
    // 重新載入表格資料
    loadScheduleTableData();
  };

  /**
   * 處理編輯生產目標
   * @param targetId 目標 ID
   */
  const handleTargetEdit = (targetId: string) => {
    const target = targets.find(t => t.id === targetId);
    if (target) {
      setEditingTarget(target);
    }
  };

  /**
   * 處理目標刪除點擊（顯示確認對話框）
   * @param targetId 目標 ID
   */
  const handleTargetDeleteClick = (targetId: string) => {
    setDeletingTargetId(targetId);
    setDeleteTargetDialogOpen(true);
  };

  /**
   * 處理目標刪除確認
   */
  const handleTargetDelete = async () => {
    if (!deletingTargetId) return;

    setDeletingTarget(true);
    setError(null);

    try {
      const response = await TargetService.deleteTarget(deletingTargetId);

      if (response.success) {
        // 如果刪除的是當前選中的目標，清除選中狀態
        if (selectedTarget?.id === deletingTargetId) {
      setSelectedTarget(null);
        }
        
        // 如果刪除的是正在編輯的目標，關閉編輯對話框
        if (editingTarget?.id === deletingTargetId) {
          setEditingTarget(null);
        }
        
        // 關閉對話框
        setDeleteTargetDialogOpen(false);
        setDeletingTargetId(null);
        
        // 重新載入目標列表（確保數據一致性）
        const updatedTargets = await loadTargets();
        
        // 使用更新後的目標列表重新載入表格數據
        // 這樣可以確保使用最新的數據，而不依賴於狀態更新的時機
        // 即使目標列表為空（刪除最後一個目標），也要更新表格
        await loadScheduleTableData(updatedTargets || []);
      } else {
        setError(response.message || '刪除預生產目標失敗');
      }
    } catch (error: any) {
      console.error('刪除預生產目標錯誤:', error);
      setError('刪除預生產目標失敗，請稍後再試');
    } finally {
      setDeletingTarget(false);
    }
  };

  /**
   * 處理工單更新
   * @param updatedTicket 更新後的工單
   */
  const handleTicketUpdate = (updatedTicket: Ticket) => {
    setSelectedTicket(updatedTicket);
    // 觸發排程列表的重新載入，以反映工單狀態的變化（如確認排程）
    loadScheduleTableData();
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

  /**
   * 處理日期點擊（新增排程）
   */
  const handleDateClick = (targetId: string, date: string) => {
    const target = targets.find(t => t.id === targetId);
    if (target) {
      setSelectedTarget(target);
      setSelectedDate(date);
      setScheduleDialogOpen(true);
    }
  };

  /**
   * 處理排程更新（重新載入表格資料）
   */
  const handleScheduleUpdate = () => {
    loadScheduleTableData();
    // 排程更新後重新檢查待備料工單
    if (activeView === 'schedule') {
      checkTodayPendingMaterials();
    }
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
                <ListItemButton 
                  selected={activeView === 'schedule'}
                  onClick={() => setActiveView('schedule')}
                >
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText primary="排程管理" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton 
                  selected={activeView === 'materials'}
                  onClick={() => setActiveView('materials')}
                >
                  <ListItemIcon>
                    <InventoryIcon />
                  </ListItemIcon>
                  <ListItemText primary="備料系統" />
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
          
          <Box sx={{ display: 'flex', flex: 1, height: 'calc(100vh - 64px)', width: '100%', flexDirection: 'column' }}>
            {/* 根據 activeView 顯示不同內容 */}
            {activeView === 'materials' ? (
              <MaterialManagement />
            ) : (
              <>
                {/* 頁籤導航 */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ 
                      '& .MuiTab-root': {
                        color: 'text.secondary',
                        fontSize: '0.95rem',
                        fontWeight: 500,
                        textTransform: 'none',
                        minHeight: 48,
                        '&.Mui-selected': {
                          color: 'primary.main',
                          fontWeight: 600,
                        },
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: 'primary.main',
                      },
                    }}
                  >
                    <Tab label="外泌體生產排程表" />
                    <Tab label="細胞的生產排程" />
                  </Tabs>
                </Box>

                {/* 頁籤內容 */}
                <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      {loadingTableData ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      {/* 第一個頁籤：外泌體生產排程表 */}
                      {activeTab === 0 && (
                    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6">外泌體生產排程表</Typography>
                          {/* 年月選擇器 */}
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                              <InputLabel id="year-select-label">年</InputLabel>
                              <Select
                                labelId="year-select-label"
                                value={selectedYear}
                                label="年"
                                onChange={(e) => setSelectedYear(Number(e.target.value))}
                                sx={{
                                  backgroundColor: 'rgba(26, 31, 58, 0.5)',
                                  color: '#e0e7ff',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 212, 255, 0.3)',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 212, 255, 0.5)',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#00d4ff',
                                  },
                                }}
                              >
                                {Array.from({ length: 10 }, (_, i) => dayjs().year() - 2 + i).map((year) => (
                                  <MenuItem key={year} value={year}>
                                    {year}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                              <InputLabel id="month-select-label">月</InputLabel>
                              <Select
                                labelId="month-select-label"
                                value={selectedMonth}
                                label="月"
                                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                sx={{
                                  backgroundColor: 'rgba(26, 31, 58, 0.5)',
                                  color: '#e0e7ff',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 212, 255, 0.3)',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 212, 255, 0.5)',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#00d4ff',
                                  },
                                }}
                              >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                  <MenuItem key={month} value={month}>
                                    {month}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateTargetDialogOpen(true)}
                            color="primary"
                          >
                            新增生產目標
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<ScheduleIcon />}
                            onClick={() => setTodaySchedulesDialogOpen(true)}
                          >
                            今日工單
                          </Button>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <ProductionScheduleTable 
                          data={exosomeScheduleTableData}
                          selectedYear={selectedYear}
                          selectedMonth={selectedMonth}
                          onDateClick={handleDateClick}
                          onScheduleClick={(schedule) => {
                            if (schedule.ticket) {
                              setSelectedScheduleStatus(schedule.status); // 保存排程狀態
                              setSelectedScheduleId(schedule.id); // 保存排程 ID
                              handleTicketSelect(schedule.ticket as Ticket);
                            }
                          }}
                          onScheduleEdit={(schedule) => {
                            const target = targets.find(t => t.id === schedule.targetId);
                            if (target) {
                              setSelectedTarget(target);
                              setSelectedDate(schedule.scheduledDate);
                              setScheduleDialogOpen(true);
                            }
                          }}
                          onScheduleDelete={async (scheduleId) => {
                            try {
                              const response = await TargetService.deleteSchedule(scheduleId);
                              if (response.success) {
                                handleScheduleUpdate();
                              } else {
                                setError(response.message || '刪除工單排程失敗');
                              }
                            } catch (error: any) {
                              console.error('刪除工單排程錯誤:', error);
                              setError('刪除工單排程失敗，請稍後再試');
                            }
                          }}
                          onTargetEdit={handleTargetEdit}
                          onTargetDelete={handleTargetDeleteClick}
                        />
            </Box>
                    </Box>
                  )}

                  {/* 第二個頁籤：細胞的生產排程 */}
                  {activeTab === 1 && (
                    <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="h6">細胞的生產排程</Typography>
                          {/* 年月選擇器 */}
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                              <InputLabel id="cell-year-select-label">年</InputLabel>
                              <Select
                                labelId="cell-year-select-label"
                                value={cellSelectedYear}
                                label="年"
                                onChange={(e) => setCellSelectedYear(Number(e.target.value))}
                sx={{ 
                                  backgroundColor: 'rgba(26, 31, 58, 0.5)',
                                  color: '#e0e7ff',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 212, 255, 0.3)',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 212, 255, 0.5)',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#00d4ff',
                                  },
                                }}
                              >
                                {Array.from({ length: 10 }, (_, i) => dayjs().year() - 2 + i).map((year) => (
                                  <MenuItem key={year} value={year}>
                                    {year}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <FormControl size="small" sx={{ minWidth: 100 }}>
                              <InputLabel id="cell-month-select-label">月</InputLabel>
                              <Select
                                labelId="cell-month-select-label"
                                value={cellSelectedMonth}
                                label="月"
                                onChange={(e) => setCellSelectedMonth(Number(e.target.value))}
                                sx={{
                                  backgroundColor: 'rgba(26, 31, 58, 0.5)',
                                  color: '#e0e7ff',
                                  '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 212, 255, 0.3)',
                                  },
                                  '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(0, 212, 255, 0.5)',
                                  },
                                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: '#00d4ff',
                                  },
                                }}
                              >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                  <MenuItem key={month} value={month}>
                                    {month}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setCreateTargetDialogOpen(true)}
                            color="primary"
                          >
                            新增生產目標
                          </Button>
                          <Button
                            variant="outlined"
                            startIcon={<ScheduleIcon />}
                            onClick={() => setTodaySchedulesDialogOpen(true)}
                          >
                            今日工單
                          </Button>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, overflow: 'hidden' }}>
                        <ProductionScheduleTable 
                          data={cellScheduleTableData}
                          selectedYear={cellSelectedYear}
                          selectedMonth={cellSelectedMonth}
                          onDateClick={handleDateClick}
                          onScheduleClick={(schedule) => {
                            if (schedule.ticket) {
                              setSelectedScheduleStatus(schedule.status);
                              setSelectedScheduleId(schedule.id);
                              handleTicketSelect(schedule.ticket as Ticket);
                            }
                          }}
                          onScheduleEdit={(schedule) => {
                            const target = targets.find(t => t.id === schedule.targetId);
                            if (target) {
                              setSelectedTarget(target);
                              setSelectedDate(schedule.scheduledDate);
                              setScheduleDialogOpen(true);
                            }
                          }}
                          onScheduleDelete={async (scheduleId) => {
                            try {
                              const response = await TargetService.deleteSchedule(scheduleId);
                              if (response.success) {
                                handleScheduleUpdate();
                              } else {
                                setError(response.message || '刪除工單排程失敗');
                              }
                            } catch (error: any) {
                              console.error('刪除工單排程錯誤:', error);
                              setError('刪除工單排程失敗，請稍後再試');
                            }
                          }}
                          onTargetEdit={handleTargetEdit}
                          onTargetDelete={handleTargetDeleteClick}
                        />
            </Box>
                    </Box>
                      )}
                    </>
                  )}
                </Box>
              </>
            )}
          </Box>
        </Box>

        {/* 新增預生產目標對話框 */}
        <CreateTargetForm
          open={createTargetDialogOpen}
          onClose={() => setCreateTargetDialogOpen(false)}
          onSuccess={handleCreateTargetSuccess}
        />

        {/* 編輯生產目標對話框 */}
        <EditTargetForm
          open={editingTarget !== null}
          target={editingTarget}
          onClose={() => setEditingTarget(null)}
          onSuccess={handleTargetUpdate}
        />

        {/* 工單詳情對話框 */}
        <TicketDetailMUI
          open={ticketDetailDialogOpen}
          ticketId={selectedTicket?.id} // 優先使用 ticketId，確保從 API 重新載入完整資料（包含所有工單類型的詳細信息）
          ticket={selectedTicket || undefined} // 保留 ticket prop 作為備用
          {...(selectedScheduleStatus && { scheduleStatus: selectedScheduleStatus })} // 傳遞排程狀態
          {...(selectedScheduleId && { scheduleId: selectedScheduleId })} // 傳遞排程 ID
          onClose={() => {
            setTicketDetailDialogOpen(false);
            setSelectedTicket(null);
            setSelectedScheduleStatus(null); // 清除排程狀態
            setSelectedScheduleId(null); // 清除排程 ID
          }}
          onUpdate={handleTicketUpdate}
          onScheduleUpdate={handleScheduleUpdate} // 傳遞排程更新回調
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
              maxWidth: 500,
            }}
            onClose={() => setError(null)}
          >
            <Typography variant="body2" fontWeight="bold">
            {error}
            </Typography>
            {error.includes('無法連接到後端服務') && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                請確認：
                <br />1. 後端服務是否正在運行（端口 5000）
                <br />2. 檢查瀏覽器控制台（F12）查看詳細錯誤
              </Typography>
            )}
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

        {/* AI Agent 面板 */}
        <AIAgentPanel
          onTicketClick={(ticketId) => {
            // 當用戶點擊工單連結時，打開工單詳情
            setSelectedTicket({ id: ticketId } as Ticket);
            setTicketDetailDialogOpen(true);
          }}
        />

        {/* 排程管理對話框 */}
        {selectedTarget && scheduleDialogOpen && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setScheduleDialogOpen(false);
              setSelectedTarget(null);
              setSelectedDate('');
            }}
          >
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2,
                p: 3,
                maxWidth: '90%',
                maxHeight: '90%',
                overflow: 'auto',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                <IconButton
                  onClick={() => {
                    setScheduleDialogOpen(false);
                    setSelectedTarget(null);
                    setSelectedDate('');
                  }}
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              <TicketSchedule
                selectedTarget={selectedTarget}
                onTicketSelect={handleTicketSelect}
                onTargetUpdate={handleTargetUpdate}
                onTargetDelete={handleTargetDelete}
                onScheduleUpdate={() => {
                  handleScheduleUpdate();
                  // 排程更新後關閉對話框
                  setScheduleDialogOpen(false);
                  setSelectedTarget(null);
                  setSelectedDate('');
                }}
                initialDate={selectedDate}
              />
            </Box>
          </Box>
        )}

        {/* 今日工單對話框 - 使用 TicketSchedule 組件內部的今日排程對話框 */}
        <TicketSchedule
          selectedTarget={null}
          onTicketSelect={handleTicketSelect}
          onTargetUpdate={handleTargetUpdate}
          onTargetDelete={handleTargetDeleteClick}
          showTodaySchedules={todaySchedulesDialogOpen}
          onTodaySchedulesClose={() => setTodaySchedulesDialogOpen(false)}
        />

        {/* 當天待備料提醒視窗 */}
        <Dialog
          open={alertDialogOpen}
          onClose={() => setAlertDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Alert severity="warning" sx={{ flex: 1 }}>
                今日備料提醒
              </Alert>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2, mt: 2 }}>
              今天（{dayjs().format('YYYY-MM-DD')}）有 <strong>{pendingCount}</strong> 個工單尚未完成備料，請盡快處理。
            </Typography>
            {pendingRequests.length > 0 && (
              <Box sx={{ mt: 2, mb: 2 }}>
                <List dense>
                  {pendingRequests.map((request, index) => {
                    const targetName = request.ticket?.schedules?.[0]?.target?.name || '未指定';
                    const ticketType = getTicketName(request.deviceId);
                    return (
                      <React.Fragment key={request.id}>
                        <ListItem>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
                                  生產目標：{targetName}
                                </Typography>
                                <Typography variant="body2" component="span" color="text.secondary">
                                  | 工單類型：{ticketType}
                                </Typography>
                              </Box>
                            }
                            secondary={
                              <Typography variant="caption" color="text.secondary">
                                工單ID：{request.ticketId}
                              </Typography>
                            }
                          />
                        </ListItem>
                        {index < pendingRequests.length - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })}
                </List>
              </Box>
            )}
            <Typography variant="body2" color="text.secondary">
              請前往備料系統查看詳細資訊並完成備料作業。
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAlertDialogOpen(false)} variant="contained" color="primary">
              我知道了
            </Button>
          </DialogActions>
        </Dialog>

        {/* 刪除目標確認對話框 */}
        <Dialog
          open={deleteTargetDialogOpen}
          onClose={() => !deletingTarget && setDeleteTargetDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="error" />
              <Typography variant="h6">確認刪除生產目標</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mt: 1 }}>
              確定要刪除這個生產目標嗎？
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              刪除目標後，相關的工單排程也會一併刪除，此操作無法復原。
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteTargetDialogOpen(false)} 
              disabled={deletingTarget}
              color="inherit"
            >
              取消
            </Button>
            <Button 
              onClick={handleTargetDelete} 
              variant="contained" 
              color="error"
              disabled={deletingTarget}
              startIcon={deletingTarget ? <CircularProgress size={16} /> : <DeleteIcon />}
            >
              {deletingTarget ? '刪除中...' : '確認刪除'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default AppMUI;
