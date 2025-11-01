/**
 * 工單照片頁面組件
 * 根據工單ID動態載入和顯示對應工單的照片
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
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
  Paper,
  Breadcrumbs,
  Link,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Home,
  CloudUpload,
  Delete,
  Visibility,
  PhotoCamera,
} from '@mui/icons-material';
import { TicketService } from '../services/api';
import { PhotoService, Photo } from '../services/photoApi';
import { Ticket } from '../types/ticket';
import { getTicketName, getStationDisplay, getStatusText, getStatusColor } from '../utils/stationMapping';

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

// 工單照片頁面組件
const TicketPhotoPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  
  // 狀態管理
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // 載入工單資訊
  const loadTicket = async () => {
    if (!ticketId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await TicketService.getTickets({ page: 1, limit: 100 });
      if (response.success && response.data) {
        const foundTicket = response.data.tickets.find(t => t.id === ticketId);
        if (foundTicket) {
          setTicket(foundTicket);
        } else {
          setError('工單不存在');
        }
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

  // 載入照片
  const loadPhotos = async () => {
    if (!ticketId) return;
    
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
    loadTicket();
    loadPhotos();
  }, [ticketId]);

  // 處理照片上傳
  const handleUploadPhoto = async () => {
    if (!ticketId || !uploadFile) {
      setError('請選擇照片文件');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const response = await PhotoService.uploadPhoto(
        ticketId,
        uploadFile,
        uploadDescription
      );

      if (response.success) {
        setUploadDialogOpen(false);
        setUploadFile(null);
        setUploadDescription('');
        loadPhotos(); // 重新載入照片列表
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

  // 處理拖放
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setUploadFile(file);
    }
  };

  // 刪除照片
  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('確定要刪除這張照片嗎？')) return;

    try {
      setPhotosLoading(true);
      setError(null);
      const response = await PhotoService.deletePhoto(photoId);
      if (response.success) {
        loadPhotos();
      } else {
        setError(response.message || '刪除照片失敗');
      }
    } catch (err: any) {
      console.error('刪除照片錯誤:', err);
      setError('刪除照片失敗，請稍後再試');
    } finally {
      setPhotosLoading(false);
    }
  };

  // 查看照片
  const handleViewPhoto = (url: string) => {
    console.log('查看照片 URL:', url);
    // 確保URL是完整的，包含協議和主機
    const fullUrl = url.startsWith('http') ? url : `http://localhost:5000${url}`;
    console.log('完整 URL:', fullUrl);
    
    // 嘗試在新標籤頁中打開照片
    try {
      window.open(fullUrl, '_blank');
    } catch (error) {
      console.error('打開照片失敗:', error);
      // 如果 window.open 失敗，嘗試直接設置 window.location
      window.location.href = fullUrl;
    }
  };

  // 關閉上傳對話框
  const closeUploadDialog = () => {
    setUploadDialogOpen(false);
    setUploadFile(null);
    setUploadDescription('');
  };

  if (loading) {
    return (
      <ThemeProvider theme={medicalTheme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (error && !ticket) {
    return (
      <ThemeProvider theme={medicalTheme}>
        <CssBaseline />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button variant="contained" onClick={() => navigate('/')}>
            返回主頁
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={medicalTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        {/* 頂部導航欄 */}
        <Box sx={{ flexGrow: 0 }}>
          <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
            <Container maxWidth="lg">
              <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
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
                  {ticket ? `${getTicketName(ticket.deviceId)} - 照片管理` : '工單照片'}
                </Typography>
                <Button color="inherit" startIcon={<Home />} onClick={() => navigate('/')}>
                  回主頁
                </Button>
              </Box>
            </Container>
          </Box>
        </Box>

        {/* 主要內容 */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <Container maxWidth="lg" sx={{ py: 3 }}>
            {/* 麵包屑導航 */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
              <Link
                underline="hover"
                color="inherit"
                href="/"
                sx={{ cursor: 'pointer' }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                }}
              >
                <Home sx={{ mr: 0.5 }} fontSize="inherit" />
                首頁
              </Link>
              <Typography color="text.primary">
                {ticket ? getTicketName(ticket.deviceId) : '工單'} - 照片管理
              </Typography>
            </Breadcrumbs>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* 工單資訊卡片 */}
            {ticket && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h5" gutterBottom>
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

                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  工單 ID: {ticket.id.slice(-8)}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  建立時間: {new Date(ticket.createdAt).toLocaleString('zh-TW')}
                </Typography>

                <Button
                  variant="contained"
                  startIcon={<PhotoCamera />}
                  onClick={() => setUploadDialogOpen(true)}
                  sx={{ mr: 2 }}
                >
                  上傳照片
                </Button>
              </Paper>
            )}

            {/* 照片列表 */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                照片列表
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
                                onClick={() => handleViewPhoto(photo.url)}
                                color="primary"
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeletePhoto(photo.id)}
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
        </Box>

        {/* 照片上傳對話框 */}
        <Dialog
          open={uploadDialogOpen}
          onClose={closeUploadDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            上傳照片到工單: {ticket ? getTicketName(ticket.deviceId) : ''}
          </DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box
              sx={{
                border: '2px dashed grey',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                mb: 2,
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main' },
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                type="file"
                id="file-input"
                hidden
                accept="image/*"
                onChange={handleFileSelect}
              />
              {uploadFile ? (
                <Typography>{uploadFile.name}</Typography>
              ) : (
                <Typography>拖放照片到此處，或點擊選擇文件</Typography>
              )}
              <CloudUpload sx={{ mt: 1, fontSize: 40, color: 'text.secondary' }} />
            </Box>
            <TextField
              label="照片描述 (可選)"
              fullWidth
              multiline
              rows={3}
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              sx={{ mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={closeUploadDialog} disabled={uploading}>取消</Button>
            <Button
              onClick={handleUploadPhoto}
              variant="contained"
              disabled={!uploadFile || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
            >
              {uploading ? '上傳中...' : '上傳'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default TicketPhotoPage;
