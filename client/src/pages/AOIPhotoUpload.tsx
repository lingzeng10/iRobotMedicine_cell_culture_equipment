import React, { useState, useEffect } from 'react';
import {
  Box, AppBar, Toolbar, Typography, Container, Paper, Button, Card, CardContent,
  TextField, Alert, CircularProgress, Chip, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, List, ListItem, ListItemText, ListItemSecondaryAction,
  ThemeProvider, createTheme, CssBaseline, Fab, Divider
} from '@mui/material';
import {
  Add as AddIcon,
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Upload as UploadIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import axios from 'axios';

// 智慧醫療藍白主題配置
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

// AOI 照片上傳頁面組件
const AOIPhotoUpload: React.FC = () => {
  const [ticketId, setTicketId] = useState<string>('');
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  // 從URL參數獲取工單ID
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('ticketId');
    if (id) {
      setTicketId(id);
      loadPhotos(id);
    }
  }, []);

  // 載入照片列表
  const loadPhotos = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`http://localhost:5000/api/photos/ticket/${id}`);
      if (response.data.success) {
        setPhotos(response.data.data);
      } else {
        setError(response.data.message || '載入照片失敗');
      }
    } catch (error: any) {
      console.error('載入照片錯誤:', error);
      setError('載入照片失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  // 處理文件選擇
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 檢查文件類型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('只允許上傳圖片文件 (JPEG, JPG, PNG, GIF, BMP, WEBP)');
        return;
      }
      
      // 檢查文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('文件大小不能超過 10MB');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  // 上傳照片
  const handleUpload = async () => {
    if (!selectedFile || !ticketId) {
      setError('請選擇照片文件');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);
      formData.append('ticketId', ticketId);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      const response = await axios.post('http://localhost:5000/api/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess('照片上傳成功！');
        setUploadDialogOpen(false);
        setSelectedFile(null);
        setDescription('');
        loadPhotos(ticketId); // 重新載入照片列表
      } else {
        setError(response.data.message || '照片上傳失敗');
      }
    } catch (error: any) {
      console.error('照片上傳錯誤:', error);
      setError(error.response?.data?.message || '照片上傳失敗，請稍後再試');
    } finally {
      setUploading(false);
    }
  };

  // 刪除照片
  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('確定要刪除這張照片嗎？')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/photos/${photoId}`);
      if (response.data.success) {
        setSuccess('照片刪除成功！');
        loadPhotos(ticketId); // 重新載入照片列表
      } else {
        setError(response.data.message || '照片刪除失敗');
      }
    } catch (error: any) {
      console.error('照片刪除錯誤:', error);
      setError(error.response?.data?.message || '照片刪除失敗，請稍後再試');
    }
  };

  // 查看照片
  const handleViewPhoto = (photoUrl: string) => {
    window.open(`http://localhost:5000${photoUrl}`, '_blank');
  };

  // 返回主頁
  const handleGoBack = () => {
    window.close();
  };

  return (
    <ThemeProvider theme={medicalTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* 頂部導航欄 */}
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleGoBack}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              AOI 照片上傳系統
            </Typography>
            <Typography variant="body2">
              工單 ID: {ticketId || '未指定'}
            </Typography>
          </Toolbar>
        </AppBar>

        {/* 主要內容 */}
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
          {/* 錯誤和成功訊息 */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

          {/* 上傳按鈕 */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<PhotoCameraIcon />}
              onClick={() => setUploadDialogOpen(true)}
              size="large"
              sx={{ px: 4, py: 1.5 }}
            >
              上傳新照片
            </Button>
          </Box>

          {/* 照片列表 */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              已上傳的照片 ({photos.length})
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : photos.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  尚未上傳任何照片
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
                              <ViewIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleDeletePhoto(photo.id)}
                              color="error"
                            >
                              <DeleteIcon />
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

        {/* 上傳對話框 */}
        <Dialog
          open={uploadDialogOpen}
          onClose={() => setUploadDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            上傳照片
            <IconButton
              onClick={() => setUploadDialogOpen(false)}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
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
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {selectedFile ? selectedFile.name : '選擇照片文件'}
                </Button>
              </label>
              
              <TextField
                fullWidth
                label="照片描述（可選）"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              {selectedFile && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  已選擇文件: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setUploadDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleUpload}
              variant="contained"
              disabled={!selectedFile || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : <UploadIcon />}
            >
              {uploading ? '上傳中...' : '上傳'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default AOIPhotoUpload;
