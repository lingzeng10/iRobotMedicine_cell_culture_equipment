import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { MaterialService, MaterialRequest } from '../services/materialApi';
import { getTicketName, getStatusCustomColor } from '../utils/stationMapping';
import dayjs from 'dayjs';

const MaterialManagement: React.FC = () => {
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [updatingMaterial, setUpdatingMaterial] = useState<number | null>(null);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<MaterialRequest[]>([]);
  const [alertShownToday, setAlertShownToday] = useState(false); // 記錄今天是否已顯示過提醒

  useEffect(() => {
    loadMaterialRequests(true); // 首次載入時顯示提醒
  }, []);

  const loadMaterialRequests = async (showAlert: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await MaterialService.getMaterialRequests();
      if (response.success && response.data) {
        setMaterialRequests(response.data);
        
        // 只有在需要顯示提醒時才檢查
        if (showAlert && !alertShownToday) {
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
      } else {
        setError(response.message || '載入備料需求失敗');
      }
    } catch (err) {
      console.error('載入備料需求錯誤:', err);
      setError('載入備料需求失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'PENDING' | 'PREPARED' | 'CANCELLED') => {
    try {
      const response = await MaterialService.updateMaterialStatus(id, status);
      if (response.success) {
        await loadMaterialRequests(false); // 更新狀態時不顯示提醒
      } else {
        setError(response.message || '更新狀態失敗');
      }
    } catch (err) {
      console.error('更新狀態錯誤:', err);
      setError('更新狀態失敗，請稍後再試');
    }
  };

  const handleViewDetail = (request: MaterialRequest) => {
    setSelectedRequest(request);
    setDetailDialogOpen(true);
  };

  const handleMaterialCollect = async (materialIndex: number, collected: boolean) => {
    if (!selectedRequest) return;

    setUpdatingMaterial(materialIndex);
    setError(null);
    try {
      const response = await MaterialService.updateMaterialCollectedStatus(
        selectedRequest.id,
        materialIndex,
        collected
      );
      if (response.success && response.data) {
        // 更新選中的請求
        setSelectedRequest(response.data);
        // 重新載入備料需求列表，但不顯示提醒
        await loadMaterialRequests(false);
      } else {
        setError(response.message || '更新領料狀態失敗');
      }
    } catch (err) {
      console.error('更新領料狀態錯誤:', err);
      setError('更新領料狀態失敗，請稍後再試');
    } finally {
      setUpdatingMaterial(null);
    }
  };

  const handleBatchCalculate = async () => {
    if (!window.confirm('確定要為所有現有工單計算備料需求嗎？這可能會更新現有的備料需求。')) {
      return;
    }

    setBatchProcessing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await MaterialService.batchCalculateMaterials();
      if (response.success && response.data) {
        const { total, processed, created, updated, errors } = response.data;
        setSuccessMessage(
          `批量計算完成！總共 ${total} 個工單，成功處理 ${processed} 個（新增 ${created} 個，更新 ${updated} 個）${
            errors && errors.length > 0 ? `，${errors.length} 個失敗` : ''
          }`
        );
        // 重新載入備料需求列表，但不顯示提醒
        await loadMaterialRequests(false);
      } else {
        setError(response.message || '批量計算失敗');
      }
    } catch (err) {
      console.error('批量計算錯誤:', err);
      setError('批量計算失敗，請稍後再試');
    } finally {
      setBatchProcessing(false);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('確定要清空所有備料需求嗎？此操作無法復原。')) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await MaterialService.clearAllMaterials();
      if (response.success && response.data) {
        setSuccessMessage(`已清空 ${response.data.deletedCount} 個備料需求`);
        // 重新載入備料需求列表，但不顯示提醒
        await loadMaterialRequests(false);
      } else {
        setError(response.message || '清空備料需求失敗');
      }
    } catch (err) {
      console.error('清空備料需求錯誤:', err);
      setError('清空備料需求失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'PREPARED':
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  // 獲取備料狀態的自定義顏色（與工單狀態顏色一致）
  const getMaterialStatusCustomColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        // 待備料：使用未開始的黃色
        return '#F0F04D';
      case 'PREPARED':
        // 已備料：使用已完成的綠色
        return '#7BF04D';
      case 'CANCELLED':
        // 已取消：使用已取消的紅色
        return '#ff3366';
      default:
        return '#F0F04D';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '待領/待備料';
      case 'PREPARED':
        return '已領/已備料';
      case 'CANCELLED':
        return '已取消';
      default:
        return status;
    }
  };

  const materials = selectedRequest
    ? MaterialService.parseMaterials(selectedRequest.materials)
    : [];

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          備料系統
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={handleBatchCalculate}
            disabled={batchProcessing || loading}
          >
            {batchProcessing ? '處理中...' : '批量計算所有工單'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleClearAll}
            disabled={loading || batchProcessing || materialRequests.length === 0}
          >
            清空備料系統
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => loadMaterialRequests(false)}
            disabled={loading || batchProcessing}
          >
            重新整理
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {loading && materialRequests.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>生產目標</TableCell>
                <TableCell>工單ID</TableCell>
                <TableCell>工單類型</TableCell>
                <TableCell>狀態</TableCell>
                <TableCell>工單排程時程</TableCell>
                <TableCell>備料清單</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {materialRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      目前沒有備料需求
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                materialRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {request.ticket?.schedules?.[0]?.target?.name || '未指定'}
                    </TableCell>
                    <TableCell>{request.ticketId}</TableCell>
                    <TableCell>{getTicketName(request.deviceId)}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(request.status)}
                        size="small"
                        sx={{
                          backgroundColor: getMaterialStatusCustomColor(request.status),
                          color: '#000',
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {request.ticket?.schedules?.[0]?.scheduledDate
                        ? dayjs(request.ticket.schedules[0].scheduledDate).format('YYYY-MM-DD')
                        : '未排程'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetail(request)}
                        title="查看備料清單"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 詳情對話框 */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          備料需求詳情 - {selectedRequest && getTicketName(selectedRequest.deviceId)}
        </DialogTitle>
        <DialogContent>
          {materials.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              此工單無需備料
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>備料項目</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>領料狀態</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materials.map((material, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body1" component="span">
                              {material.name}
                            </Typography>
                            {material.type && (
                              <Chip label={`種類: ${material.type}`} size="small" variant="outlined" />
                            )}
                            {material.spec && (
                              <Chip label={`規格: ${material.spec}`} size="small" variant="outlined" />
                            )}
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {material.pending || material.quantity === null || material.quantity === undefined
                              ? '工單尚未設定完成'
                              : `數量: ${material.quantity} ${material.unit}`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleMaterialCollect(index, !material.collected)}
                          disabled={updatingMaterial === index}
                          sx={{
                            color: material.collected ? '#7BF04D' : '#4D99F0', // 已領料：綠色，未領料：系統藍色
                          }}
                          title={material.collected ? '已領料（點擊取消）' : '未領料（點擊確認）'}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>關閉</Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
};

export default MaterialManagement;

