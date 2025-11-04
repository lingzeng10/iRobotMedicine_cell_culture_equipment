import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { ProductionTarget } from './types/target';
import { Ticket } from './types/ticket';
import { TargetService } from './services/targetApi';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Info as InfoIcon,
} from '@mui/icons-material';

// 匯入自定義元件
import TargetList from './components/TargetList';
import TicketSchedule from './components/TicketSchedule';
import CreateTargetForm from './components/CreateTargetForm';
import TicketDetailMUI from './components/TicketDetailMUI';
import VersionDialog from './components/VersionDialog';

// 建立智慧醫療藍白主題
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

// 主應用程式元件
const AppMUI: React.FC = () => {
  // 狀態管理
  const [targets, setTargets] = useState<ProductionTarget[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<ProductionTarget | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [createTargetDialogOpen, setCreateTargetDialogOpen] = useState(false);
  const [ticketDetailDialogOpen, setTicketDetailDialogOpen] = useState(false);
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 載入目標列表
  const loadTargets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await TargetService.getTargets(1, 100); // 載入所有目標

      if (response.success && response.data) {
        setTargets(response.data.targets);
      } else {
        setError(response.message || '載入預生產目標失敗');
      }
    } catch (error: any) {
      console.error('載入預生產目標錯誤:', error);
      setError('載入預生產目標失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, []);

  // 元件載入時載入目標列表
  useEffect(() => {
    loadTargets();
  }, [loadTargets]);

  /**
   * 處理目標選擇
   * @param target 選中的預生產目標
   */
  const handleTargetSelect = (target: ProductionTarget) => {
    setSelectedTarget(target);
    setDrawerOpen(false); // 關閉側邊欄
  };

  /**
   * 處理工單選擇
   * @param ticket 選中的工單
   */
  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setTicketDetailDialogOpen(true);
  };

  /**
   * 處理新增目標成功
   * @param target 新建立的目標
   */
  const handleCreateTargetSuccess = (target: ProductionTarget) => {
    setTargets(prev => [...prev, target]); // 將新目標添加到列表中
    setCreateTargetDialogOpen(false);
    setSelectedTarget(target); // 自動選中新建立的目標
  };

  /**
   * 處理目標新增（從 TargetList 組件）
   * @param newTarget 新建立的目標
   */
  const handleTargetCreate = (newTarget: ProductionTarget) => {
    setTargets(prev => [...prev, newTarget]); // 將新目標添加到列表中
    setSelectedTarget(newTarget); // 自動選中新建立的目標
  };

  /**
   * 處理目標更新
   * @param targetId 目標 ID
   * @param updatedTarget 更新後的目標
   */
  const handleTargetUpdate = (targetId: string, updatedTarget: ProductionTarget) => {
    // 更新目標列表中的對應目標
    setTargets((prev: ProductionTarget[]) => prev.map((target: ProductionTarget) => 
      target.id === targetId ? updatedTarget : target
    ));
    
    // 如果當前選中的目標被更新，更新選中狀態
    if (selectedTarget && selectedTarget.id === targetId) {
      setSelectedTarget(updatedTarget);
    }
  };

  /**
   * 處理目標刪除
   * @param targetId 目標 ID
   */
  const handleTargetDelete = (targetId: string) => {
    setTargets(prev => prev.filter(target => target.id !== targetId));
    
    // 如果當前選中的目標被刪除，清除選中狀態
    if (selectedTarget && selectedTarget.id === targetId) {
      setSelectedTarget(null);
    }
  };

  /**
   * 處理工單更新
   * @param updatedTicket 更新後的工單
   */
  const handleTicketUpdate = (updatedTicket: Ticket) => {
    setSelectedTicket(updatedTicket);
    // 這裡可以觸發排程列表的重新載入
  };

  /**
   * 處理對話框關閉
   */
  const handleCloseDialogs = () => {
    setCreateTargetDialogOpen(false);
    setTicketDetailDialogOpen(false);
    setSelectedTicket(null);
  };

  /**
   * 處理側邊欄切換
   */
  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProvider theme={medicalTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* 應用程式標題列 */}
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="開啟選單"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'white' }}>
              工單管理系統
            </Typography>
            <Typography variant="body2" sx={{ mr: 2, color: 'white' }}>
              預生產目標與工單排程管理
            </Typography>
            <Button
              color="inherit"
              startIcon={<InfoIcon />}
              onClick={() => setVersionDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              版本資訊
            </Button>
          </Toolbar>
        </AppBar>

        {/* 側邊欄 */}
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: 300,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 300,
              boxSizing: 'border-box',
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto', height: '100%' }}>
            <List>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <DashboardIcon />
                  </ListItemIcon>
                  <ListItemText primary="儀表板" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <AssignmentIcon />
                  </ListItemIcon>
                  <ListItemText primary="工單管理" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <ScheduleIcon />
                  </ListItemIcon>
                  <ListItemText primary="排程管理" />
                </ListItemButton>
              </ListItem>
            </List>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<AddIcon />}
                onClick={() => setCreateTargetDialogOpen(true)}
              >
                新增預生產目標
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* 主要內容區域 */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            overflow: 'hidden',
          }}
        >
          <Toolbar /> {/* 為 AppBar 留出空間 */}
          
          <Box sx={{ display: 'flex', flex: 1, height: 'calc(100vh - 64px)' }}>
            {/* 左側：預生產目標列表 */}
            <Box sx={{ width: { xs: '100%', md: '33.33%' }, height: '100%' }}>
              <Paper 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                  borderRight: 1,
                  borderColor: 'divider',
                }}
              >
                <TargetList
                  targets={targets}
                  onTargetSelect={handleTargetSelect}
                  selectedTargetId={selectedTarget?.id}
                  onTargetUpdate={handleTargetUpdate}
                  onTargetDelete={handleTargetDelete}
                  onTargetCreate={handleTargetCreate}
                />
              </Paper>
            </Box>

            {/* 右側：工單排程 */}
            <Box sx={{ width: { xs: '100%', md: '66.67%' }, height: '100%' }}>
              <Paper 
                sx={{ 
                  height: '100%', 
                  borderRadius: 0,
                }}
              >
                <TicketSchedule
                  selectedTarget={selectedTarget}
                  onTicketSelect={handleTicketSelect}
                  onTargetUpdate={handleTargetUpdate}
                />
              </Paper>
            </Box>
          </Box>
        </Box>

        {/* 新增預生產目標對話框 */}
        <CreateTargetForm
          open={createTargetDialogOpen}
          onClose={() => setCreateTargetDialogOpen(false)}
          onSuccess={handleCreateTargetSuccess}
        />

        {/* 工單詳情對話框 */}
        <TicketDetailMUI
          open={ticketDetailDialogOpen}
          ticketId={selectedTicket?.id} // 優先使用 ticketId，確保從 API 重新載入完整資料
          ticket={selectedTicket || undefined} // 保留 ticket prop 作為備用
          onClose={() => setTicketDetailDialogOpen(false)}
          onUpdate={handleTicketUpdate}
        />

        {/* 錯誤訊息 */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              position: 'fixed', 
              top: 16, 
              right: 16, 
              zIndex: 9999,
              minWidth: 300,
              maxWidth: 500,
            }}
            onClose={() => setError(null)}
          >
            <Typography variant="body2" fontWeight="bold">
              {error}
            </Typography>
            {error.includes('無法連接到後端服務') && (
              <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                請確認：
                <br />1. 後端服務是否正在運行（端口 5000）
                <br />2. 檢查瀏覽器控制台（F12）查看詳細錯誤
              </Typography>
            )}
          </Alert>
        )}

        {/* 載入中覆蓋層 */}
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}

        {/* 版本資訊對話框 */}
        <VersionDialog
          open={versionDialogOpen}
          onClose={() => setVersionDialogOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
};

export default AppMUI;
