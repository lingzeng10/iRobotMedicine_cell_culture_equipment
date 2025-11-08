import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
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
    materialType: '',
    responsiblePerson: '',
    productionTarget: '',
    startCultureDate: '',
    generation: undefined,
    boxCount: undefined,
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
  const handleFieldChange = (field: keyof CreateTargetRequest, value: string | number | undefined) => {
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

    // 驗證收集原料種類
    if (formData.materialType && !['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'].includes(formData.materialType)) {
      newErrors.materialType = '收集原料種類必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5';
    }
    
    // 驗證負責人員
    if (formData.responsiblePerson && !['OP001', 'OP002', 'OP003'].includes(formData.responsiblePerson)) {
      newErrors.responsiblePerson = '負責人員必須為 OP001, OP002, 或 OP003';
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
          materialType: '',
          responsiblePerson: '',
          productionTarget: '',
          startCultureDate: '',
          generation: undefined,
          boxCount: undefined,
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
        materialType: '',
        responsiblePerson: '',
        productionTarget: '',
        startCultureDate: '',
        generation: undefined,
        boxCount: undefined,
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

              {/* 收集原料種類欄位 */}
              <TextField
                fullWidth
                select
                label="收集原料種類"
                value={formData.materialType || ''}
                onChange={(e) => handleFieldChange('materialType', e.target.value)}
                error={!!errors.materialType}
                helperText={errors.materialType || '可選，選擇收集原料種類'}
                disabled={loading}
              >
                <MenuItem value="022-02.4">022-02.4</MenuItem>
                <MenuItem value="022-02.1">022-02.1</MenuItem>
                <MenuItem value="SAM10">SAM10</MenuItem>
                <MenuItem value="CM2">CM2</MenuItem>
                <MenuItem value="AM5">AM5</MenuItem>
              </TextField>

              {/* 負責人員欄位 */}
              <TextField
                fullWidth
                select
                label="負責人員"
                value={formData.responsiblePerson || ''}
                onChange={(e) => handleFieldChange('responsiblePerson', e.target.value)}
                error={!!errors.responsiblePerson}
                helperText={errors.responsiblePerson || '可選，選擇負責人員'}
                disabled={loading}
              >
                <MenuItem value="OP001">OP001</MenuItem>
                <MenuItem value="OP002">OP002</MenuItem>
                <MenuItem value="OP003">OP003</MenuItem>
              </TextField>

              {/* 生產目標欄位 */}
              <TextField
                fullWidth
                label="生產目標"
                value={formData.productionTarget || ''}
                onChange={(e) => handleFieldChange('productionTarget', e.target.value)}
                error={!!errors.productionTarget}
                helperText={errors.productionTarget || '可選，例如：3L'}
                disabled={loading}
                placeholder="例如：3L"
              />

              {/* 起始培養日期欄位 */}
              <DatePicker
                label="起始培養日期"
                value={formData.startCultureDate ? dayjs(formData.startCultureDate) : null}
                onChange={(date: Dayjs | null) => {
                  if (date) {
                    handleFieldChange('startCultureDate', date.format('YYYY-MM-DD'));
                  } else {
                    handleFieldChange('startCultureDate', '');
                  }
                }}
                disabled={loading}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.startCultureDate,
                    helperText: errors.startCultureDate || '可選，選擇起始培養日期',
                  },
                }}
              />

              {/* 代數欄位 */}
              <TextField
                fullWidth
                type="number"
                label="代數"
                value={formData.generation || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                  handleFieldChange('generation', value);
                }}
                error={!!errors.generation}
                helperText={errors.generation || '可選，輸入代數'}
                disabled={loading}
                inputProps={{ min: 1 }}
                placeholder="例如：1"
              />

              {/* 盒數欄位 */}
              <TextField
                fullWidth
                type="number"
                label="盒數"
                value={formData.boxCount || ''}
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10);
                  handleFieldChange('boxCount', value);
                }}
                error={!!errors.boxCount}
                helperText={errors.boxCount || '可選，輸入盒數'}
                disabled={loading}
                inputProps={{ min: 1 }}
                placeholder="例如：1"
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
