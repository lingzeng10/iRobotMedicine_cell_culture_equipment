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
              <Typography variant="body2" color="text.secondary">
                目標：{selectedTarget.name}
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
