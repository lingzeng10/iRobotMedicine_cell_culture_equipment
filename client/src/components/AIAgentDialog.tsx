import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Paper,
  IconButton,
  CircularProgress,
  Chip,
  Alert,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as AIIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import AIAgentService, { ChatMessage } from '../services/aiAgentApi';
import { getTicketName, getStatusText } from '../utils/stationMapping';
import dayjs from 'dayjs';

interface AIAgentDialogProps {
  open: boolean;
  onClose: () => void;
  onTicketClick?: (ticketId: string) => void;
}

const AIAgentDialog: React.FC<AIAgentDialogProps> = ({ open, onClose, onTicketClick }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [ollamaStatus, setOllamaStatus] = useState<{
    connected: boolean;
    message: string;
  }>({ connected: false, message: '檢查中...' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自動滾動到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 檢查 Ollama 狀態
  useEffect(() => {
    if (open) {
      checkOllamaStatus();
      // 初始化歡迎訊息（只在對話框首次打開時）
      setMessages((prev) => {
        if (prev.length === 0) {
          return [
            {
              role: 'assistant',
              content: '您好！我是工單管理系統的 AI 助手。我可以幫您：\n\n1. 📊 查詢資料庫資料\n   例如：「查詢所有 AOI 工單」、「列出進行中的生產目標」\n\n2. 📈 分析資料\n   例如：「分析各類工單的完成率」、「統計工單數量」\n\n3. 💬 回答系統使用問題\n\n請輸入您的問題，我會盡力協助您！',
              timestamp: new Date().toISOString(),
            },
          ];
        }
        return prev;
      });
    }
  }, [open]);

  const checkOllamaStatus = async () => {
    const response = await AIAgentService.checkStatus();
    if (response.success) {
      setOllamaStatus({
        connected: true,
        message: `Ollama 已連接 (模型: ${response.data?.currentModel || '未知'})`,
      });
    } else {
      setOllamaStatus({
        connected: false,
        message: response.message || 'Ollama 服務未運行',
      });
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');
    setLoading(true);

    try {
      const response = await AIAgentService.sendMessage(messageToSend, conversationId);

      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.response,
          data: response.data.data,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setConversationId(response.data.conversationId);
      } else {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `❌ 錯誤：${response.message || '無法處理您的請求'}`,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('發送訊息錯誤:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: '❌ 發生錯誤，請稍後再試。',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    setConversationId(undefined);
    onClose();
  };

  /**
   * 渲染資料顯示（工單列表、目標列表等）
   */
  const renderDataDisplay = (data: any) => {
    // 如果是工單陣列
    if (Array.isArray(data) && data.length > 0 && data[0].deviceId) {
      return (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 1 }} />
          <Chip
            label={`找到 ${data.length} 筆工單`}
            size="small"
            sx={{ mb: 1 }}
            color="primary"
          />
          <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 0 }}>
            {data.slice(0, 20).map((ticket: any, index: number) => (
              <ListItem
                key={ticket.id || index}
                sx={{
                  borderBottom: index < Math.min(data.length, 20) - 1 ? '1px solid #e0e0e0' : 'none',
                  py: 1,
                }}
                secondaryAction={
                  onTicketClick && (
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => {
                        onTicketClick(ticket.id);
                        handleClose();
                      }}
                      sx={{ color: 'primary.main' }}
                    >
                      <LaunchIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight="medium" component="span">
                        {getTicketName(ticket.deviceId || '未知')}
                      </Typography>
                      <Chip
                        label={getStatusText(ticket.status || 'OPEN')}
                        size="small"
                        color={
                          ticket.status === 'COMPLETED'
                            ? 'success'
                            : ticket.status === 'IN_PROGRESS'
                            ? 'primary'
                            : 'default'
                        }
                      />
                    </Box>
                  }
                  secondary={
                    <Box component="div" sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" component="span">
                        工單 ID: {ticket.id?.substring(0, 8)}...
                      </Typography>
                      {ticket.createdAt && (
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                          建立時間: {dayjs(ticket.createdAt).format('YYYY-MM-DD HH:mm')}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            ))}
            {data.length > 20 && (
              <ListItem>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  還有 {data.length - 20} 筆工單未顯示...
                </Typography>
              </ListItem>
            )}
          </List>
        </Box>
      );
    }

    // 如果是生產目標陣列
    if (Array.isArray(data) && data.length > 0 && data[0].name && data[0].expectedCompletionDate) {
      return (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 1 }} />
          <Chip
            label={`找到 ${data.length} 筆生產目標`}
            size="small"
            sx={{ mb: 1 }}
            color="primary"
          />
          <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 0 }}>
            {data.slice(0, 20).map((target: any, index: number) => (
              <ListItem
                key={target.id || index}
                sx={{
                  borderBottom: index < Math.min(data.length, 20) - 1 ? '1px solid #e0e0e0' : 'none',
                  py: 1,
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight="medium" component="span">
                        {target.name}
                      </Typography>
                      <Chip
                        label={
                          target.status === 'PLANNING'
                            ? '規劃中'
                            : target.status === 'IN_PROGRESS'
                            ? '進行中'
                            : target.status === 'COMPLETED'
                            ? '已完成'
                            : target.status || '未知'
                        }
                        size="small"
                        color={
                          target.status === 'COMPLETED'
                            ? 'success'
                            : target.status === 'IN_PROGRESS'
                            ? 'primary'
                            : 'default'
                        }
                      />
                    </Box>
                  }
                  secondary={
                    <Box component="div" sx={{ mt: 0.5 }}>
                      {target.materialType && (
                        <Typography variant="caption" color="text.secondary" component="span">
                          原料種類: {target.materialType}
                        </Typography>
                      )}
                      {target.responsiblePerson && (
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                          負責人員: {target.responsiblePerson}
                        </Typography>
                      )}
                      {target.expectedCompletionDate && (
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                          預計完成: {dayjs(target.expectedCompletionDate).format('YYYY-MM-DD')}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            ))}
            {data.length > 20 && (
              <ListItem>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  還有 {data.length - 20} 筆目標未顯示...
                </Typography>
              </ListItem>
            )}
          </List>
        </Box>
      );
    }

    // 如果是排程陣列
    if (Array.isArray(data) && data.length > 0 && data[0].scheduledDate) {
      return (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 1 }} />
          <Chip
            label={`找到 ${data.length} 筆排程`}
            size="small"
            sx={{ mb: 1 }}
            color="primary"
          />
          <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, p: 0 }}>
            {data.slice(0, 20).map((schedule: any, index: number) => (
              <ListItem
                key={schedule.id || index}
                sx={{
                  borderBottom: index < Math.min(data.length, 20) - 1 ? '1px solid #e0e0e0' : 'none',
                  py: 1,
                }}
                secondaryAction={
                  schedule.ticket?.id && onTicketClick && (
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => {
                        onTicketClick(schedule.ticket.id);
                        handleClose();
                      }}
                      sx={{ color: 'primary.main' }}
                    >
                      <LaunchIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Typography variant="body2" fontWeight="medium" component="span">
                        {schedule.ticket ? getTicketName(schedule.ticket.deviceId || '未知') : '未知工單'}
                      </Typography>
                      {schedule.target && (
                        <Typography variant="caption" color="text.secondary" component="span">
                          - {schedule.target.name}
                        </Typography>
                      )}
                      <Chip
                        label={
                          schedule.status === 'OPEN'
                            ? '開啟'
                            : schedule.status === 'IN_PROGRESS'
                            ? '進行中'
                            : schedule.status === 'COMPLETED'
                            ? '已完成'
                            : schedule.status || '未知'
                        }
                        size="small"
                        color={
                          schedule.status === 'COMPLETED'
                            ? 'success'
                            : schedule.status === 'IN_PROGRESS'
                            ? 'primary'
                            : 'default'
                        }
                      />
                    </Box>
                  }
                  secondary={
                    <Box component="div" sx={{ mt: 0.5 }}>
                      {schedule.scheduledDate && (
                        <Typography variant="caption" color="text.secondary" component="span">
                          排程日期: {dayjs(schedule.scheduledDate).format('YYYY-MM-DD')}
                        </Typography>
                      )}
                      {schedule.scheduledTime && (
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                          時間: {schedule.scheduledTime}
                        </Typography>
                      )}
                      {schedule.priority && (
                        <Typography variant="caption" color="text.secondary" component="span" sx={{ ml: 1 }}>
                          優先級: {schedule.priority}
                        </Typography>
                      )}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            ))}
            {data.length > 20 && (
              <ListItem>
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  還有 {data.length - 20} 筆排程未顯示...
                </Typography>
              </ListItem>
            )}
          </List>
        </Box>
      );
    }

    // 如果是統計資料（包含 ticketStats, targetStats 等）
    if (data.ticketStats || data.targetStats || data.completionRate !== undefined) {
      return (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {data.completionRate !== undefined && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  整體完成率
                </Typography>
                <Typography variant="h6" color="primary">
                  {data.completionRate.toFixed(2)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  已完成: {data.completedTickets} / 總數: {data.totalTickets}
                </Typography>
              </Paper>
            )}
            {data.ticketStats && Array.isArray(data.ticketStats) && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  工單統計
                </Typography>
                {data.ticketStats.map((stat: any, index: number) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {getTicketName(stat.deviceId)} - {getStatusText(stat.status)}: {stat._count}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}
            {data.targetStats && Array.isArray(data.targetStats) && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  生產目標統計
                </Typography>
                {data.targetStats.map((stat: any, index: number) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {stat.status === 'PLANNING'
                        ? '規劃中'
                        : stat.status === 'IN_PROGRESS'
                        ? '進行中'
                        : stat.status === 'COMPLETED'
                        ? '已完成'
                        : stat.status}: {stat._count}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}
          </Box>
        </Box>
      );
    }

    // 預設：不顯示資料（只顯示文字回應）
    return null;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AIIcon color="primary" />
            <Typography variant="h6">AI 助手</Typography>
            <Chip
              icon={ollamaStatus.connected ? <CheckCircleIcon /> : <ErrorIcon />}
              label={ollamaStatus.connected ? '已連接' : '未連接'}
              color={ollamaStatus.connected ? 'success' : 'error'}
              size="small"
              sx={{ ml: 1 }}
            />
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {!ollamaStatus.connected && (
        <Box sx={{ px: 3, pt: 1 }}>
          <Alert severity="warning" sx={{ mb: 1 }}>
            {ollamaStatus.message}
            <br />
            <Typography variant="caption">
              請先啟動 Ollama 服務（在命令提示字元中執行：ollama serve）
            </Typography>
          </Alert>
        </Box>
      )}

      <DialogContent
        dividers
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          p: 2,
        }}
      >
        {messages.map((message, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <Paper
              sx={{
                p: 2,
                maxWidth: '75%',
                bgcolor: message.role === 'user' ? 'primary.light' : 'grey.100',
                color: message.role === 'user' ? 'white' : 'text.primary',
              }}
            >
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: message.data ? 1 : 0 }}>
                {message.content}
              </Typography>
              {message.data && renderDataDisplay(message.data)}
            </Paper>
          </Box>
        ))}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">AI 正在思考...</Typography>
            </Paper>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          placeholder="輸入您的問題..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          disabled={loading || !ollamaStatus.connected}
          sx={{ mr: 1 }}
        />
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!inputMessage.trim() || loading || !ollamaStatus.connected}
          startIcon={<SendIcon />}
        >
          發送
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AIAgentDialog;

