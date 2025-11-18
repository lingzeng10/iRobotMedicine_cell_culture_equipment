import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Paper,
  Divider,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { ProductionTarget, TargetStatus, CreateTargetRequest } from '../types/target';
import { TargetService } from '../services/targetApi';

// 預生產目標列表元件屬性介面
interface TargetListProps {
  targets: ProductionTarget[]; // 目標列表
  onTargetSelect: (target: ProductionTarget) => void; // 目標選擇回調函數
  selectedTargetId?: string; // 當前選中的目標 ID
  onTargetUpdate?: (targetId: string, updatedTarget: ProductionTarget) => void; // 目標更新回調函數
  onTargetDelete?: (targetId: string) => void; // 目標刪除回調函數
  onTargetCreate?: (newTarget: ProductionTarget) => void; // 目標新增回調函數
}

// 預生產目標列表元件
const TargetList: React.FC<TargetListProps> = ({ targets, onTargetSelect, selectedTargetId, onTargetUpdate, onTargetDelete, onTargetCreate }) => {
  // 狀態管理
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<ProductionTarget | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTargetId, setDeletingTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 新增目標表單狀態
  const [newTarget, setNewTarget] = useState<CreateTargetRequest>({
    name: '',
    materialType: '',
    responsiblePerson: '',
    expectedCompletionDate: '',
  });

  // 表單驗證狀態
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});


  /**
   * 處理目標選擇
   * @param target 選中的目標
   */
  const handleTargetSelect = (target: ProductionTarget) => {
    onTargetSelect(target);
  };

  /**
   * 處理新增目標
   */
  const handleCreateTarget = async () => {
    // 表單驗證
    const errors: { [key: string]: string } = {};
    if (!newTarget.name.trim()) {
      errors.name = '目標名稱不能為空';
    }
    if (!newTarget.expectedCompletionDate) {
      errors.expectedCompletionDate = '預計完成時間不能為空';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const response = await TargetService.createTarget(newTarget);

      if (response.success && response.data) {
        // 通知父組件新增目標成功
        if (onTargetCreate) {
          onTargetCreate(response.data);
        }
        setCreateDialogOpen(false);
        setNewTarget({ name: '', materialType: '', responsiblePerson: '', expectedCompletionDate: '' });
        setFormErrors({});
      } else {
        setError(response.message || '建立預生產目標失敗');
      }
    } catch (error) {
      console.error('建立預生產目標錯誤:', error);
      setError('建立預生產目標失敗，請稍後再試');
    }
  };

  /**
   * 處理刪除目標確認
   * @param targetId 目標 ID
   */
  const handleDeleteClick = (targetId: string) => {
    setDeletingTargetId(targetId);
    setDeleteDialogOpen(true);
  };

  /**
   * 處理刪除目標
   */
  const handleDeleteTarget = async () => {
    if (!deletingTargetId) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await TargetService.deleteTarget(deletingTargetId);

      if (response.success) {
        // 通知父組件刪除目標成功
        if (onTargetDelete) {
          onTargetDelete(deletingTargetId);
        }
        setDeleteDialogOpen(false);
        setDeletingTargetId(null);
      } else {
        setError(response.message || '刪除預生產目標失敗');
      }
    } catch (error) {
      console.error('刪除預生產目標錯誤:', error);
      setError('刪除預生產目標失敗，請稍後再試');
    } finally {
      setDeleting(false);
    }
  };

  /**
   * 取得狀態顏色
   * @param status 目標狀態
   */
  const getStatusColor = (status: TargetStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case TargetStatus.PLANNING:
        return 'info';
      case TargetStatus.IN_PROGRESS:
        return 'primary';
      case TargetStatus.COMPLETED:
        return 'success';
      case TargetStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  /**
   * 取得狀態圖示
   * @param status 目標狀態
   */
  const getStatusIcon = (status: TargetStatus) => {
    switch (status) {
      case TargetStatus.PLANNING:
        return <ScheduleIcon />;
      case TargetStatus.IN_PROGRESS:
        return <PlayArrowIcon />;
      case TargetStatus.COMPLETED:
        return <CheckCircleIcon />;
      case TargetStatus.CANCELLED:
        return <CancelIcon />;
      default:
        return <WarningIcon />;
    }
  };

  /**
   * 取得狀態文字
   * @param status 目標狀態
   */
  const getStatusText = (status: TargetStatus): string => {
    switch (status) {
      case TargetStatus.PLANNING:
        return '規劃中';
      case TargetStatus.IN_PROGRESS:
        return '進行中';
      case TargetStatus.COMPLETED:
        return '已完成';
      case TargetStatus.CANCELLED:
        return '已取消';
      default:
        return '未知狀態';
    }
  };


  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 標題列 */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="h2" gutterBottom>
            預生產目標
          </Typography>
          <Typography variant="body2" color="text.secondary">
            選擇目標查看工單排程
          </Typography>
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

        {/* 目標列表 */}
        {!loading && (
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <List>
              {targets.map((target) => (
                <ListItem key={target.id} disablePadding>
                  <ListItemButton
                    selected={selectedTargetId === target.id}
                    onClick={() => handleTargetSelect(target)}
                    sx={{
                      borderLeft: selectedTargetId === target.id ? 4 : 0,
                      borderLeftColor: 'primary.main',
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                      },
                    }}
                  >
                    <ListItemIcon>
                      {getStatusIcon(target.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" noWrap component="span">
                            {target.name}
                          </Typography>
                          <Chip
                            label={getStatusText(target.status)}
                            color={getStatusColor(target.status)}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box component="div">
                          <Typography variant="body2" color="text.secondary" noWrap component="span">
                            原料: {target.materialType || '未設定'} | 負責人: {target.responsiblePerson || '未指派'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" component="span" sx={{ display: 'block' }}>
                            預計完成: {dayjs(target.expectedCompletionDate).format('YYYY-MM-DD')}
                          </Typography>
                        </Box>
                      }
                      secondaryTypographyProps={{ component: 'div' }}
                    />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="編輯">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTarget(target);
                            setEditDialogOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="刪除">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(target.id);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>

            {/* 無目標時顯示 */}
            {targets.length === 0 && !loading && (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  尚無預生產目標
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  點擊右下角按鈕新增目標
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {/* 新增目標按鈕 */}
        <Fab
          color="primary"
          aria-label="新增預生產目標"
          sx={{ position: 'absolute', bottom: 16, right: 16 }}
          onClick={() => setCreateDialogOpen(true)}
        >
          <AddIcon />
        </Fab>

        {/* 新增目標對話框 */}
        <Dialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>新增預生產目標</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="目標名稱"
                value={newTarget.name}
                onChange={(e) => setNewTarget(prev => ({ ...prev, name: e.target.value }))}
                error={!!formErrors.name}
                helperText={formErrors.name}
                required
              />
              
              <TextField
                fullWidth
                select
                label="收集原料種類"
                value={newTarget.materialType || ''}
                onChange={(e) => setNewTarget(prev => ({ ...prev, materialType: e.target.value }))}
                error={!!formErrors.materialType}
                helperText={formErrors.materialType}
              >
                <MenuItem value="022-02.4">022-02.4</MenuItem>
                <MenuItem value="022-02.1">022-02.1</MenuItem>
                <MenuItem value="SAM10">SAM10</MenuItem>
                <MenuItem value="CM2">CM2</MenuItem>
                <MenuItem value="AM5">AM5</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                select
                label="負責人員"
                value={newTarget.responsiblePerson || ''}
                onChange={(e) => setNewTarget(prev => ({ ...prev, responsiblePerson: e.target.value }))}
                error={!!formErrors.responsiblePerson}
                helperText={formErrors.responsiblePerson}
              >
                <MenuItem value="OP001">OP001</MenuItem>
                <MenuItem value="OP002">OP002</MenuItem>
                <MenuItem value="OP003">OP003</MenuItem>
              </TextField>
              
              <DatePicker
                label="預計完成時間"
                value={newTarget.expectedCompletionDate ? dayjs(newTarget.expectedCompletionDate) : null}
                onChange={(date: Dayjs | null) => 
                  setNewTarget(prev => ({ 
                    ...prev, 
                    expectedCompletionDate: date ? date.format('YYYY-MM-DD') : '' 
                  }))
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!formErrors.expectedCompletionDate,
                    helperText: formErrors.expectedCompletionDate,
                    required: true,
                  },
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateTarget} variant="contained">
              建立
            </Button>
          </DialogActions>
        </Dialog>

        {/* 編輯目標對話框 */}
        <Dialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>編輯預生產目標</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="目標名稱"
                value={editingTarget?.name || ''}
                onChange={(e) => setEditingTarget(prev => prev ? { ...prev, name: e.target.value } : null)}
                required
              />
              
              <TextField
                fullWidth
                select
                label="收集原料種類"
                value={editingTarget?.materialType || ''}
                onChange={(e) => setEditingTarget(prev => prev ? { ...prev, materialType: e.target.value } : null)}
              >
                <MenuItem value="022-02.4">022-02.4</MenuItem>
                <MenuItem value="022-02.1">022-02.1</MenuItem>
                <MenuItem value="SAM10">SAM10</MenuItem>
                <MenuItem value="CM2">CM2</MenuItem>
                <MenuItem value="AM5">AM5</MenuItem>
              </TextField>
              
              <TextField
                fullWidth
                select
                label="負責人員"
                value={editingTarget?.responsiblePerson || ''}
                onChange={(e) => setEditingTarget(prev => prev ? { ...prev, responsiblePerson: e.target.value } : null)}
              >
                <MenuItem value="OP001">OP001</MenuItem>
                <MenuItem value="OP002">OP002</MenuItem>
                <MenuItem value="OP003">OP003</MenuItem>
              </TextField>
              
              <DatePicker
                label="預計完成時間"
                value={editingTarget?.expectedCompletionDate ? dayjs(editingTarget.expectedCompletionDate) : null}
                onChange={(date: Dayjs | null) => 
                  setEditingTarget(prev => prev ? ({ 
                    ...prev, 
                    expectedCompletionDate: date ? date.format('YYYY-MM-DD') : '' 
                  }) : null)
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />

              <TextField
                fullWidth
                select
                label="狀態"
                value={editingTarget?.status || 'PLANNING'}
                onChange={(e) => setEditingTarget(prev => prev ? { ...prev, status: e.target.value as any } : null)}
              >
                <MenuItem value="PLANNING">規劃中</MenuItem>
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
                 if (editingTarget) {
                   // 確保資料格式符合後端 API 驗證規則
                   const updateData: any = {};
                   
                   // 名稱：長度 2-100 字元
                   if (editingTarget.name && editingTarget.name.trim().length >= 2) {
                     updateData.name = editingTarget.name.trim();
                   }
                   
                    // 收集原料種類：可選，最大 200 字元
                    if (editingTarget.materialType !== undefined) {
                      updateData.materialType = editingTarget.materialType || null;
                    }
                    
                    // 負責人員：可選，OP001, OP002, OP003
                    if (editingTarget.responsiblePerson !== undefined) {
                      updateData.responsiblePerson = editingTarget.responsiblePerson || null;
                    }
                   
                   // 日期格式：YYYY-MM-DD
                   if (editingTarget.expectedCompletionDate) {
                     // 確保日期格式正確
                     const dateStr = editingTarget.expectedCompletionDate;
                     if (dateStr.includes('/')) {
                       // 轉換 YYYY/MM/DD 為 YYYY-MM-DD
                       updateData.expectedCompletionDate = dateStr.replace(/\//g, '-');
                     } else if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                       updateData.expectedCompletionDate = dateStr;
                     }
                   }
                   
                   // 狀態：PLANNING, IN_PROGRESS, COMPLETED, CANCELLED
                   if (editingTarget.status) {
                     // 確保狀態值正確
                     const statusMap: { [key: string]: string } = {
                       '規劃中': 'PLANNING',
                       '進行中': 'IN_PROGRESS', 
                       '已完成': 'COMPLETED',
                       '已取消': 'CANCELLED'
                     };
                     updateData.status = statusMap[editingTarget.status] || editingTarget.status;
                   }
                   
                   console.log('準備更新目標資料:', updateData);
                   console.log('原始編輯目標資料:', editingTarget);
                   console.log('日期格式檢查:', {
                     original: editingTarget.expectedCompletionDate,
                     formatted: updateData.expectedCompletionDate
                   });
                   console.log('狀態值檢查:', {
                     original: editingTarget.status,
                     formatted: updateData.status
                   });
                   console.log('API 呼叫參數:', {
                     id: editingTarget.id,
                     data: updateData
                   });
                   
                   try {
                     const response = await TargetService.updateTarget(editingTarget.id, updateData);
                    
                    if (response.success) {
                      // 通知父組件目標已更新
                      if (onTargetUpdate) {
                        onTargetUpdate(editingTarget.id, editingTarget);
                      }
                      
                      setEditDialogOpen(false);
                      setEditingTarget(null);
                    } else {
                      setError(response.message || '更新預生產目標失敗');
                    }
                  } catch (error) {
                    console.error('更新預生產目標錯誤:', error);
                    setError('更新預生產目標失敗，請稍後再試');
                  }
                }
              }} 
              variant="contained"
            >
              儲存
            </Button>
          </DialogActions>
        </Dialog>

        {/* 刪除確認對話框 */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => !deleting && setDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WarningIcon color="error" />
              <Typography variant="h6">確認刪除</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              確定要刪除這個預生產目標嗎？
            </Typography>
            <Alert severity="warning" sx={{ mt: 2 }}>
              刪除目標後，相關的工單排程也會一併刪除，此操作無法復原。
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              disabled={deleting}
              color="inherit"
            >
              取消
            </Button>
            <Button 
              onClick={handleDeleteTarget} 
              variant="contained" 
              color="error"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} /> : <DeleteIcon />}
            >
              {deleting ? '刪除中...' : '確認刪除'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default TargetList;
