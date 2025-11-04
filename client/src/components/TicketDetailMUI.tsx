import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Tooltip,
  TextField,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  DeviceHub as DeviceIcon,
  Image as ImageIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
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
  // 注意：初始狀態使用 null，確保對話框開啟時從 API 重新載入最新資料
  const [ticketData, setTicketData] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 編輯表單狀態
  const [editForm, setEditForm] = useState<UpdateTicketRequest>({});

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
        console.log('載入工單詳情成功:', response.data);
        
        // 根據工單類型記錄相關欄位
        if (response.data.deviceId === 'AOI') {
          console.log('AOI工單欄位檢查:', {
            magnification: response.data.magnification,
            photoCount: response.data.photoCount,
          });
        } else if (response.data.deviceId === 'Thaw') {
          console.log('解凍工單欄位檢查:', {
            thawCellName: response.data.thawCellName,
            thawCellGeneration: response.data.thawCellGeneration,
            thawOriginalMediumType: response.data.thawOriginalMediumType,
            thawFreezeDate: response.data.thawFreezeDate,
            thawTubeCount: response.data.thawTubeCount,
            thawMediumType: response.data.thawMediumType,
            thawCultureBoxCount: response.data.thawCultureBoxCount,
          });
        } else if (response.data.deviceId === 'Sub') {
          console.log('繼代工單欄位檢查:', {
            subParentBoxCount: response.data.subParentBoxCount,
            subChildBoxCount: response.data.subChildBoxCount,
            subMediumType: response.data.subMediumType,
            subRecycledMediumType: response.data.subRecycledMediumType,
          });
        } else if (response.data.deviceId === 'Collect & Discard') {
          console.log('回收/丟棄工單欄位檢查:', {
            collectDiscardBoxCount: response.data.collectDiscardBoxCount,
            collectDiscardRecycledMediumType: response.data.collectDiscardRecycledMediumType,
          });
        }
        
        console.log('設置 ticketData 前，當前 ticketData:', ticketData);
        console.log('設置 ticketData 為:', response.data);
        console.log('magnification 值:', response.data.magnification, '類型:', typeof response.data.magnification);
        setTicketData(response.data);
        setEditForm({});
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
   * 過濾更新資料，只包含與當前工單類型相關的欄位
   */
  const filterUpdateData = (data: UpdateTicketRequest, deviceId: string): UpdateTicketRequest => {
    const filtered: UpdateTicketRequest = {};
    
    // 根據工單類型只保留相關欄位
    if (deviceId === 'AOI') {
      if (data.magnification !== undefined) filtered.magnification = data.magnification;
      if (data.photoCount !== undefined) filtered.photoCount = data.photoCount;
    } else if (deviceId === 'Chang Medium') {
      if (data.mediumType !== undefined) filtered.mediumType = data.mediumType;
      if (data.recycledMediumType !== undefined) filtered.recycledMediumType = data.recycledMediumType;
    } else if (deviceId === 'Sub & Freeze') {
      if (data.parentBoxCount !== undefined) filtered.parentBoxCount = data.parentBoxCount;
      if (data.childBoxCount !== undefined) filtered.childBoxCount = data.childBoxCount;
      if (data.subcultureMediumType !== undefined) filtered.subcultureMediumType = data.subcultureMediumType;
      if (data.subcultureRecycledMediumType !== undefined) filtered.subcultureRecycledMediumType = data.subcultureRecycledMediumType;
      if (data.frozenCellBoxCount !== undefined) filtered.frozenCellBoxCount = data.frozenCellBoxCount;
      if (data.frozenTubeSpec !== undefined) filtered.frozenTubeSpec = data.frozenTubeSpec;
      if (data.frozenMediumType !== undefined) filtered.frozenMediumType = data.frozenMediumType;
      if (data.frozenTubeCount !== undefined) filtered.frozenTubeCount = data.frozenTubeCount;
    } else if (deviceId === 'Thaw') {
      if (data.thawCellName !== undefined) filtered.thawCellName = data.thawCellName;
      if (data.thawCellGeneration !== undefined) filtered.thawCellGeneration = data.thawCellGeneration;
      if (data.thawOriginalMediumType !== undefined) filtered.thawOriginalMediumType = data.thawOriginalMediumType;
      if (data.thawFreezeDate !== undefined) filtered.thawFreezeDate = data.thawFreezeDate;
      if (data.thawTubeCount !== undefined) filtered.thawTubeCount = data.thawTubeCount;
      if (data.thawMediumType !== undefined) filtered.thawMediumType = data.thawMediumType;
      if (data.thawCultureBoxCount !== undefined) filtered.thawCultureBoxCount = data.thawCultureBoxCount;
    } else if (deviceId === 'Freeze') {
      if (data.freezeBoxCount !== undefined) filtered.freezeBoxCount = data.freezeBoxCount;
      if (data.freezeTubeCount !== undefined) filtered.freezeTubeCount = data.freezeTubeCount;
      if (data.freezeTubeSpec !== undefined) filtered.freezeTubeSpec = data.freezeTubeSpec;
      if (data.freezeMediumType !== undefined) filtered.freezeMediumType = data.freezeMediumType;
    } else if (deviceId === 'Sub') {
      if (data.subParentBoxCount !== undefined) filtered.subParentBoxCount = data.subParentBoxCount;
      if (data.subChildBoxCount !== undefined) filtered.subChildBoxCount = data.subChildBoxCount;
      if (data.subMediumType !== undefined) filtered.subMediumType = data.subMediumType;
      if (data.subRecycledMediumType !== undefined) filtered.subRecycledMediumType = data.subRecycledMediumType;
    } else if (deviceId === 'Collect & Discard') {
      if (data.collectDiscardBoxCount !== undefined) filtered.collectDiscardBoxCount = data.collectDiscardBoxCount;
      if (data.collectDiscardRecycledMediumType !== undefined) filtered.collectDiscardRecycledMediumType = data.collectDiscardRecycledMediumType;
    }
    
    return filtered;
  };

  /**
   * 處理工單更新
   * @param values 更新資料
   */
  const handleUpdate = async (values: UpdateTicketRequest) => {
    if (!ticketData) return;

    setLoading(true);
    setError(null);

    try {
      // 過濾更新資料，只包含與當前工單類型相關的欄位
      const filteredValues = filterUpdateData(values, ticketData.deviceId);
      console.log('發送更新請求，工單類型:', ticketData.deviceId);
      console.log('過濾後的更新資料:', filteredValues);
      
      const response = await TicketService.updateTicket(ticketData.id, filteredValues);

      if (response.success && response.data) {
        console.log('更新成功，返回的資料:', response.data);
        setTicketData(response.data);
        setEditing(false);
        setEditForm({}); // 重置表單，確保下次編輯時能正確初始化
        setFormErrors({}); // 清除驗證錯誤
        
        // 觸發更新回調
        if (onUpdate) {
          onUpdate(response.data);
        }
        
        // 強制重新載入資料，確保獲取最新且完整的資料（包括所有欄位）
        if (ticketId) {
          setTimeout(() => {
            console.log('強制重新載入工單詳情...');
            loadTicketDetail();
          }, 200);
        }
      } else {
        setError(response.message || '更新工單失敗');
      }
    } catch (error: any) {
      console.error('更新工單錯誤:', error);
      
      // 提供更詳細的錯誤訊息
      let errorMessage = '更新工單失敗，請稍後再試';
      
      if (error.code === 'ERR_CONNECTION_REFUSED' || error.message?.includes('ERR_CONNECTION_REFUSED')) {
        errorMessage = '無法連接到後端服務，請確認後端服務正在運行（端口 5000）';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = '連接被拒絕，請確認後端服務正在運行';
      } else if (error.response) {
        // 伺服器回應了錯誤
        const { status, data } = error.response;
        if (status === 400) {
          // 處理驗證錯誤
          if (data?.errors && Array.isArray(data.errors)) {
            const errorMessages = data.errors.map((err: any) => err.msg || err.message).join(', ');
            errorMessage = `輸入資料驗證失敗: ${errorMessages}`;
          } else {
            errorMessage = data?.message || '輸入資料驗證失敗';
          }
          console.error('驗證錯誤詳情:', data);
        } else if (status === 404) {
          errorMessage = '找不到指定的工單';
        } else if (status === 500) {
          errorMessage = data?.message || '伺服器錯誤，請查看後端服務日誌';
          console.error('伺服器錯誤詳情:', data);
        } else {
          errorMessage = data?.message || `更新失敗 (HTTP ${status})`;
        }
      } else if (error.request) {
        // 請求已發送但沒有收到回應
        errorMessage = '後端服務無回應，請確認後端服務正在運行';
      }
      
      setError(errorMessage);
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
      setEditForm({});
      setFormErrors({});
    } else {
      // 進入編輯模式，初始化表單（只包含有值的欄位，避免發送 undefined）
      if (ticketData) {
        const initialForm: UpdateTicketRequest = {};
        
        // 只添加有值的欄位
        if (ticketData.magnification !== undefined && ticketData.magnification !== null) initialForm.magnification = ticketData.magnification;
        if (ticketData.photoCount !== undefined && ticketData.photoCount !== null) initialForm.photoCount = ticketData.photoCount;
        if (ticketData.mediumType !== undefined && ticketData.mediumType !== null) initialForm.mediumType = ticketData.mediumType;
        if (ticketData.recycledMediumType !== undefined && ticketData.recycledMediumType !== null) initialForm.recycledMediumType = ticketData.recycledMediumType;
        if (ticketData.parentBoxCount !== undefined && ticketData.parentBoxCount !== null) initialForm.parentBoxCount = ticketData.parentBoxCount;
        if (ticketData.childBoxCount !== undefined && ticketData.childBoxCount !== null) initialForm.childBoxCount = ticketData.childBoxCount;
        if (ticketData.subcultureMediumType !== undefined && ticketData.subcultureMediumType !== null) initialForm.subcultureMediumType = ticketData.subcultureMediumType;
        if (ticketData.subcultureRecycledMediumType !== undefined && ticketData.subcultureRecycledMediumType !== null) initialForm.subcultureRecycledMediumType = ticketData.subcultureRecycledMediumType;
        if (ticketData.frozenCellBoxCount !== undefined && ticketData.frozenCellBoxCount !== null) initialForm.frozenCellBoxCount = ticketData.frozenCellBoxCount;
        if (ticketData.frozenTubeSpec !== undefined && ticketData.frozenTubeSpec !== null) initialForm.frozenTubeSpec = ticketData.frozenTubeSpec;
        if (ticketData.frozenMediumType !== undefined && ticketData.frozenMediumType !== null) initialForm.frozenMediumType = ticketData.frozenMediumType;
        if (ticketData.frozenTubeCount !== undefined && ticketData.frozenTubeCount !== null) initialForm.frozenTubeCount = ticketData.frozenTubeCount;
        if (ticketData.thawCellName !== undefined && ticketData.thawCellName !== null) initialForm.thawCellName = ticketData.thawCellName;
        if (ticketData.thawCellGeneration !== undefined && ticketData.thawCellGeneration !== null) initialForm.thawCellGeneration = ticketData.thawCellGeneration;
        if (ticketData.thawOriginalMediumType !== undefined && ticketData.thawOriginalMediumType !== null) initialForm.thawOriginalMediumType = ticketData.thawOriginalMediumType;
        if (ticketData.thawFreezeDate !== undefined && ticketData.thawFreezeDate !== null) initialForm.thawFreezeDate = ticketData.thawFreezeDate;
        if (ticketData.thawTubeCount !== undefined && ticketData.thawTubeCount !== null) initialForm.thawTubeCount = ticketData.thawTubeCount;
        if (ticketData.thawMediumType !== undefined && ticketData.thawMediumType !== null) initialForm.thawMediumType = ticketData.thawMediumType;
        if (ticketData.thawCultureBoxCount !== undefined && ticketData.thawCultureBoxCount !== null) initialForm.thawCultureBoxCount = ticketData.thawCultureBoxCount;
        if (ticketData.freezeBoxCount !== undefined && ticketData.freezeBoxCount !== null) initialForm.freezeBoxCount = ticketData.freezeBoxCount;
        if (ticketData.freezeTubeCount !== undefined && ticketData.freezeTubeCount !== null) initialForm.freezeTubeCount = ticketData.freezeTubeCount;
        if (ticketData.freezeTubeSpec !== undefined && ticketData.freezeTubeSpec !== null) initialForm.freezeTubeSpec = ticketData.freezeTubeSpec;
        if (ticketData.freezeMediumType !== undefined && ticketData.freezeMediumType !== null) initialForm.freezeMediumType = ticketData.freezeMediumType;
        if (ticketData.subParentBoxCount !== undefined && ticketData.subParentBoxCount !== null) initialForm.subParentBoxCount = ticketData.subParentBoxCount;
        if (ticketData.subChildBoxCount !== undefined && ticketData.subChildBoxCount !== null) initialForm.subChildBoxCount = ticketData.subChildBoxCount;
        if (ticketData.subMediumType !== undefined && ticketData.subMediumType !== null) initialForm.subMediumType = ticketData.subMediumType;
        if (ticketData.subRecycledMediumType !== undefined && ticketData.subRecycledMediumType !== null) initialForm.subRecycledMediumType = ticketData.subRecycledMediumType;
        
        setEditForm(initialForm);
      }
    }
    setEditing(!editing);
  };

  /**
   * 處理表單提交
   */
  const handleSubmit = () => {
    // 驗證表單
    const errors: { [key: string]: string } = {};
    
    // 如果是 AOI 工單，驗證拍照倍數和張數
    if (ticketData?.deviceId === 'AOI') {
      if (editForm.magnification && !['4X', '10X', '20X'].includes(editForm.magnification)) {
        errors.magnification = '拍照倍數必須為 4X, 10X, 或 20X';
      }
      if (editForm.photoCount && ![3, 6, 9, 12, 16, 20, 27].includes(editForm.photoCount)) {
        errors.photoCount = '張數必須為 3, 6, 9, 12, 16, 20, 或 27';
      }
    }
    
    // 如果是換液工單，驗證培養液種類和回收培養液種類
    if (ticketData?.deviceId === 'Chang Medium') {
      if (editForm.mediumType && !['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'].includes(editForm.mediumType)) {
        errors.mediumType = '培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5';
      }
      if (editForm.recycledMediumType && !['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'].includes(editForm.recycledMediumType)) {
        errors.recycledMediumType = '回收培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5';
      }
    }
    
    // 如果是繼代凍存工單，驗證相關欄位
    if (ticketData?.deviceId === 'Sub & Freeze') {
      if (editForm.parentBoxCount !== undefined && (isNaN(editForm.parentBoxCount) || editForm.parentBoxCount < 0)) {
        errors.parentBoxCount = '親代盒數必須為非負整數';
      }
      if (editForm.childBoxCount !== undefined && (isNaN(editForm.childBoxCount) || editForm.childBoxCount < 0)) {
        errors.childBoxCount = '子代盒數必須為非負整數';
      }
      if (editForm.subcultureMediumType && !['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'].includes(editForm.subcultureMediumType)) {
        errors.subcultureMediumType = '繼代培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5';
      }
      if (editForm.subcultureRecycledMediumType && !['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5', '不回收'].includes(editForm.subcultureRecycledMediumType)) {
        errors.subcultureRecycledMediumType = '回收培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, AM5, 或 不回收';
      }
      if (editForm.frozenCellBoxCount !== undefined && (isNaN(editForm.frozenCellBoxCount) || editForm.frozenCellBoxCount < 0)) {
        errors.frozenCellBoxCount = '凍存細胞盒數必須為非負整數';
      }
      if (editForm.frozenTubeSpec && !['2ml', '5ml'].includes(editForm.frozenTubeSpec)) {
        errors.frozenTubeSpec = '凍管規格必須為 2ml 或 5ml';
      }
      if (editForm.frozenMediumType && !['凍液A', '凍液B'].includes(editForm.frozenMediumType)) {
        errors.frozenMediumType = '凍液種類必須為 凍液A 或 凍液B';
      }
      if (editForm.frozenTubeCount !== undefined && (isNaN(editForm.frozenTubeCount) || editForm.frozenTubeCount < 0)) {
        errors.frozenTubeCount = '凍管數量必須為非負整數';
      }
    }
    
    // 如果是解凍工單，驗證相關欄位
    if (ticketData?.deviceId === 'Thaw') {
      if (editForm.thawCellGeneration !== undefined && (isNaN(editForm.thawCellGeneration) || editForm.thawCellGeneration < 0)) {
        errors.thawCellGeneration = '細胞凍存代數必須為非負整數';
      }
      if (editForm.thawOriginalMediumType && !['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5', '無紀錄'].includes(editForm.thawOriginalMediumType)) {
        errors.thawOriginalMediumType = '細胞凍存原培養液必須為 022-02.4, 022-02.1, SAM10, CM2, AM5, 或 無紀錄';
      }
      if (editForm.thawFreezeDate && !/^\d{4}-\d{2}-\d{2}$/.test(editForm.thawFreezeDate)) {
        errors.thawFreezeDate = '凍管凍存日期格式必須為 YYYY-MM-DD';
      }
      if (editForm.thawTubeCount !== undefined && (isNaN(editForm.thawTubeCount) || editForm.thawTubeCount < 0)) {
        errors.thawTubeCount = '解凍支數必須為非負整數';
      }
      if (editForm.thawMediumType && !['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'].includes(editForm.thawMediumType)) {
        errors.thawMediumType = '解凍培養液必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5';
      }
      if (editForm.thawCultureBoxCount !== undefined && (isNaN(editForm.thawCultureBoxCount) || editForm.thawCultureBoxCount < 0)) {
        errors.thawCultureBoxCount = '解凍培養盒數必須為非負整數';
      }
    }
    
    // 如果是凍存工單，驗證相關欄位
    if (ticketData?.deviceId === 'Freeze') {
      if (editForm.freezeBoxCount !== undefined && (isNaN(editForm.freezeBoxCount) || editForm.freezeBoxCount < 0)) {
        errors.freezeBoxCount = '凍存盒數必須為非負整數';
      }
      if (editForm.freezeTubeCount !== undefined && (isNaN(editForm.freezeTubeCount) || editForm.freezeTubeCount < 0)) {
        errors.freezeTubeCount = '凍管數量必須為非負整數';
      }
      if (editForm.freezeTubeSpec && !['2ml', '5ml'].includes(editForm.freezeTubeSpec)) {
        errors.freezeTubeSpec = '凍管規格必須為 2ml 或 5ml';
      }
      if (editForm.freezeMediumType && !['凍液A', '凍液B'].includes(editForm.freezeMediumType)) {
        errors.freezeMediumType = '凍液種類必須為 凍液A 或 凍液B';
      }
    }
    
    // 如果是繼代工單，驗證相關欄位
    if (ticketData?.deviceId === 'Sub') {
      if (editForm.subParentBoxCount !== undefined && (isNaN(editForm.subParentBoxCount) || editForm.subParentBoxCount < 0)) {
        errors.subParentBoxCount = '親代盒數必須為非負整數';
      }
      if (editForm.subChildBoxCount !== undefined && (isNaN(editForm.subChildBoxCount) || editForm.subChildBoxCount < 0)) {
        errors.subChildBoxCount = '子代盒數必須為非負整數';
      }
      if (editForm.subMediumType && !['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'].includes(editForm.subMediumType)) {
        errors.subMediumType = '繼代培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5';
      }
      if (editForm.subRecycledMediumType && !['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5', '不回收'].includes(editForm.subRecycledMediumType)) {
        errors.subRecycledMediumType = '回收培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, AM5, 或 不回收';
      }
    }
    
    if (ticketData?.deviceId === 'Collect & Discard') {
      if (editForm.collectDiscardBoxCount !== undefined && (isNaN(editForm.collectDiscardBoxCount) || editForm.collectDiscardBoxCount < 0)) {
        errors.collectDiscardBoxCount = '回收/丟盒數必須為非負整數';
      }
      if (editForm.collectDiscardRecycledMediumType && !['022-02.4', '022-02.1', 'SAM10', 'CM2', 'AM5'].includes(editForm.collectDiscardRecycledMediumType)) {
        errors.collectDiscardRecycledMediumType = '回收培養液種類必須為 022-02.4, 022-02.1, SAM10, CM2, 或 AM5';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    if (Object.keys(editForm).length > 0) {
      handleUpdate(editForm);
    } else {
      // 如果沒有更改，直接退出編輯模式
      setEditing(false);
      setEditForm({});
      setFormErrors({});
    }
  };


  /**
   * 處理對話框關閉
   */
  const handleClose = () => {
    if (!loading) {
      setEditing(false);
      setEditForm({}); // 重置表單
      setError(null);
      setFormErrors({});
      onClose();
    }
  };

  // 當對話框開啟時載入詳情（優先從 API 重新載入以確保資料完整）
  useEffect(() => {
    if (open) {
      // 優先使用 ticketId 從 API 重新載入，確保獲取最新且完整的資料（包括所有新欄位）
      if (ticketId) {
        console.log('對話框開啟，使用 ticketId 重新載入工單詳情, ticketId:', ticketId);
        loadTicketDetail();
      } else if (ticket && ticket.id) {
        // 如果沒有 ticketId 但有 ticket prop，使用 ticket.id 從 API 重新載入
        console.log('對話框開啟，使用 ticket.id 重新載入工單詳情, ticketId:', ticket.id);
        const loadByTicketId = async () => {
          setLoading(true);
          setError(null);
          try {
            const response = await TicketService.getTicket(ticket.id);
            if (response.success && response.data) {
              console.log('載入工單詳情成功:', response.data);
              setTicketData(response.data);
              setEditForm({});
            } else {
              // 如果 API 載入失敗，降級使用傳入的 ticket 資料
              console.warn('API 載入失敗，使用傳入的 ticket 資料:', ticket);
              setTicketData(ticket);
              setEditForm({});
            }
          } catch (error: any) {
            console.error('載入工單詳情錯誤:', error);
            // 如果 API 載入失敗，降級使用傳入的 ticket 資料
            console.warn('API 載入失敗，使用傳入的 ticket 資料:', ticket);
            setTicketData(ticket);
            setEditForm({});
          } finally {
            setLoading(false);
          }
        };
        loadByTicketId();
      } else if (ticket) {
        // 如果只有 ticket prop 而沒有 ID，使用傳入的資料（這種情況應該很少見）
        console.warn('對話框開啟，使用傳入的 ticket 資料（沒有 ID）:', ticket);
        setTicketData(ticket);
        setEditForm({});
      }
    } else if (!open) {
      // 對話框關閉時，重置狀態
      setEditForm({});
      setFormErrors({});
    }
  }, [open, ticketId, loadTicketDetail, ticket]);

  // 當 ticket prop 更新時，同步更新 ticketData（確保狀態一致）
  // 注意：這個 useEffect 只在對話框關閉時或 ticket prop 變化時觸發
  // 如果對話框開啟時有 ticketId，應該優先從 API 重新載入，而不是使用這個邏輯
  useEffect(() => {
    // 只有在對話框關閉時，才使用 ticket prop 同步狀態
    // 如果對話框開啟時，應該從 API 重新載入，而不是使用 ticket prop
    // 這樣可以確保獲取最新的完整資料（包括所有新欄位）
    if (!open && ticket && ticketData && ticket.id === ticketData.id) {
      // 如果傳入的 ticket prop 已更新，且與當前 ticketData 是同一個工單，同步到內部狀態
      // 這確保了當父組件更新工單後，詳情頁面能立即反映最新狀態
      if (ticket.status !== ticketData.status || ticket.updatedAt !== ticketData.updatedAt) {
        console.log('對話框關閉，ticket prop 已更新，同步到 ticketData:', ticket);
        setTicketData(ticket);
        if (!editing) {
          // 如果不在編輯模式，重置表單狀態
          setEditForm({});
          setFormErrors({});
        }
      }
    }
    // 如果對話框開啟時，不要使用 ticket prop，因為會從 API 重新載入
  }, [ticket, ticketData, editing, open]);

  // 調試：記錄當前 ticketData 狀態的變化
  useEffect(() => {
    if (ticketData) {
      console.log('ticketData 狀態已更新:', ticketData);
      if (ticketData.deviceId === 'AOI') {
        console.log('AOI 工單欄位值 - magnification:', ticketData.magnification, '類型:', typeof ticketData.magnification, 'photoCount:', ticketData.photoCount);
      }
    }
  }, [ticketData]);

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
                    
                    {/* AOI 工單專用欄位：拍照倍數和張數 */}
                    {ticketData.deviceId === 'AOI' && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            拍照倍數:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.magnification || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, magnification: e.target.value }))}
                            error={!!formErrors.magnification}
                            helperText={formErrors.magnification}
                          >
                            <MenuItem value="4X">4X</MenuItem>
                            <MenuItem value="10X">10X</MenuItem>
                            <MenuItem value="20X">20X</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {(() => {
                              const value = ticketData.magnification;
                              console.log('顯示 magnification，值:', value, '類型:', typeof value, '是否為真:', !!value);
                              return value ? value : '未設定';
                            })()}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            張數:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.photoCount?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, photoCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.photoCount}
                            helperText={formErrors.photoCount}
                          >
                            <MenuItem value="3">3張</MenuItem>
                            <MenuItem value="6">6張</MenuItem>
                            <MenuItem value="9">9張</MenuItem>
                            <MenuItem value="12">12張</MenuItem>
                            <MenuItem value="16">16張</MenuItem>
                            <MenuItem value="20">20張</MenuItem>
                            <MenuItem value="27">27張</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.photoCount ? `${ticketData.photoCount}張` : '未設定'}
                          </Typography>
                        )}
                      </>
                    )}
                    
                    {/* 換液工單專用欄位：培養液種類和回收培養液種類 */}
                    {ticketData.deviceId === 'Chang Medium' && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            培養液種類:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.mediumType || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, mediumType: e.target.value }))}
                            error={!!formErrors.mediumType}
                            helperText={formErrors.mediumType}
                          >
                            <MenuItem value="022-02.4">022-02.4</MenuItem>
                            <MenuItem value="022-02.1">022-02.1</MenuItem>
                            <MenuItem value="SAM10">SAM10</MenuItem>
                            <MenuItem value="CM2">CM2</MenuItem>
                            <MenuItem value="AM5">AM5</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.mediumType || '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            回收培養液種類:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.recycledMediumType || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, recycledMediumType: e.target.value }))}
                            error={!!formErrors.recycledMediumType}
                            helperText={formErrors.recycledMediumType}
                          >
                            <MenuItem value="022-02.4">022-02.4</MenuItem>
                            <MenuItem value="022-02.1">022-02.1</MenuItem>
                            <MenuItem value="SAM10">SAM10</MenuItem>
                            <MenuItem value="CM2">CM2</MenuItem>
                            <MenuItem value="AM5">AM5</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.recycledMediumType || '未設定'}
                          </Typography>
                        )}
                      </>
                    )}
                    
                    {/* 繼代凍存工單專用欄位 */}
                    {ticketData.deviceId === 'Sub & Freeze' && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            親代盒數:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            type="number"
                            value={editForm.parentBoxCount?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, parentBoxCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.parentBoxCount}
                            helperText={formErrors.parentBoxCount || '請輸入親代盒數'}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.parentBoxCount !== undefined && ticketData.parentBoxCount !== null ? `${ticketData.parentBoxCount} 盒` : '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            子代盒數:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            type="number"
                            value={editForm.childBoxCount?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, childBoxCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.childBoxCount}
                            helperText={formErrors.childBoxCount || '請輸入子代盒數'}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.childBoxCount !== undefined && ticketData.childBoxCount !== null ? `${ticketData.childBoxCount} 盒` : '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            繼代培養液種類:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.subcultureMediumType || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, subcultureMediumType: e.target.value }))}
                            error={!!formErrors.subcultureMediumType}
                            helperText={formErrors.subcultureMediumType}
                          >
                            <MenuItem value="022-02.4">022-02.4</MenuItem>
                            <MenuItem value="022-02.1">022-02.1</MenuItem>
                            <MenuItem value="SAM10">SAM10</MenuItem>
                            <MenuItem value="CM2">CM2</MenuItem>
                            <MenuItem value="AM5">AM5</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.subcultureMediumType || '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            回收培養液種類:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.subcultureRecycledMediumType || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, subcultureRecycledMediumType: e.target.value }))}
                            error={!!formErrors.subcultureRecycledMediumType}
                            helperText={formErrors.subcultureRecycledMediumType}
                          >
                            <MenuItem value="022-02.4">022-02.4</MenuItem>
                            <MenuItem value="022-02.1">022-02.1</MenuItem>
                            <MenuItem value="SAM10">SAM10</MenuItem>
                            <MenuItem value="CM2">CM2</MenuItem>
                            <MenuItem value="AM5">AM5</MenuItem>
                            <MenuItem value="不回收">不回收</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.subcultureRecycledMediumType || '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            凍存細胞盒數:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            type="number"
                            value={editForm.frozenCellBoxCount?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, frozenCellBoxCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.frozenCellBoxCount}
                            helperText={formErrors.frozenCellBoxCount || '請輸入凍存細胞盒數'}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.frozenCellBoxCount !== undefined && ticketData.frozenCellBoxCount !== null ? `${ticketData.frozenCellBoxCount} 盒` : '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            凍管數量:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            type="number"
                            value={editForm.frozenTubeCount?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, frozenTubeCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.frozenTubeCount}
                            helperText={formErrors.frozenTubeCount || '請輸入凍管數量'}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.frozenTubeCount !== undefined && ticketData.frozenTubeCount !== null ? `${ticketData.frozenTubeCount} 支` : '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            凍管規格:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.frozenTubeSpec || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, frozenTubeSpec: e.target.value }))}
                            error={!!formErrors.frozenTubeSpec}
                            helperText={formErrors.frozenTubeSpec}
                          >
                            <MenuItem value="2ml">2ml</MenuItem>
                            <MenuItem value="5ml">5ml</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.frozenTubeSpec || '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            凍液種類:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.frozenMediumType || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, frozenMediumType: e.target.value }))}
                            error={!!formErrors.frozenMediumType}
                            helperText={formErrors.frozenMediumType}
                          >
                            <MenuItem value="凍液A">凍液A</MenuItem>
                            <MenuItem value="凍液B">凍液B</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.frozenMediumType || '未設定'}
                          </Typography>
                        )}
                      </>
                    )}
                    
                    {/* 解凍工單專用欄位 */}
                    {ticketData.deviceId === 'Thaw' && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            解凍細胞:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            value={editForm.thawCellName || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, thawCellName: e.target.value }))}
                            error={!!formErrors.thawCellName}
                            helperText={formErrors.thawCellName || '請輸入解凍細胞'}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.thawCellName || '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            細胞凍存代數:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            type="number"
                            value={editForm.thawCellGeneration?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, thawCellGeneration: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.thawCellGeneration}
                            helperText={formErrors.thawCellGeneration || '請輸入細胞凍存代數'}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.thawCellGeneration !== undefined && ticketData.thawCellGeneration !== null ? `第 ${ticketData.thawCellGeneration} 代` : '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            細胞凍存原培養液:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.thawOriginalMediumType || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, thawOriginalMediumType: e.target.value }))}
                            error={!!formErrors.thawOriginalMediumType}
                            helperText={formErrors.thawOriginalMediumType}
                          >
                            <MenuItem value="022-02.4">022-02.4</MenuItem>
                            <MenuItem value="022-02.1">022-02.1</MenuItem>
                            <MenuItem value="SAM10">SAM10</MenuItem>
                            <MenuItem value="CM2">CM2</MenuItem>
                            <MenuItem value="AM5">AM5</MenuItem>
                            <MenuItem value="無紀錄">無紀錄</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.thawOriginalMediumType || '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            凍管凍存日期:
                          </Typography>
                        </Box>
                        {editing ? (
                          <DatePicker
                            label="凍管凍存日期"
                            value={editForm.thawFreezeDate ? dayjs(editForm.thawFreezeDate) : null}
                            onChange={(date: Dayjs | null) =>
                              setEditForm(prev => ({
                                ...prev,
                                thawFreezeDate: date ? date.format('YYYY-MM-DD') : undefined
                              }))
                            }
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                error: !!formErrors.thawFreezeDate,
                                helperText: formErrors.thawFreezeDate || '請選擇凍管凍存日期',
                              },
                            }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.thawFreezeDate ? dayjs(ticketData.thawFreezeDate).format('YYYY年MM月DD日') : '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            解凍支數:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            type="number"
                            value={editForm.thawTubeCount?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, thawTubeCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.thawTubeCount}
                            helperText={formErrors.thawTubeCount || '請輸入解凍支數'}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.thawTubeCount !== undefined && ticketData.thawTubeCount !== null ? `${ticketData.thawTubeCount} 支` : '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            解凍培養液:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.thawMediumType || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, thawMediumType: e.target.value }))}
                            error={!!formErrors.thawMediumType}
                            helperText={formErrors.thawMediumType}
                          >
                            <MenuItem value="022-02.4">022-02.4</MenuItem>
                            <MenuItem value="022-02.1">022-02.1</MenuItem>
                            <MenuItem value="SAM10">SAM10</MenuItem>
                            <MenuItem value="CM2">CM2</MenuItem>
                            <MenuItem value="AM5">AM5</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.thawMediumType || '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            解凍培養盒數:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            type="number"
                            value={editForm.thawCultureBoxCount?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, thawCultureBoxCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.thawCultureBoxCount}
                            helperText={formErrors.thawCultureBoxCount || '請輸入解凍培養盒數'}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.thawCultureBoxCount !== undefined && ticketData.thawCultureBoxCount !== null ? `${ticketData.thawCultureBoxCount} 盒` : '未設定'}
                          </Typography>
                        )}
                      </>
                    )}
                    
                    {/* 凍存工單專用欄位 */}
                    {ticketData.deviceId === 'Freeze' && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            凍存盒數:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            type="number"
                            value={editForm.freezeBoxCount?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, freezeBoxCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.freezeBoxCount}
                            helperText={formErrors.freezeBoxCount || '請輸入凍存盒數'}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.freezeBoxCount !== undefined && ticketData.freezeBoxCount !== null ? `${ticketData.freezeBoxCount} 盒` : '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            凍管數量:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            type="number"
                            value={editForm.freezeTubeCount?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, freezeTubeCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.freezeTubeCount}
                            helperText={formErrors.freezeTubeCount || '請輸入凍管數量'}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.freezeTubeCount !== undefined && ticketData.freezeTubeCount !== null ? `${ticketData.freezeTubeCount} 支` : '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            凍管規格:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.freezeTubeSpec || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, freezeTubeSpec: e.target.value }))}
                            error={!!formErrors.freezeTubeSpec}
                            helperText={formErrors.freezeTubeSpec}
                          >
                            <MenuItem value="2ml">2ml</MenuItem>
                            <MenuItem value="5ml">5ml</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.freezeTubeSpec || '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            凍液種類:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.freezeMediumType || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, freezeMediumType: e.target.value }))}
                            error={!!formErrors.freezeMediumType}
                            helperText={formErrors.freezeMediumType}
                          >
                            <MenuItem value="凍液A">凍液A</MenuItem>
                            <MenuItem value="凍液B">凍液B</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.freezeMediumType || '未設定'}
                          </Typography>
                        )}
                      </>
                    )}
                    
                    {/* 繼代工單專用欄位 */}
                    {ticketData.deviceId === 'Sub' && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            親代盒數:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            type="number"
                            value={editForm.subParentBoxCount?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, subParentBoxCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.subParentBoxCount}
                            helperText={formErrors.subParentBoxCount || '請輸入親代盒數'}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.subParentBoxCount !== undefined && ticketData.subParentBoxCount !== null ? `${ticketData.subParentBoxCount} 盒` : '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            子代盒數:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            type="number"
                            value={editForm.subChildBoxCount?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, subChildBoxCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.subChildBoxCount}
                            helperText={formErrors.subChildBoxCount || '請輸入子代盒數'}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.subChildBoxCount !== undefined && ticketData.subChildBoxCount !== null ? `${ticketData.subChildBoxCount} 盒` : '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            繼代培養液種類:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.subMediumType || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, subMediumType: e.target.value }))}
                            error={!!formErrors.subMediumType}
                            helperText={formErrors.subMediumType}
                          >
                            <MenuItem value="022-02.4">022-02.4</MenuItem>
                            <MenuItem value="022-02.1">022-02.1</MenuItem>
                            <MenuItem value="SAM10">SAM10</MenuItem>
                            <MenuItem value="CM2">CM2</MenuItem>
                            <MenuItem value="AM5">AM5</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.subMediumType || '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            回收培養液種類:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.subRecycledMediumType || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, subRecycledMediumType: e.target.value }))}
                            error={!!formErrors.subRecycledMediumType}
                            helperText={formErrors.subRecycledMediumType}
                          >
                            <MenuItem value="022-02.4">022-02.4</MenuItem>
                            <MenuItem value="022-02.1">022-02.1</MenuItem>
                            <MenuItem value="SAM10">SAM10</MenuItem>
                            <MenuItem value="CM2">CM2</MenuItem>
                            <MenuItem value="AM5">AM5</MenuItem>
                            <MenuItem value="不回收">不回收</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.subRecycledMediumType || '未設定'}
                          </Typography>
                        )}
                      </>
                    )}

                    {/* 回收/丟棄工單專用欄位 */}
                    {ticketData.deviceId === 'Collect & Discard' && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            回收/丟盒數:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            type="number"
                            value={editForm.collectDiscardBoxCount?.toString() || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, collectDiscardBoxCount: e.target.value ? parseInt(e.target.value) : undefined }))}
                            error={!!formErrors.collectDiscardBoxCount}
                            helperText={formErrors.collectDiscardBoxCount || '請輸入回收/丟盒數'}
                            inputProps={{ min: 0 }}
                          />
                        ) : (
                          <Typography variant="body1">
                            {ticketData.collectDiscardBoxCount !== undefined && ticketData.collectDiscardBoxCount !== null ? `${ticketData.collectDiscardBoxCount} 盒` : '未設定'}
                          </Typography>
                        )}
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <ImageIcon color="primary" />
                          <Typography variant="body2" color="text.secondary">
                            回收培養液種類:
                          </Typography>
                        </Box>
                        {editing ? (
                          <TextField
                            fullWidth
                            select
                            value={editForm.collectDiscardRecycledMediumType || ''}
                            onChange={(e) => setEditForm(prev => ({ ...prev, collectDiscardRecycledMediumType: e.target.value }))}
                            error={!!formErrors.collectDiscardRecycledMediumType}
                            helperText={formErrors.collectDiscardRecycledMediumType}
                          >
                            <MenuItem value="022-02.4">022-02.4</MenuItem>
                            <MenuItem value="022-02.1">022-02.1</MenuItem>
                            <MenuItem value="SAM10">SAM10</MenuItem>
                            <MenuItem value="CM2">CM2</MenuItem>
                            <MenuItem value="AM5">AM5</MenuItem>
                          </TextField>
                        ) : (
                          <Typography variant="body1">
                            {ticketData.collectDiscardRecycledMediumType || '未設定'}
                          </Typography>
                        )}
                      </>
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
          {(ticketData?.deviceId === 'AOI' || ticketData?.deviceId === 'Chang Medium' || ticketData?.deviceId === 'Sub & Freeze' || ticketData?.deviceId === 'Sub' || ticketData?.deviceId === 'Thaw' || ticketData?.deviceId === 'Freeze' || ticketData?.deviceId === 'Collect & Discard') && (
            <>
              {!editing ? (
                <Button onClick={handleEditToggle} disabled={loading}>
                  編輯
                </Button>
              ) : (
                <>
                  <Button onClick={handleEditToggle} disabled={loading}>
                    取消
                  </Button>
                  <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    儲存
                  </Button>
                </>
              )}
            </>
          )}
          <Button onClick={handleClose} disabled={loading}>
            關閉
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default TicketDetailMUI;
