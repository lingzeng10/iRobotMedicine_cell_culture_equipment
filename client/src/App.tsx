import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Typography, Space, Button, message, ConfigProvider } from 'antd';
import { PlusOutlined, UnorderedListOutlined } from '@ant-design/icons';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import TicketDetail from './components/TicketDetail';
import StatsPanel from './components/StatsPanel';
import { Ticket } from './types/ticket';
import { TicketService } from './services/api';
import './App.css';

const { Header, Content } = Layout;
const { Title } = Typography;

/**
 * 主應用程式元件
 * 整合工單管理系統的所有功能
 */
const App: React.FC = () => {
  // 狀態管理
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // 用於強制重新整理列表
  const [statsData, setStatsData] = useState({
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    completionRate: 0
  });

  /**
   * 處理工單建立成功
   */
  const handleCreateSuccess = () => {
    message.success('工單建立成功！');
    setActiveTab('list'); // 切換到列表頁面
    setRefreshKey(prev => prev + 1); // 觸發列表重新整理
  };

  /**
   * 處理查看工單詳情
   */
  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailModalVisible(true);
  };

  /**
   * 處理編輯工單
   */
  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDetailModalVisible(true);
  };

  /**
   * 處理工單更新
   */
  const handleTicketUpdate = (updatedTicket: Ticket) => {
    setRefreshKey(prev => prev + 1); // 觸發列表重新整理
  };

  /**
   * 關閉詳情 Modal
   */
  const handleCloseDetail = () => {
    setDetailModalVisible(false);
    setSelectedTicket(null);
  };

  /**
   * 載入統計資料
   */
  const loadStatsData = useCallback(async () => {
    try {
      const response = await TicketService.getTickets();
      if (response.success && response.data) {
        const tickets = response.data.tickets;
        const total = tickets.length;
        const open = tickets.filter(t => t.status === 'OPEN').length;
        const closed = tickets.filter(t => t.status === 'CLOSED').length;
        const completionRate = total > 0 ? Math.round((closed / total) * 100) : 0;
        
        setStatsData({
          totalTickets: total,
          openTickets: open,
          closedTickets: closed,
          completionRate
        });
      }
    } catch (error) {
      console.error('載入統計資料失敗:', error);
    }
  }, []);

  // 載入統計資料
  useEffect(() => {
    loadStatsData();
  }, [loadStatsData, refreshKey]);

  return (
    <Layout className="app-layout">
      {/* 頁面標題列 */}
      <Header className="app-header">
        <div className="header-content">
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            🔧 工單管理系統
          </Title>
          <Space>
            <Button
              type={activeTab === 'list' ? 'primary' : 'default'}
              icon={<UnorderedListOutlined />}
              onClick={() => setActiveTab('list')}
            >
              工單列表
            </Button>
            <Button
              type={activeTab === 'create' ? 'primary' : 'default'}
              icon={<PlusOutlined />}
              onClick={() => setActiveTab('create')}
            >
              建立工單
            </Button>
          </Space>
        </div>
      </Header>

      {/* 主要內容區域 */}
      <Content className="app-content">
        <div className="content-container">
          {/* 統計面板 */}
          <StatsPanel data={statsData} />
          
          {activeTab === 'create' && (
            <TicketForm onSuccess={handleCreateSuccess} />
          )}
          
          {activeTab === 'list' && (
            <TicketList
              key={refreshKey} // 使用 key 強制重新渲染
              onViewTicket={handleViewTicket}
              onEditTicket={handleEditTicket}
            />
          )}
        </div>
      </Content>

      {/* 工單詳情 Modal */}
      <TicketDetail
        visible={detailModalVisible}
        ticket={selectedTicket || undefined}
        onClose={handleCloseDetail}
        onUpdate={handleTicketUpdate}
      />
    </Layout>
  );
};

export default App;
