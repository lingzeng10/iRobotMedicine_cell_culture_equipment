import React, { useState, useEffect, useCallback } from 'react';
import { 
  Modal, 
  Descriptions, 
  Tag, 
  Button, 
  Form, 
  Select, 
  message, 
  Divider
} from 'antd';
import { 
  EditOutlined, 
  SaveOutlined
} from '@ant-design/icons';
import { TicketService } from '../services/api';
import { Ticket, TicketStatus, UpdateTicketRequest } from '../types/ticket';
import { getStationDisplay, getTicketName } from '../utils/stationMapping';
import dayjs from 'dayjs';

interface TicketDetailProps {
  visible: boolean;
  ticketId?: string;
  ticket?: Ticket;
  onClose: () => void;
  onUpdate?: (updatedTicket: Ticket) => void;
}

/**
 * 工單詳情元件
 * 顯示工單詳細資訊並支援編輯功能
 */
const TicketDetail: React.FC<TicketDetailProps> = ({ 
  visible, 
  ticketId, 
  ticket, 
  onClose, 
  onUpdate 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState<Ticket | null>(ticket || null);
  const [editing, setEditing] = useState(false);

  /**
   * 載入工單詳情
   */
  const loadTicketDetail = useCallback(async () => {
    if (!ticketId) return;
    
    setLoading(true);
    
    try {
      const response = await TicketService.getTicket(ticketId);
      
      if (response.success && response.data) {
        setTicketData(response.data);
        form.setFieldsValue({
          status: response.data.status
        });
      } else {
        message.error(response.message || '載入工單詳情失敗');
        onClose();
      }
    } catch (error: any) {
      console.error('載入工單詳情錯誤:', error);
      message.error('載入工單詳情失敗，請稍後再試');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [ticketId, form, onClose]);

  /**
   * 處理工單更新
   */
  const handleUpdate = async (values: UpdateTicketRequest) => {
    if (!ticketData) return;
    
    setLoading(true);
    
    try {
      const response = await TicketService.updateTicket(ticketData.id, values);
      
      if (response.success && response.data) {
        message.success('工單更新成功！');
        setTicketData(response.data);
        setEditing(false);
        
        // 執行更新回調
        if (onUpdate) {
          onUpdate(response.data);
        }
      } else {
        message.error(response.message || '更新工單失敗');
      }
    } catch (error: any) {
      console.error('更新工單錯誤:', error);
      
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(', ');
        message.error(`驗證失敗: ${errorMessages}`);
      } else {
        message.error('更新工單失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 取消編輯
   */
  const handleCancelEdit = () => {
    setEditing(false);
    if (ticketData) {
      form.setFieldsValue({
        status: ticketData.status
      });
    }
  };

  // 當 modal 開啟時載入工單詳情
  useEffect(() => {
    if (visible && ticketId && !ticket) {
      loadTicketDetail();
    } else if (visible && ticket) {
      setTicketData(ticket);
      form.setFieldsValue({
        status: ticket.status
      });
    }
  }, [visible, ticketId, ticket, loadTicketDetail]);

  // 當 modal 關閉時重置狀態
  useEffect(() => {
    if (!visible) {
      setEditing(false);
      form.resetFields();
    }
  }, [visible, form]);

  return (
    <Modal
      title="工單詳情"
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="close" onClick={onClose}>
          關閉
        </Button>,
        ...(editing ? [
          <Button key="cancel" onClick={handleCancelEdit}>
            取消
          </Button>,
          <Button 
            key="save" 
            type="primary" 
            icon={<SaveOutlined />}
            loading={loading}
            onClick={() => form.submit()}
          >
            儲存
          </Button>
        ] : [
          <Button 
            key="edit" 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => setEditing(true)}
          >
            編輯
          </Button>
        ])
      ]}
    >
      {ticketData ? (
        <div>
          {/* 工單基本資訊 */}
          <Descriptions 
            title="基本資訊" 
            bordered 
            column={2}
            size="small"
          >
            <Descriptions.Item label="工單 ID" span={2}>
              <span style={{ fontFamily: 'monospace' }}>{ticketData.id}</span>
            </Descriptions.Item>
            
            <Descriptions.Item label="工單類型">
              {getTicketName(ticketData.deviceId)}
            </Descriptions.Item>
            
            <Descriptions.Item label="影像 ID">
              {ticketData.imageId || '無'}
            </Descriptions.Item>
            
            <Descriptions.Item label="狀態">
              <Tag color={ticketData.status === TicketStatus.OPEN ? 'green' : 'red'}>
                {ticketData.status === TicketStatus.OPEN ? '開啟' : '關閉'}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="建立時間">
              {dayjs(ticketData.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            
            <Descriptions.Item label="更新時間">
              {dayjs(ticketData.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          </Descriptions>

          <Divider />

          {/* 工單狀態編輯 */}
          <div>
            <h4>工單狀態</h4>
            {editing ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleUpdate}
                initialValues={{
                  status: ticketData.status
                }}
              >
                <Form.Item
                  label="狀態"
                  name="status"
                  rules={[{ required: true, message: '請選擇狀態' }]}
                >
                  <Select>
                    <Select.Option value={TicketStatus.OPEN}>開啟</Select.Option>
                    <Select.Option value={TicketStatus.CLOSED}>關閉</Select.Option>
                  </Select>
                </Form.Item>
              </Form>
            ) : (
              <div style={{ 
                padding: 16, 
                backgroundColor: '#2d3748', 
                borderRadius: 6,
                color: '#ffffff'
              }}>
                目前狀態：{ticketData.status === TicketStatus.OPEN ? '開啟' : '關閉'}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          {loading ? '載入中...' : '工單資料不存在'}
        </div>
      )}
    </Modal>
  );
};

export default TicketDetail;
