import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Card, 
  Tag, 
  Button, 
  Space, 
  Input, 
  Select, 
  Pagination, 
  message, 
  Popconfirm,
  Tooltip
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  EyeOutlined, 
  EditOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { TicketService } from '../services/api';
import { Ticket, TicketStatus } from '../types/ticket';
import { getStationDisplay, getTicketName } from '../utils/stationMapping';
import dayjs from 'dayjs';

interface TicketListProps {
  onViewTicket?: (ticket: Ticket) => void; // 查看工單詳情回調
  onEditTicket?: (ticket: Ticket) => void; // 編輯工單回調
}

/**
 * 工單列表元件
 * 顯示工單列表，支援搜尋、篩選和分頁
 */
const TicketList: React.FC<TicketListProps> = ({ onViewTicket, onEditTicket }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  // 搜尋和篩選條件
  const [filters, setFilters] = useState({
    status: '',
    deviceId: ''
  });

  /**
   * 載入工單列表
   */
  const loadTickets = useCallback(async () => {
    setLoading(true);
    
    try {
      const response = await TicketService.getTickets({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success && response.data) {
        setTickets(response.data.tickets);
        setPagination(response.data.pagination);
      } else {
        message.error(response.message || '載入工單列表失敗');
      }
    } catch (error: any) {
      console.error('載入工單列表錯誤:', error);
      message.error('載入工單列表失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  /**
   * 更新工單狀態
   * @param ticketId 工單 ID
   * @param newStatus 新狀態
   */
  const updateTicketStatus = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      const response = await TicketService.updateTicket(ticketId, { status: newStatus });
      
      if (response.success) {
        message.success('工單狀態更新成功！');
        loadTickets(); // 重新載入列表
      } else {
        message.error(response.message || '更新工單狀態失敗');
      }
    } catch (error: any) {
      console.error('更新工單狀態錯誤:', error);
      message.error('更新工單狀態失敗，請稍後再試');
    }
  };

  /**
   * 處理搜尋
   */
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // 重置到第一頁
    loadTickets();
  };

  /**
   * 處理分頁變更
   */
  const handlePageChange = (page: number, pageSize?: number) => {
    setPagination(prev => ({
      ...prev,
      page,
      limit: pageSize || prev.limit
    }));
  };

  // 元件載入時載入工單列表
  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // 表格欄位定義
  const columns = [
    {
      title: '工單 ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Tooltip title={id}>
          <span style={{ fontFamily: 'monospace' }}>
            {id.substring(0, 8)}...
          </span>
        </Tooltip>
      )
    },
    {
      title: '工單類型',
      dataIndex: 'deviceId',
      key: 'deviceId',
      width: 150,
      render: (deviceId: string) => getTicketName(deviceId)
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: TicketStatus) => (
        <Tag color={status === TicketStatus.OPEN ? 'green' : 'red'}>
          {status === TicketStatus.OPEN ? '開啟' : '關閉'}
        </Tag>
      )
    },
    {
      title: '建立時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: Ticket) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => onViewTicket?.(record)}
          >
            查看
          </Button>
          
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => onEditTicket?.(record)}
          >
            編輯
          </Button>

          {record.status === TicketStatus.OPEN ? (
            <Popconfirm
              title="確定要關閉此工單嗎？"
              onConfirm={() => updateTicketStatus(record.id, TicketStatus.CLOSED)}
              okText="確定"
              cancelText="取消"
            >
              <Button type="link" danger>
                關閉
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="確定要重新開啟此工單嗎？"
              onConfirm={() => updateTicketStatus(record.id, TicketStatus.OPEN)}
              okText="確定"
              cancelText="取消"
            >
              <Button type="link">
                開啟
              </Button>
            </Popconfirm>
          )}
        </Space>
      )
    }
  ];

  return (
    <Card 
      title="工單列表" 
      extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={loadTickets}
          loading={loading}
        >
          重新整理
        </Button>
      }
    >
      {/* 搜尋和篩選區域 */}
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="設備 ID"
            value={filters.deviceId}
            onChange={(e) => setFilters(prev => ({ ...prev, deviceId: e.target.value }))}
            style={{ width: 150 }}
          />
          
          <Select
            placeholder="狀態"
            value={filters.status}
            onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            style={{ width: 120 }}
            allowClear
          >
            <Select.Option value="">全部</Select.Option>
            <Select.Option value="OPEN">開啟</Select.Option>
            <Select.Option value="CLOSED">關閉</Select.Option>
          </Select>

          <Button 
            type="primary" 
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            搜尋
          </Button>

          <Button 
            icon={<FilterOutlined />}
            onClick={() => {
              setFilters({ status: '', deviceId: '' });
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
          >
            清除篩選
          </Button>
        </Space>
      </div>

      {/* 工單列表表格 */}
      <Table
        columns={columns}
        dataSource={tickets}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 800 }}
      />

      {/* 分頁器 */}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Pagination
          current={pagination.page}
          pageSize={pagination.limit}
          total={pagination.total}
          showSizeChanger
          showQuickJumper
          showTotal={(total, range) => 
            `第 ${range[0]}-${range[1]} 項，共 ${total} 項`
          }
          onChange={handlePageChange}
          onShowSizeChange={handlePageChange}
        />
      </div>
    </Card>
  );
};

export default TicketList;
