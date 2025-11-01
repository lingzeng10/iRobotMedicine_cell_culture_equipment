import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-tw';

import { CreateTargetRequest } from '../types/target';
import { TargetService } from '../services/targetApi';

// 新增預生產目標表單元件屬性介面
interface CreateTargetFormProps {
  open: boolean; // 對話框是否開啟
  onClose: () => void; // 關閉對話框回調函數
  onSuccess: (target: any) => void; // 成功建立回調函數
}

// 新增預生產目標表單元件
const CreateTargetForm: React.FC<CreateTargetFormProps> = ({ 
  open, 
  onClose, 
  onSuccess 
}) => {
  // 表單資料狀態
  const [formData, setFormData] = useState<CreateTargetRequest>({
    name: '',
    description: '',
    expectedCompletionDate: '',
  });

  // 表單驗證錯誤狀態
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 載入狀態
  const [loading, setLoading] = useState(false);

  // 錯誤訊息狀態
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * 處理表單欄位變更
   * @param field 欄位名稱
   * @param value 欄位值
   */
  const handleFieldChange = (field: keyof CreateTargetRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // 清除該欄位的錯誤訊息
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  /**
   * 處理日期變更
   * @param date 選中的日期
   */
  const handleDateChange = (date: Dayjs | null) => {
    const dateString = date ? date.format('YYYY-MM-DD') : '';
    handleFieldChange('expectedCompletionDate', dateString);
  };

  /**
   * 驗證表單
   * @returns 是否驗證通過
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // 驗證目標名稱
    if (!formData.name.trim()) {
      newErrors.name = '目標名稱不能為空';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '目標名稱至少需要2個字元';
    }

    // 驗證預計完成時間
    if (!formData.expectedCompletionDate) {
      newErrors.expectedCompletionDate = '預計完成時間不能為空';
    } else {
      const selectedDate = dayjs(formData.expectedCompletionDate);
      const today = dayjs().startOf('day');
      
      if (selectedDate.isBefore(today)) {
        newErrors.expectedCompletionDate = '預計完成時間不能早於今天';
      }
    }

    // 驗證描述長度
    if (formData.description && formData.description.length > 500) {
      newErrors.description = '描述不能超過500個字元';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 處理表單提交
   */
  const handleSubmit = async () => {
    // 清除之前的錯誤訊息
    setErrorMessage(null);

    // 驗證表單
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 呼叫 API 建立預生產目標
      const response = await TargetService.createTarget(formData);

      if (response.success && response.data) {
        // 成功建立，觸發成功回調
        onSuccess(response.data);
        
        // 重置表單
        setFormData({
          name: '',
          description: '',
          expectedCompletionDate: '',
        });
        setErrors({});
        
        // 關閉對話框
        onClose();
      } else {
        // 顯示錯誤訊息
        setErrorMessage(response.message || '建立預生產目標失敗');
      }
    } catch (error: any) {
      console.error('建立預生產目標錯誤:', error);
      setErrorMessage('建立預生產目標失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 處理對話框關閉
   */
  const handleClose = () => {
    if (!loading) {
      // 重置表單狀態
      setFormData({
        name: '',
        description: '',
        expectedCompletionDate: '',
      });
      setErrors({});
      setErrorMessage(null);
      
      // 關閉對話框
      onClose();
    }
  };

  /**
   * 處理取消按鈕點擊
   */
  const handleCancel = () => {
    handleClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        disableEscapeKeyDown={loading}
      >
        <DialogTitle>
          <Typography variant="h6" component="div">
            新增預生產目標
          </Typography>
          <Typography variant="body2" color="text.secondary">
            建立新的預生產目標，用於工單排程管理
          </Typography>
        </DialogTitle>

        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {/* 錯誤訊息顯示 */}
            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 目標名稱欄位 */}
              <TextField
                fullWidth
                label="目標名稱"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name || '請輸入預生產目標的名稱'}
                required
                disabled={loading}
                placeholder="例如：2024年Q1產品生產目標"
              />

              {/* 目標描述欄位 */}
              <TextField
                fullWidth
                label="目標描述"
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                error={!!errors.description}
                helperText={errors.description || '可選，描述此預生產目標的詳細內容'}
                multiline
                rows={3}
                disabled={loading}
                placeholder="描述此預生產目標的詳細內容、要求或注意事項..."
              />

              {/* 預計完成時間欄位 */}
              <DatePicker
                label="預計完成時間"
                value={formData.expectedCompletionDate ? dayjs(formData.expectedCompletionDate) : null}
                onChange={handleDateChange}
                minDate={dayjs().startOf('day')}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.expectedCompletionDate,
                    helperText: errors.expectedCompletionDate || '選擇此預生產目標的預計完成日期',
                    required: true,
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCancel}
            disabled={loading}
            color="inherit"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : undefined}
          >
            {loading ? '建立中...' : '建立目標'}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default CreateTargetForm;
