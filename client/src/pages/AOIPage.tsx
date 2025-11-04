import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  PhotoCamera,
  Upload,
  Visibility,
  Delete,
  Add,
  Home,
  ArrowBack,
} from '@mui/icons-material';
import { TicketService } from '../services/api';
import { PhotoService, Photo } from '../services/photoApi';
import { Ticket } from '../types/ticket';
import { getTicketName, getStationDisplay } from '../utils/stationMapping';

// 智慧醫療藍白主題
const medicalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2', // 醫療藍
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00acc1', // 青藍色
      light: '#26c6da',
      dark: '#0097a7',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // 淺灰白
      paper: '#ffffff',
    },
    text: {
      primary: '#1a202c', // 深灰
      secondary: '#4a5568', // 中灰
    },
    success: {
      main: '#10b981', // 醫療綠
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b', // 醫療橙
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444', // 醫療紅
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6', // 資訊藍
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1a202c',
    },
    body1: {
      fontSize: '1rem',
      color: '#4a5568',
    },
    body2: {
      fontSize: '0.875rem',
      color: '#4a5568',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
          color: '#ffffff', // 確保AppBar中的文字為白色
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
        contained: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
        },
      },
    },
  },
});

// AOI 頁面組件
const AOIPage: React.FC = () => {
  const navigate = useNavigate();
  // 狀態管理
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);

  // 獲取動態 API 基礎 URL
  const getApiBaseUrl = (): string => {
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    const currentHost = window.location.hostname;
    if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
      return 'http://localhost:5000/api';
    } else {
      return `http://${currentHost}:5000/api`;
    }
  };

  // 載入工單列表
  const loadTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await TicketService.getTickets({ page: 1, limit: 100 });
      if (response.success && response.data) {
        // 只顯示AOI工單
        const aoiTickets = response.data.tickets.filter(ticket => 
          ticket.deviceId === 'AOI'
        );
        setTickets(aoiTickets);
      } else {
        setError(response.message || '載入工單失敗');
      }
    } catch (error: any) {
      console.error('載入工單錯誤:', error);
      setError('載入工單失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 載入指定工單的照片
  const loadPhotos = async (ticketId: string) => {
    try {
      setPhotosLoading(true);
      const response = await PhotoService.getTicketPhotos(ticketId);
      if (response.success && response.data) {
        setPhotos(response.data);
      } else {
        setError(response.message || '載入照片失敗');
      }
    } catch (error: any) {
      console.error('載入照片錯誤:', error);
      setError('載入照片失敗，請稍後再試');
    } finally {
      setPhotosLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // 處理照片上傳
  const handleUploadPhoto = async () => {
    if (!selectedTicket || !uploadFile) {
      setError('請選擇工單和照片文件');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const response = await PhotoService.uploadPhoto(
        selectedTicket.id,
        uploadFile,
        uploadDescription
      );

      if (response.success) {
        setUploadDialogOpen(false);
        setUploadFile(null);
        setUploadDescription('');
        // 重新載入照片列表
        if (selectedTicket) {
          loadPhotos(selectedTicket.id);
        }
        // 重新載入工單列表
        loadTickets();
      } else {
        setError(response.message || '照片上傳失敗');
      }
    } catch (error: any) {
      console.error('照片上傳錯誤:', error);
      setError('照片上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
    }
  };

  // 處理文件選擇
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  // 打開上傳對話框
  const openUploadDialog = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setUploadDialogOpen(true);
  };

  // 關閉上傳對話框
  const closeUploadDialog = () => {
    setUploadDialogOpen(false);
    setUploadFile(null);
    setUploadDescription('');
    setSelectedTicket(null);
  };

  // 獲取狀態顏色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'warning';
      case 'CLOSED':
        return 'success';
      default:
        return 'default';
    }
  };

  // 獲取狀態文字
  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN':
        return '進行中';
      case 'CLOSED':
        return '已完成';
      default:
        return status;
    }
  };

  return (
    <ThemeProvider theme={medicalTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        {/* 頂部導航欄 */}
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              AOI 檢測系統
            </Typography>
          </Toolbar>
        </AppBar>

        {/* 麵包屑導航 */}
        <Container maxWidth="lg" sx={{ mt: 2, mb: 2 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              href="/"
              sx={{ cursor: 'pointer' }}
            >
              <Home sx={{ mr: 0.5 }} fontSize="inherit" />
              首頁
            </Link>
            <Typography color="text.primary">AOI 檢測系統</Typography>
          </Breadcrumbs>
        </Container>

        {/* 主要內容 */}
        <Container maxWidth="lg">
          {/* 頁面標題 */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              AOI 自動光學檢測系統
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              管理AOI檢測工單和相關照片資料
            </Typography>
          </Box>

          {/* 錯誤提示 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* 載入中 */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* 工單列表 */}
          {!loading && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {tickets.map((ticket) => (
                <Box key={ticket.id} sx={{ width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.333% - 16px)' } }}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="div">
                          {getTicketName(ticket.deviceId)}
                        </Typography>
                        <Chip
                          label={getStatusText(ticket.status)}
                          color={getStatusColor(ticket.status) as any}
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Station: {getStationDisplay(ticket.deviceId)}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        工單 ID: {ticket.id.slice(-8)}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        建立時間: {new Date(ticket.createdAt).toLocaleString('zh-TW')}
                      </Typography>

                      {/* 操作按鈕 */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                        <Button
                          variant="contained"
                          startIcon={<PhotoCamera />}
                          onClick={() => openUploadDialog(ticket)}
                          size="small"
                        >
                          上傳照片
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          size="small"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            loadPhotos(ticket.id);
                          }}
                        >
                          查看照片
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}

              {/* 沒有工單時的提示 */}
              {tickets.length === 0 && !loading && (
                <Box sx={{ width: '100%' }}>
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      目前沒有AOI工單
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      請先建立AOI工單後再進行照片上傳
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </Container>

        {/* 照片顯示區域 */}
        {selectedTicket && (
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                {getTicketName(selectedTicket.deviceId)} - 照片列表
              </Typography>
              
              {photosLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : photos.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    此工單尚未上傳任何照片
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {photos.map((photo) => (
                    <Box key={photo.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                            <Typography variant="subtitle2" noWrap sx={{ flex: 1, mr: 1 }}>
                              {photo.originalName}
                            </Typography>
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  console.log('查看照片 URL:', photo.url);
                                  console.log('當前 hostname:', window.location.hostname);
                                  
                                  let fullUrl: string;
                                  if (photo.url.startsWith('http')) {
                                    // 如果已經是完整 URL，直接使用
                                    fullUrl = photo.url;
                                  } else if (photo.url.startsWith('/api/')) {
                                    // 如果URL是 /api/ 開頭，需要構建完整 URL
                                    const apiBaseUrl = getApiBaseUrl();
                                    // url 格式: /api/photos/123/view
                                    // 移除開頭的 '/api'，保留後面的路徑
                                    // apiBaseUrl 格式: http://localhost:5000/api
                                    // 最終: http://localhost:5000/api/photos/123/view
                                    const pathAfterApi = photo.url.substring(4); // 移除 '/api' (4個字符)
                                    fullUrl = `${apiBaseUrl}${pathAfterApi}`;
                                  } else {
                                    // 如果URL是相對路徑，拼接動態 API URL
                                    const apiBaseUrl = getApiBaseUrl();
                                    const urlPath = photo.url.startsWith('/') ? photo.url : `/${photo.url}`;
                                    fullUrl = `${apiBaseUrl}${urlPath}`;
                                  }
                                  console.log('構建的完整 URL:', fullUrl);
                                  window.open(fullUrl, '_blank');
                                }}
                                color="primary"
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={async () => {
                                  if (window.confirm('確定要刪除這張照片嗎？')) {
                                    try {
                                      const response = await PhotoService.deletePhoto(photo.id);
                                      if (response.success) {
                                        loadPhotos(selectedTicket.id);
                                      } else {
                                        setError(response.message || '刪除照片失敗');
                                      }
                                    } catch (error: any) {
                                      console.error('刪除照片錯誤:', error);
                                      setError('刪除照片失敗，請稍後再試');
                                    }
                                  }
                                }}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </Box>
                          </Box>
                          {photo.description && (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {photo.description}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" color="text.secondary">
                              {(photo.fileSize / 1024).toFixed(1)} KB
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(photo.uploadedAt).toLocaleString('zh-TW')}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Container>
        )}

        {/* 照片上傳對話框 */}
        <Dialog
          open={uploadDialogOpen}
          onClose={closeUploadDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            上傳照片 - {selectedTicket && getTicketName(selectedTicket.deviceId)}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              {/* 文件選擇 */}
              <Box sx={{ mb: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="photo-upload"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="photo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<Upload />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    選擇照片文件
                  </Button>
                </label>
                {uploadFile && (
                  <Typography variant="body2" color="text.secondary">
                    已選擇: {uploadFile.name}
                  </Typography>
                )}
              </Box>

              {/* 照片描述 */}
              <TextField
                fullWidth
                label="照片描述"
                multiline
                rows={3}
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="請輸入照片描述（可選）"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeUploadDialog} disabled={uploading}>
              取消
            </Button>
            <Button
              onClick={handleUploadPhoto}
              variant="contained"
              disabled={!uploadFile || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <Upload />}
            >
              {uploading ? '上傳中...' : '上傳照片'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default AOIPage;
