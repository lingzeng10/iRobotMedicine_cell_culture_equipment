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
import { formatTicketDisplay, getStationDisplay, getTicketName, getAvailableDeviceIds } from '../utils/stationMapping';

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
  const [schedules, setSchedules] = useState<TicketScheduleWithRelations[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [todaySchedules, setTodaySchedules] = useState<TicketScheduleWithRelations[]>([]); // 今日排程資料
  const [loadingTodaySchedules, setLoadingTodaySchedules] = useState(false); // 今日排程載入狀態
  
  // 對話框狀態
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<TicketSchedule | TicketScheduleWithRelations | null>(null);
  const [todaySchedulesDialogOpen, setTodaySchedulesDialogOpen] = useState(false); // 今日排程對話框

  // 新增排程表單狀態
  const [newSchedule, setNewSchedule] = useState<CreateScheduleRequest>({
    ticketId: '',
    targetId: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'MEDIUM',
  });
  
  // 新增排程的工單類型選擇（用於新增排程對話框）
  const [newScheduleDeviceId, setNewScheduleDeviceId] = useState<string>('');

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
   * 載入今日排程（用於對話框）
   */
  const loadTodaySchedules = useCallback(async () => {
    setLoadingTodaySchedules(true);
    setError(null);

    try {
      // 取得今天的日期（格式: YYYY-MM-DD）
      const today = dayjs().format('YYYY-MM-DD');
      
      // 載入今日所有排程
      const response = await TargetService.getSchedulesByDate(today);
      
      if (response.success && response.data) {
        // 按優先順序排序：HIGH > MEDIUM > LOW，然後按時間排序
        const priorityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const sorted = response.data.sort((a, b) => {
          // 先按優先順序排序（降序）
          const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
          if (priorityDiff !== 0) return priorityDiff;
          
          // 如果優先順序相同，按時間排序
          const timeA = a.scheduledTime || '23:59';
          const timeB = b.scheduledTime || '23:59';
          return timeA.localeCompare(timeB);
        });
        
        setTodaySchedules(sorted);
        setTodaySchedulesDialogOpen(true);
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
      setLoadingTodaySchedules(false);
    }
  }, []);

  /**
   * 處理新增排程
   */
  const handleCreateSchedule = async () => {
    // 表單驗證
    const errors: { [key: string]: string } = {};
    if (!newScheduleDeviceId) {
      errors.ticketId = '請選擇工單類型';
    }
    if (!newSchedule.scheduledDate) {
      errors.scheduledDate = '請選擇排程日期';
    } else {
      // 檢查日期不能是今天之前
      const selectedDate = dayjs(newSchedule.scheduledDate);
      const today = dayjs().startOf('day');
      if (selectedDate.isBefore(today, 'day')) {
        errors.scheduledDate = '不能排程今日以前的工單，請選擇今日或未來的日期';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // 先創建一個新的工單（如果還沒有對應類型的工單）
      let ticketId = newSchedule.ticketId;
      
      // 如果沒有選擇已存在的工單，則創建一個新的工單
      if (!ticketId && newScheduleDeviceId) {
        const createTicketResponse = await TicketService.createTicket({
          deviceId: newScheduleDeviceId,
        });
        
        if (createTicketResponse.success && createTicketResponse.data) {
          ticketId = createTicketResponse.data.id;
          // 將新創建的工單添加到 tickets 列表中
          setTickets(prev => [...prev, createTicketResponse.data!]);
        } else {
          setError(createTicketResponse.message || '創建工單失敗');
          return;
        }
      }
      
      // 確保資料格式符合後端 API 驗證規則
      const scheduleData: any = {
        ticketId: ticketId,
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
      console.log('選擇的工單類型:', newScheduleDeviceId);
      
      const response = await TargetService.createSchedule(scheduleData);

      if (response.success && response.data) {
        setSchedules(prev => [...prev, response.data!]);
        
        // 如果新排程是今日的，且今日排程對話框已開啟，更新今日排程列表
        const today = dayjs().format('YYYY-MM-DD');
        if (todaySchedulesDialogOpen && response.data.scheduledDate === today) {
          const priorityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          setTodaySchedules(prev => {
            const updated = [...prev, response.data!];
            return updated.sort((a, b) => {
              const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
              if (priorityDiff !== 0) return priorityDiff;
              const timeA = a.scheduledTime || '23:59';
              const timeB = b.scheduledTime || '23:59';
              return timeA.localeCompare(timeB);
            });
          });
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
        setNewScheduleDeviceId('');
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
        // 更新今日排程列表（如果對話框開啟）
        setTodaySchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
        // 更新目標排程列表
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
    if (selectedTarget) {
    loadSchedules();
    }
  }, [selectedTarget, loadSchedules]);

  // 如果沒有選中目標，顯示提示訊息（但仍然渲染對話框）
  if (!selectedTarget) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
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

        {/* 今日排程對話框 - 必須在所有返回路徑中都能渲染 */}
        <Dialog
          open={todaySchedulesDialogOpen}
          onClose={() => setTodaySchedulesDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              maxHeight: '90vh',
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" component="div">
                  今日排程
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dayjs().format('YYYY年MM月DD日')} - 所有生產目標
                </Typography>
              </Box>
              <IconButton
                onClick={() => setTodaySchedulesDialogOpen(false)}
                size="small"
              >
                <CancelIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {loadingTodaySchedules ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : todaySchedules.length === 0 ? (
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {todaySchedules.map((schedule) => {
                  // 直接使用 schedule 中的 ticket 關係，如果沒有則從 tickets 中查找
                  const ticket = schedule.ticket || tickets.find(t => t.id === schedule.ticketId);
                  return (
                    <Card
                      key={schedule.id}
                      sx={{
                        borderLeft: 4,
                        borderLeftColor: getPriorityColor(schedule.priority) === 'error' ? 'error.main' :
                                        getPriorityColor(schedule.priority) === 'warning' ? 'warning.main' : 'info.main',
                        '&:hover': {
                          boxShadow: 3,
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => {
                        if (ticket) {
                          // 將 schedule.ticket 轉換為 Ticket 類型
                          const ticketData: Ticket = {
                            id: ticket.id,
                            deviceId: ticket.deviceId,
                            imageId: ticket.imageId,
                            status: ticket.status as any,
                            createdAt: ticket.createdAt,
                            updatedAt: ticket.updatedAt,
                          };
                          onTicketSelect(ticketData);
                          setTodaySchedulesDialogOpen(false);
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                              <Typography variant="h6" component="div">
                                {ticket ? getTicketName(ticket.deviceId) : '未知工單'}
                              </Typography>
                              <Chip
                                icon={getPriorityIcon(schedule.priority)}
                                label={getPriorityText(schedule.priority)}
                                color={getPriorityColor(schedule.priority)}
                                size="small"
                              />
                              <Chip
                                icon={getStatusIcon(schedule.status)}
                                label={getStatusText(schedule.status)}
                                color={getStatusColor(schedule.status)}
                                size="small"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                  生產目標：
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {schedule.target?.name || '未知目標'}
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
                            <Typography variant="body2" color="text.secondary">
                              Station: {ticket ? getStationDisplay(ticket.deviceId) : '未知'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="編輯排程">
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
                            </Tooltip>
                            <Tooltip title="刪除排程">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSchedule(schedule.id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTodaySchedulesDialogOpen(false)} variant="contained">
              關閉
            </Button>
          </DialogActions>
        </Dialog>
      </LocalizationProvider>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 標題列 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              工單排程
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<CalendarIcon />}
                onClick={loadTodaySchedules}
                size="small"
              >
                今日排程
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setNewScheduleDeviceId('');
                  setCreateDialogOpen(true);
                }}
                size="small"
              >
                新增排程
              </Button>
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
                  onClick={() => {
                  setNewScheduleDeviceId('');
                  setCreateDialogOpen(true);
                }}
                >
                  新增排程
                </Button>
              </Paper>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {schedules.map((schedule) => {
                  // 直接使用 schedule 中的 ticket 關係，如果沒有則從 tickets 中查找
                  const ticket = schedule.ticket || tickets.find(t => t.id === schedule.ticketId);
                  
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
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Station: {(() => {
                                  const ticket = schedule.ticket || tickets.find(t => t.id === schedule.ticketId);
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
                                  onClick={() => {
                                    if (ticket) {
                                      // 將 schedule.ticket 轉換為 Ticket 類型
                                      const ticketData: Ticket = {
                                        id: ticket.id,
                                        deviceId: ticket.deviceId,
                                        imageId: ticket.imageId,
                                        status: ticket.status as any,
                                        createdAt: ticket.createdAt,
                                        updatedAt: ticket.updatedAt,
                                      };
                                      onTicketSelect(ticketData);
                                    }
                                  }}
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
                              {/* 工單照片按鈕 - 只有AOI工單且在已完成狀態下才顯示，包含上傳和查看功能 */}
                              {(() => {
                                const ticket = schedule.ticket || tickets.find(t => t.id === schedule.ticketId);
                                // 只對AOI工單且在已完成狀態下顯示相機圖示
                                return ticket && ticket.deviceId === 'AOI' && schedule.status === 'COMPLETED' ? (
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
          onClose={() => {
            setCreateDialogOpen(false);
            setNewScheduleDeviceId('');
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>新增工單排程</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                select
                label="工單類型"
                value={newScheduleDeviceId}
                onChange={(e) => setNewScheduleDeviceId(e.target.value)}
                error={!!formErrors.ticketId}
                helperText={formErrors.ticketId || '請選擇要排程的工單類型'}
                required
              >
                {getAvailableDeviceIds().map((deviceId) => (
                  <MenuItem key={deviceId} value={deviceId}>
                    <Typography>
                      {getTicketName(deviceId)}
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
                minDate={dayjs().startOf('day')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.scheduledDate,
                    helperText: formErrors.scheduledDate || '只能選擇今日或未來的日期',
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
              {/* 工單類型選擇 */}
              <TextField
                fullWidth
                select
                label="工單類型"
                value={
                  editingSchedule && 'ticket' in editingSchedule
                    ? editingSchedule.ticket?.deviceId || ''
                    : ''
                }
                onChange={(e) => {
                  if (editingSchedule) {
                    const newDeviceId = e.target.value;
                    // 更新 editingSchedule 中的 ticket 的 deviceId
                    if ('ticket' in editingSchedule) {
                      setEditingSchedule({
                        ...editingSchedule,
                        ticket: {
                          ...(editingSchedule.ticket || { id: '', deviceId: '', status: 'OPEN', createdAt: '', updatedAt: '' }),
                          deviceId: newDeviceId,
                        },
                      });
                    } else {
                      // 如果沒有 ticket 關係，需要從 tickets 狀態中查找
                      const ticket = tickets.find(t => t.id === editingSchedule.ticketId);
                      if (ticket) {
                        setEditingSchedule({
                          ...editingSchedule,
                          ticket: {
                            ...ticket,
                            deviceId: newDeviceId,
                          },
                        } as TicketScheduleWithRelations);
                      }
                    }
                  }
                }}
                required
              >
                {getAvailableDeviceIds().map((deviceId) => (
                  <MenuItem key={deviceId} value={deviceId}>
                    <Typography>
                      {getTicketName(deviceId)}
                    </Typography>
                  </MenuItem>
                ))}
              </TextField>
              
              <DatePicker
                label="排程日期"
                value={editingSchedule?.scheduledDate ? dayjs(editingSchedule.scheduledDate) : null}
                onChange={(date: Dayjs | null) => 
                  setEditingSchedule(prev => prev ? ({ 
                    ...prev, 
                    scheduledDate: date ? date.format('YYYY-MM-DD') : '' 
                  }) : null)
                }
                minDate={dayjs().startOf('day')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                    helperText: '只能選擇今日或未來的日期',
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
                  // 驗證日期不能是今天之前
                  if (editingSchedule.scheduledDate) {
                    const selectedDate = dayjs(editingSchedule.scheduledDate);
                    const today = dayjs().startOf('day');
                    if (selectedDate.isBefore(today, 'day')) {
                      setError('不能排程今日以前的工單，請選擇今日或未來的日期');
                      return;
                    }
                  }
                  
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
                  
                  // 工單類型（deviceId）：如果修改了工單類型，需要更新對應的 ticket
                  if ('ticket' in editingSchedule && editingSchedule.ticket?.deviceId) {
                    updateData.deviceId = editingSchedule.ticket.deviceId;
                  } else if (!('ticket' in editingSchedule)) {
                    // 如果沒有 ticket 關係，從 tickets 狀態中查找
                    const ticket = tickets.find(t => t.id === editingSchedule.ticketId);
                    if (ticket && ticket.deviceId) {
                      updateData.deviceId = ticket.deviceId;
                    }
                  }
                  
                  console.log('準備更新排程資料:', updateData);
                  
                  try {
                    const response = await TargetService.updateSchedule(editingSchedule.id, updateData);
                    
                    if (response.success && response.data) {
                      setSchedules(prev => prev.map(schedule => {
                        if (schedule.id === editingSchedule.id) {
                          // 使用後端返回的最新資料（包含更新後的 ticket 和 target 關係）
                          // response.data 是 TicketSchedule，需要轉換為 TicketScheduleWithRelations
                          const updatedSchedule = response.data as any;
                          if (updatedSchedule.ticket && updatedSchedule.target) {
                            // 如果後端返回包含關係，直接使用
                            return updatedSchedule as TicketScheduleWithRelations;
                          }
                          // 否則保持原有的關係
                          return {
                            ...updatedSchedule,
                            ticket: schedule.ticket,
                            target: schedule.target,
                          } as TicketScheduleWithRelations;
                        }
                        return schedule;
                      }));
                      
                      // 如果目標狀態被自動更新為「進行中」，通知父組件
                      const updatedSchedule = response.data as any;
                      if (updatedSchedule.target && updatedSchedule.target.status === TargetStatus.IN_PROGRESS && onTargetUpdate) {
                        // 將 API 回應的 target 轉換為 ProductionTarget 類型
                        const updatedTarget: ProductionTarget = {
                          id: updatedSchedule.target.id,
                          name: updatedSchedule.target.name,
                          description: updatedSchedule.target.description,
                          expectedCompletionDate: updatedSchedule.target.expectedCompletionDate,
                          status: updatedSchedule.target.status,
                          createdAt: updatedSchedule.target.createdAt,
                          updatedAt: updatedSchedule.target.updatedAt,
                        };
                        onTargetUpdate(updatedSchedule.targetId || updatedSchedule.target.id, updatedTarget);
                      }
                      
                      // 如果今日排程對話框開啟，且該排程是今天的，更新今日排程列表
                      const today = dayjs().format('YYYY-MM-DD');
                      if (todaySchedulesDialogOpen && response.data.scheduledDate === today) {
                        const priorityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                        setTodaySchedules(prev => {
                          const updated = prev.map(schedule => {
                            if (schedule.id === editingSchedule.id) {
                              // 檢查是否有 ticket 和 target（來自 TicketScheduleWithRelations）
                              // 使用後端返回的最新資料（包含更新後的 ticket 和 target 關係）
                              const updatedSchedule = response.data as any;
                              if (updatedSchedule.ticket && updatedSchedule.target) {
                                // 如果後端返回包含關係，直接使用（這樣可以獲取更新後的 ticket.deviceId）
                                return updatedSchedule as TicketScheduleWithRelations;
                              }
                              // 否則保持原有的關係
                              const hasRelations = 'ticket' in schedule && 'target' in schedule;
                              if (hasRelations) {
                                return {
                                  ...updatedSchedule,
                                  ticket: (schedule as TicketScheduleWithRelations).ticket,
                                  target: (schedule as TicketScheduleWithRelations).target,
                                } as TicketScheduleWithRelations;
                              }
                              // 如果沒有關係資料，需要重新載入（這種情況不應該發生）
                              return schedule;
                            }
                            return schedule;
                          });
                          return updated.sort((a, b) => {
                            const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                            if (priorityDiff !== 0) return priorityDiff;
                            const timeA = a.scheduledTime || '23:59';
                            const timeB = b.scheduledTime || '23:59';
                            return timeA.localeCompare(timeB);
                          });
                        });
                      }
                      
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

        {/* 今日排程對話框 */}
        <Dialog
          open={todaySchedulesDialogOpen}
          onClose={() => setTodaySchedulesDialogOpen(false)}
          maxWidth="lg"
          fullWidth
          PaperProps={{
            sx: {
              maxHeight: '90vh',
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h6" component="div">
                  今日排程
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {dayjs().format('YYYY年MM月DD日')} - 所有生產目標
                </Typography>
              </Box>
              <IconButton
                onClick={() => setTodaySchedulesDialogOpen(false)}
                size="small"
              >
                <CancelIcon />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent dividers>
            {loadingTodaySchedules ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : todaySchedules.length === 0 ? (
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
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {todaySchedules.map((schedule) => {
                  // 直接使用 schedule 中的 ticket 關係，如果沒有則從 tickets 中查找
                  const ticket = schedule.ticket || tickets.find(t => t.id === schedule.ticketId);
                  return (
                    <Card
                      key={schedule.id}
                      sx={{
                        borderLeft: 4,
                        borderLeftColor: getPriorityColor(schedule.priority) === 'error' ? 'error.main' :
                                        getPriorityColor(schedule.priority) === 'warning' ? 'warning.main' : 'info.main',
                        '&:hover': {
                          boxShadow: 3,
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => {
                        if (ticket) {
                          // 將 schedule.ticket 轉換為 Ticket 類型
                          const ticketData: Ticket = {
                            id: ticket.id,
                            deviceId: ticket.deviceId,
                            imageId: ticket.imageId,
                            status: ticket.status as any,
                            createdAt: ticket.createdAt,
                            updatedAt: ticket.updatedAt,
                          };
                          onTicketSelect(ticketData);
                          setTodaySchedulesDialogOpen(false);
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                              <Typography variant="h6" component="div">
                                {ticket ? getTicketName(ticket.deviceId) : '未知工單'}
                              </Typography>
                              <Chip
                                icon={getPriorityIcon(schedule.priority)}
                                label={getPriorityText(schedule.priority)}
                                color={getPriorityColor(schedule.priority)}
                                size="small"
                              />
                              <Chip
                                icon={getStatusIcon(schedule.status)}
                                label={getStatusText(schedule.status)}
                                color={getStatusColor(schedule.status)}
                                size="small"
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                  生產目標：
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {schedule.target?.name || '未知目標'}
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
                            <Typography variant="body2" color="text.secondary">
                              Station: {ticket ? getStationDisplay(ticket.deviceId) : '未知'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="編輯排程">
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
                            </Tooltip>
                            <Tooltip title="刪除排程">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSchedule(schedule.id);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTodaySchedulesDialogOpen(false)} variant="contained">
              關閉
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TicketScheduleComponent;
