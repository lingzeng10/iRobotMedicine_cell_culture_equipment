import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { TicketService } from '../services/api';
import { CreateTicketRequest } from '../types/ticket';

interface TicketFormProps {
  onSuccess?: () => void; // 成功回調函數
}

/**
 * 工單建立表單元件
 * 提供建立新工單的表單介面
 */
const TicketForm: React.FC<TicketFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  /**
   * 處理表單提交
   * @param values 表單資料
   */
  const handleSubmit = async (values: CreateTicketRequest) => {
    setLoading(true);
    
    try {
      // 呼叫 API 建立工單
      const response = await TicketService.createTicket(values);
      
      if (response.success) {
        message.success('工單建立成功！');
        form.resetFields(); // 重置表單
        
        // 執行成功回調
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(response.message || '建立工單失敗');
      }
    } catch (error: any) {
      console.error('建立工單錯誤:', error);
      
      // 處理錯誤訊息
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else if (error.response?.data?.errors) {
        // 顯示驗證錯誤
        const errorMessages = error.response.data.errors.map((err: any) => err.msg).join(', ');
        message.error(`驗證失敗: ${errorMessages}`);
      } else {
        message.error('建立工單失敗，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card 
      title="建立新工單" 
      style={{ marginBottom: 24 }}
      extra={<PlusOutlined />}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        {/* 設備 ID 輸入欄位 */}
        <Form.Item
          label="設備 ID"
          name="deviceId"
          rules={[
            { required: true, message: '請輸入設備 ID' },
            { min: 1, message: '設備 ID 不能為空' }
          ]}
        >
          <Input 
            placeholder="請輸入設備 ID" 
            size="large"
          />
        </Form.Item>

        {/* 影像 ID 輸入欄位（可選） */}
        <Form.Item
          label="影像 ID"
          name="imageId"
          rules={[
            { min: 1, message: '影像 ID 不能為空' }
          ]}
        >
          <Input 
            placeholder="請輸入影像 ID（可選）" 
            size="large"
          />
        </Form.Item>


        {/* 提交按鈕 */}
        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              icon={<PlusOutlined />}
            >
              建立工單
            </Button>
            <Button 
              onClick={() => form.resetFields()}
              size="large"
            >
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TicketForm;
