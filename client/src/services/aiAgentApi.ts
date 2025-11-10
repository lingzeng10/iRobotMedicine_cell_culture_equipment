import axios from 'axios';
import { ApiResponse } from '../types/ticket';

const getApiBaseUrl = (): string => {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const isHttps = typeof window !== 'undefined' ? window.location.protocol === 'https:' : false;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:5000/api';
  } else if (currentHost === 'irmed.workorder.ngrok.dev') {
    // 如果是前端的 ngrok 域名，使用後端的 ngrok URL（HTTPS）
    return 'https://irmed.woapi.ngrok.dev/api';
  } else {
    const protocol = isHttps ? 'https' : 'http';
    return `${protocol}://${currentHost}:5000/api`;
  }
};

const API_BASE_URL = getApiBaseUrl();

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  data?: any;
  timestamp: string;
}

export interface ChatResponse {
  response: string;
  data?: any;
  intent: string;
  conversationId: string;
}

export interface OllamaStatus {
  models: Array<{ name: string; size: number }>;
  modelCount: number;
  currentModel: string;
}

class AIAgentService {
  /**
   * 發送訊息給 AI Agent
   */
  async sendMessage(
    message: string,
    conversationId?: string
  ): Promise<ApiResponse<ChatResponse>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
        message,
        conversationId,
      });
      return response.data;
    } catch (error: any) {
      console.error('AI Agent 錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'AI Agent 請求失敗',
        data: undefined,
      };
    }
  }

  /**
   * 檢查 Ollama 服務狀態
   */
  async checkStatus(): Promise<ApiResponse<OllamaStatus>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai/status`);
      return response.data;
    } catch (error: any) {
      console.error('檢查 Ollama 狀態錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '無法連接 Ollama 服務',
        data: undefined,
      };
    }
  }
}

export default new AIAgentService();

