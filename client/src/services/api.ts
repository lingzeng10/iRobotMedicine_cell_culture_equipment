import axios, { AxiosResponse } from 'axios';
import { 
  Ticket, 
  CreateTicketRequest, 
  UpdateTicketRequest, 
  ApiResponse, 
  TicketListResponse 
} from '../types/ticket';

// 動態獲取 API URL（支援外部訪問）
const getApiBaseUrl = (): string => {
  // 如果當前訪問地址不是 localhost，自動構建 API URL
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const isHttps = typeof window !== 'undefined' ? window.location.protocol === 'https:' : false;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // 本機訪問，使用 localhost
    return 'http://localhost:5000/api';
  } else if (currentHost === 'irmed.workorder.ngrok.dev') {
    // 如果是前端的 ngrok 域名，使用後端的 ngrok URL（HTTPS）
    return 'https://irmed.woapi.ngrok.dev/api';
  } else if (currentHost.includes('.ngrok.dev') || currentHost.includes('.ngrok.io')) {
    // 如果是其他 ngrok 域名，嘗試推斷後端 URL
    // 假設前端域名是 xxx.ngrok.dev，後端是 xxx-api.ngrok.dev
    const baseDomain = currentHost.replace('.ngrok.dev', '').replace('.ngrok.io', '');
    const protocol = isHttps ? 'https' : 'http';
    const tld = currentHost.includes('.ngrok.dev') ? '.ngrok.dev' : '.ngrok.io';
    // 嘗試常見的後端域名模式
    if (baseDomain.includes('workorder')) {
      return 'https://irmed.woapi.ngrok.dev/api';
    }
    return `${protocol}://${baseDomain}-api${tld}/api`;
  } else {
    // 外部訪問（使用 IP 地址或其他域名），構建對應的 API URL
    const protocol = isHttps ? 'https' : 'http';
    return `${protocol}://${currentHost}:5000/api`;
  }
};

// 建立 axios 實例，設定基礎 URL 和預設配置
// 注意：baseURL 會在請求攔截器中動態設置
const api = axios.create({
  timeout: 10000, // 10 秒超時
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

// 請求攔截器 - 在發送請求前動態設置 baseURL 和添加認證資訊等
api.interceptors.request.use(
  (config) => {
    // 動態設置 baseURL（每次請求時都重新計算）
    if (!config.baseURL) {
      config.baseURL = getApiBaseUrl();
    }
    console.log(`發送 API 請求: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
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
