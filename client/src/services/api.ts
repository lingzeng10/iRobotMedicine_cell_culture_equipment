import axios, { AxiosResponse } from 'axios';
import { 
  Ticket, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  ApiResponse, 
  TicketListResponse 
} from '../types/ticket';

// 建立 axios 實例，設定基礎 URL 和預設配置
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000, // 10 秒超時
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

// 請求攔截器 - 在發送請求前添加認證資訊等
api.interceptors.request.use(
  (config) => {
    console.log(`發送 API 請求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('請求攔截器錯誤:', error);
    return Promise.reject(error);
  }
);

// 回應攔截器 - 統一處理回應和錯誤
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`API 回應成功: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API 回應錯誤:', error);
    
    // 統一錯誤處理
    if (error.response) {
      // 伺服器回應錯誤
      const { status, data } = error.response;
      console.error(`伺服器錯誤 ${status}:`, data);
    } else if (error.request) {
      // 網路錯誤
      console.error('網路錯誤:', error.request);
    } else {
      // 其他錯誤
      console.error('請求設定錯誤:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// 工單 API 服務類別
export class TicketService {
  /**
   * 建立新工單
   * @param ticketData 工單資料
   * @returns Promise<ApiResponse<Ticket>>
   */
  static async createTicket(ticketData: CreateTicketRequest): Promise<ApiResponse<Ticket>> {
    try {
      const response = await api.post('/tickets', ticketData);
      return response.data;
    } catch (error) {
      console.error('建立工單失敗:', error);
      throw error;
    }
  }

  /**
   * 查詢工單列表
   * @param params 查詢參數
   * @returns Promise<ApiResponse<TicketListResponse>>
   */
  static async getTickets(params?: {
    status?: string;
    deviceId?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<TicketListResponse>> {
    try {
      const response = await api.get('/tickets', { params });
      return response.data;
    } catch (error) {
      console.error('查詢工單列表失敗:', error);
      throw error;
    }
  }

  /**
   * 查詢單一工單詳情
   * @param id 工單 ID
   * @returns Promise<ApiResponse<Ticket>>
   */
  static async getTicket(id: string): Promise<ApiResponse<Ticket>> {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      console.error('查詢工單詳情失敗:', error);
      throw error;
    }
  }

  /**
   * 更新工單
   * @param id 工單 ID
   * @param updateData 更新資料
   * @returns Promise<ApiResponse<Ticket>>
   */
  static async updateTicket(id: string, updateData: UpdateTicketRequest): Promise<ApiResponse<Ticket>> {
    try {
      const response = await api.put(`/tickets/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('更新工單失敗:', error);
      throw error;
    }
  }
}

export default api;
