import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Info as InfoIcon,
  Update as UpdateIcon,
  History as HistoryIcon,
  CheckCircle as CheckCircleIcon,
  NewReleases as NewReleasesIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import VersionService, { VersionInfo, ChangelogEntry } from '../services/versionApi';

interface VersionDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * 版本資訊對話框組件
 * 顯示當前版本、更新日誌和功能列表
 */
const VersionDialog: React.FC<VersionDialogProps> = ({ open, onClose }) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'changelog' | 'features'>('info');

  useEffect(() => {
    if (open) {
      loadVersionInfo();
    }
  }, [open]);

  /**
   * 載入版本資訊
   */
  const loadVersionInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await VersionService.getVersionInfo();
      if (response.success && response.data) {
        setVersionInfo(response.data);
      } else {
        // 如果API失敗，使用本地版本資訊
        setVersionInfo(VersionService.getLocalVersionInfo());
      }
    } catch (err) {
      console.error('載入版本資訊錯誤:', err);
      // 使用本地版本資訊作為備用
      setVersionInfo(VersionService.getLocalVersionInfo());
    } finally {
      setLoading(false);
    }
  };

  /**
   * 渲染版本資訊
   */
  const renderVersionInfo = () => {
    if (!versionInfo) return null;

    return (
      <Box>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="div" sx={{ mb: 1, color: 'primary.main' }}>
            {versionInfo.version}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            建置編號: {versionInfo.buildNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            發布日期: {versionInfo.releaseDate}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          系統狀態
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label="運行正常" color="success" size="small" />
          <Chip label="最新版本" color="primary" size="small" />
          <Chip label="外部訪問已啟用" color="info" size="small" />
        </Box>
      </Box>
    );
  };

  /**
   * 渲染更新日誌
   */
  const renderChangelog = () => {
    if (!versionInfo) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          更新日誌
        </Typography>
        
        <List>
          {versionInfo.changelog.map((entry: ChangelogEntry, index: number) => (
            <React.Fragment key={entry.version}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <NewReleasesIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box>
                      <Typography variant="subtitle1" component="span">
                        版本 {entry.version}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        {entry.date}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <List dense>
                      {entry.changes.map((change, changeIndex) => (
                        <ListItem key={changeIndex} sx={{ py: 0 }}>
                          <ListItemText
                            primary={change}
                            sx={{ '& .MuiListItemText-primary': { fontSize: '0.875rem' } }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  }
                />
              </ListItem>
              {index < versionInfo.changelog.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    );
  };

  /**
   * 渲染功能列表
   */
  const renderFeatures = () => {
    if (!versionInfo) return null;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          系統功能
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {versionInfo.features.map((feature, index) => (
            <Chip 
              key={index}
              label={feature} 
              variant="outlined" 
              color="primary"
              sx={{ mb: 1 }}
            />
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        backgroundColor: 'primary.main',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <InfoIcon sx={{ mr: 1 }} />
          版本資訊
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <Box>
            {/* 標籤頁導航 */}
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Button
                variant={activeTab === 'info' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('info')}
                startIcon={<InfoIcon />}
                size="small"
              >
                版本資訊
              </Button>
              <Button
                variant={activeTab === 'changelog' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('changelog')}
                startIcon={<HistoryIcon />}
                size="small"
              >
                更新日誌
              </Button>
              <Button
                variant={activeTab === 'features' ? 'contained' : 'outlined'}
                onClick={() => setActiveTab('features')}
                startIcon={<CheckCircleIcon />}
                size="small"
              >
                系統功能
              </Button>
            </Box>

            {/* 內容區域 */}
            <Card>
              <CardContent>
                {activeTab === 'info' && renderVersionInfo()}
                {activeTab === 'changelog' && renderChangelog()}
                {activeTab === 'features' && renderFeatures()}
              </CardContent>
            </Card>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
        <Button onClick={onClose} variant="outlined">
          關閉
        </Button>
        <Button 
          onClick={loadVersionInfo} 
          variant="contained" 
          startIcon={<UpdateIcon />}
          disabled={loading}
        >
          重新載入
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VersionDialog;
