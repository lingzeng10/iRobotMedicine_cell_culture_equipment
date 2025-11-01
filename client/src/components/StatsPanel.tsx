import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { 
  ToolOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';

interface StatsData {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  completionRate: number;
}

interface StatsPanelProps {
  data: StatsData;
}

/**
 * 統計指標面板元件
 * 顯示工單管理系統的關鍵指標
 */
const StatsPanel: React.FC<StatsPanelProps> = ({ data }) => {
  const { totalTickets, openTickets, closedTickets, completionRate } = data;

  return (
    <Card 
      title="工單管理統計" 
      style={{ 
        marginBottom: 24, 
        background: '#1a2332',
        border: '1px solid #2d3748',
        color: '#ffffff'
      }}
      headStyle={{ 
        background: '#1a2332', 
        borderBottom: '1px solid #2d3748',
        color: '#ffffff'
      }}
      bodyStyle={{ 
        background: '#1a2332',
        color: '#ffffff'
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="總工單數"
            value={totalTickets}
            prefix={<ToolOutlined style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#ffffff' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="開啟中"
            value={openTickets}
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="已完成"
            value={closedTickets}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Statistic
            title="完成率"
            value={completionRate}
            suffix="%"
            prefix={<ExclamationCircleOutlined style={{ color: '#722ed1' }} />}
            valueStyle={{ color: completionRate >= 80 ? '#52c41a' : '#faad14' }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default StatsPanel;
