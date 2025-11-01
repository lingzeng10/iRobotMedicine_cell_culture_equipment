import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  MenuItem,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  DeviceHub as DeviceIcon,
  Image as ImageIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { TicketService } from '../services/api';
import { Ticket, TicketStatus, UpdateTicketRequest } from '../types/ticket';
import { getStationDisplay, getTicketName } from '../utils/stationMapping';

// 工單詳情元件屬性介面
interface TicketDetailProps {
  open: boolean; // 對話框是否開啟
  ticketId?: string; // 工單 ID
  ticket?: Ticket; // 工單資料
  onClose: () => void; // 關閉對話框回調函數
  onUpdate?: (updatedTicket: Ticket) => void; // 更新工單回調函數
}

// 工單詳情元件
const TicketDetailMUI: React.FC<TicketDetailProps> = ({
  open,
  ticketId,
  ticket,
  onClose,
  onUpdate,
}) => {
  // 狀態管理
  const [ticketData, setTicketData] = useState<Ticket | null>(ticket || null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 編輯表單狀態
  const [editForm, setEditForm] = useState<UpdateTicketRequest>({
    status: ticket?.status,
  });

  // 表單驗證錯誤狀態
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  /**
   * 載入工單詳情
   */
  const loadTicketDetail = useCallback(async () => {
    if (!ticketId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await TicketService.getTicket(ticketId);

      if (response.success && response.data) {
        setTicketData(response.data);
        setEditForm({
          status: response.data.status,
        });
      } else {
        setError(response.message || '載入工單詳情失敗');
      }
    } catch (error: any) {
      console.error('載入工單詳情錯誤:', error);
      setError('載入工單詳情失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  /**
   * 處理工單更新
   * @param values 更新資料
   */
  const handleUpdate = async (values: UpdateTicketRequest) => {
    if (!ticketData) return;

    setLoading(true);
    setError(null);

    try {
      const response = await TicketService.updateTicket(ticketData.id, values);

      if (response.success && response.data) {
        setTicketData(response.data);
        setEditing(false);
        
        // 觸發更新回調
        if (onUpdate) {
          onUpdate(response.data);
        }
      } else {
        setError(response.message || '更新工單失敗');
      }
    } catch (error: any) {
      console.error('更新工單錯誤:', error);
      setError('更新工單失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 處理編輯模式切換
   */
  const handleEditToggle = () => {
    if (editing) {
      // 取消編輯，重置表單
      setEditForm({
        status: ticketData?.status,
      });
      setFormErrors({});
    }
    setEditing(!editing);
  };

  /**
   * 處理表單提交
   */
  const handleSubmit = () => {
    // 驗證表單
    const errors: { [key: string]: string } = {};
    if (!editForm.status) {
      errors.status = '請選擇工單狀態';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // 提交更新
    handleUpdate(editForm);
  };

  /**
   * 取得狀態顏色
   * @param status 工單狀態
   */
  const getStatusColor = (status: TicketStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case TicketStatus.OPEN:
        return 'info';
      case TicketStatus.CLOSED:
        return 'success';
      default:
        return 'default';
    }
  };

  /**
   * 取得狀態圖示
   * @param status 工單狀態
   */
  const getStatusIcon = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return <ScheduleIcon />;
      case TicketStatus.CLOSED:
        return <CheckCircleIcon />;
      default:
        return <ScheduleIcon />;
    }
  };

  /**
   * 取得狀態文字
   * @param status 工單狀態
   */
  const getStatusText = (status: TicketStatus): string => {
    switch (status) {
      case TicketStatus.OPEN:
        return '待處理';
      case TicketStatus.CLOSED:
        return '已關閉';
      default:
        return '未知狀態';
    }
  };

  /**
   * 處理對話框關閉
   */
  const handleClose = () => {
    if (!loading) {
      setEditing(false);
      setError(null);
      setFormErrors({});
      onClose();
    }
  };

  // 當對話框開啟且沒有工單資料時載入詳情
  useEffect(() => {
    if (open && ticketId && !ticket) {
      loadTicketDetail();
    } else if (open && ticket) {
      setTicketData(ticket);
      setEditForm({
        status: ticket.status,
      });
    }
  }, [open, ticketId, ticket, loadTicketDetail]);

  // 如果沒有工單資料，顯示載入中或錯誤
  if (!ticketData && !loading) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>工單詳情</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              無法載入工單資料
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>關閉</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown={loading}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              工單詳情
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {!editing ? (
                <Tooltip title="編輯工單">
                  <IconButton onClick={handleEditToggle} disabled={loading}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <>
                  <Tooltip title="儲存變更">
                    <IconButton onClick={handleSubmit} disabled={loading}>
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="取消編輯">
                    <IconButton onClick={handleEditToggle} disabled={loading}>
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              <Tooltip title="關閉">
                <IconButton onClick={handleClose} disabled={loading}>
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* 錯誤訊息 */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* 載入中 */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          )}

          {/* 工單詳情內容 */}
          {ticketData && !loading && (
            <Box>
              {/* 基本資訊卡片 */}
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    基本資訊
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <DeviceIcon color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        工單 ID:
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                      {ticketData.id}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <DeviceIcon color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        工單類型:
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {getTicketName(ticketData.deviceId)}
                    </Typography>

                    {ticketData.imageId && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            影像 ID:
                          </Typography>
                        </Box>
                        <Typography variant="body1">
                          {ticketData.imageId}
                        </Typography>
                      </>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ScheduleIcon color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        狀態:
                      </Typography>
                    </Box>
                    {editing ? (
                      <TextField
                        select
                        value={editForm.status}
                        onChange={(e) => setEditForm(prev => ({ 
                          ...prev, 
                          status: e.target.value as TicketStatus 
                        }))}
                        error={!!formErrors.status}
                        helperText={formErrors.status}
                        size="small"
                        sx={{ minWidth: 120 }}
                      >
                        <MenuItem value={TicketStatus.OPEN}>待處理</MenuItem>
                        <MenuItem value={TicketStatus.CLOSED}>已關閉</MenuItem>
                      </TextField>
                    ) : (
                      <Chip
                        icon={getStatusIcon(ticketData.status)}
                        label={getStatusText(ticketData.status)}
                        color={getStatusColor(ticketData.status)}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>

              {/* 時間資訊卡片 */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    時間資訊
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <CalendarIcon color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        建立時間:
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {dayjs(ticketData.createdAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TimeIcon color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        更新時間:
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {dayjs(ticketData.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            關閉
          </Button>
          {editing && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
            >
              {loading ? '儲存中...' : '儲存變更'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TicketDetailMUI;
