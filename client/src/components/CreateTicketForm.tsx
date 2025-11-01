import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { TicketService } from '../services/api';
import { getAvailableDeviceIds, getTicketName } from '../utils/stationMapping';

interface CreateTicketFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (ticket: any) => void;
}

/**
 * 建立工單表單組件
 * 使用 MUI 組件提供建立新工單的功能
 */
const CreateTicketForm: React.FC<CreateTicketFormProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    deviceId: '',
    imageId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 獲取可用的設備ID列表
  const availableDeviceIds = getAvailableDeviceIds();

  /**
   * 處理表單輸入變化
   */
  const handleInputChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    // 清除錯誤訊息
    if (error) setError(null);
  };

  /**
   * 處理表單提交
   */
  const handleSubmit = async () => {
    // 驗證表單
    if (!formData.deviceId.trim()) {
      setError('請選擇工單類型');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await TicketService.createTicket(formData);

      if (response.success) {
        // 重置表單
        setFormData({
          deviceId: '',
          imageId: '',
        });

        // 執行成功回調
        if (onSuccess) {
          onSuccess(response.data);
        }

        // 關閉對話框
        onClose();
      } else {
        setError(response.message || '建立工單失敗');
      }
    } catch (err: any) {
      console.error('建立工單錯誤:', err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors.map((error: any) => error.msg).join(', ');
        setError(`驗證失敗: ${errorMessages}`);
      } else {
        setError('建立工單失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 處理關閉對話框
   */
  const handleClose = () => {
    if (!loading) {
      setFormData({
        deviceId: '',
        imageId: '',
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#2e2e2e',
          color: '#fff',
        },
      }}
    >
      <DialogTitle sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
        <AddIcon />
        建立新工單
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {/* 工單類型選擇 */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: '#bbb' }}>工單類型 *</InputLabel>
            <Select
              value={formData.deviceId}
              onChange={handleInputChange('deviceId')}
              label="工單類型 *"
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#444',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }}
            >
              {availableDeviceIds.map((deviceId) => (
                <MenuItem key={deviceId} value={deviceId}>
                  {getTicketName(deviceId)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* 影像ID輸入 */}
          <TextField
            fullWidth
            label="影像ID"
            value={formData.imageId}
            onChange={handleInputChange('imageId')}
            placeholder="請輸入影像ID（可選）"
            InputLabelProps={{ sx: { color: '#bbb' } }}
            InputProps={{
              sx: {
                color: '#fff',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: '#444',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ backgroundColor: '#2e2e2e' }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ color: '#bbb' }}
        >
          取消
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.deviceId.trim()}
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&:disabled': {
              backgroundColor: '#555',
              color: '#999',
            },
          }}
        >
          {loading ? '建立中...' : '建立工單'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTicketForm;
