import axios from 'axios';
import { 
  ProductionTarget, 
  CreateTargetRequest, 
  UpdateTargetRequest, 
  TargetListResponse,
  TicketSchedule,
  TicketScheduleWithRelations,
  CreateScheduleRequest,
  UpdateScheduleRequest
} from '../types/target';
import { ApiResponse } from '../types/ticket';

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

// 建立 axios 實例，設定基礎 URL
// 注意：baseURL 會在請求攔截器中動態設置
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 動態設置 baseURL
api.interceptors.request.use(
  (config) => {
    // 動態設置 baseURL（每次請求時都重新計算）
    if (!config.baseURL) {
      config.baseURL = getApiBaseUrl();
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 預生產目標 API 服務類別
export class TargetService {
  /**
   * 取得所有預生產目標列表
   * @param page 頁碼
   * @param limit 每頁數量
   * @param status 狀態篩選
   */
  static async getTargets(
    page: number = 1, 
    limit: number = 10, 
    status?: string
  ): Promise<ApiResponse<TargetListResponse>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });

      const response = await api.get(`/targets?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('取得預生產目標列表失敗:', error);
      console.error('API URL:', getApiBaseUrl());
      console.error('錯誤詳情:', error.response?.data || error.message);
      
      let errorMessage = '取得預生產目標列表失敗';
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        errorMessage = '無法連接到後端服務，請確認後端服務是否運行';
      } else if (error.response?.status === 404) {
        errorMessage = 'API 端點不存在，請確認後端服務配置';
      } else if (error.response?.status === 500) {
        errorMessage = '後端服務錯誤，請檢查後端服務控制台';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * 取得單一預生產目標詳情
   * @param targetId 目標 ID
   */
  static async getTarget(targetId: string): Promise<ApiResponse<ProductionTarget>> {
    try {
      const response = await api.get(`/targets/${targetId}`);
      return response.data;
    } catch (error: any) {
      console.error('取得預生產目標詳情失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '取得預生產目標詳情失敗',
      };
    }
  }

  /**
   * 建立新的預生產目標
   * @param data 目標資料
   */
  static async createTarget(data: CreateTargetRequest): Promise<ApiResponse<ProductionTarget>> {
    try {
      const response = await api.post('/targets', data);
      return response.data;
    } catch (error: any) {
      console.error('建立預生產目標失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '建立預生產目標失敗',
      };
    }
  }

  /**
   * 更新預生產目標
   * @param targetId 目標 ID
   * @param data 更新資料
   */
  static async updateTarget(
    targetId: string, 
    data: UpdateTargetRequest
  ): Promise<ApiResponse<ProductionTarget>> {
    try {
      const response = await api.put(`/targets/${targetId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('更新預生產目標失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '更新預生產目標失敗',
      };
    }
  }

  /**
   * 刪除預生產目標
   * @param targetId 目標 ID
   */
  static async deleteTarget(targetId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/targets/${targetId}`);
      return response.data;
    } catch (error: any) {
      console.error('刪除預生產目標失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '刪除預生產目標失敗',
      };
    }
  }

  /**
   * 取得指定目標的工單排程
   * @param targetId 目標 ID
   */
  static async getTargetSchedules(targetId: string): Promise<ApiResponse<TicketScheduleWithRelations[]>> {
    try {
      const response = await api.get(`/schedules/target/${targetId}`);
      return response.data;
    } catch (error: any) {
      console.error('取得工單排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '取得工單排程失敗',
      };
    }
  }

  /**
   * 取得指定日期的所有排程
   * @param date 日期 (格式: YYYY-MM-DD)
   */
  static async getSchedulesByDate(date: string): Promise<ApiResponse<TicketScheduleWithRelations[]>> {
    try {
      const response = await api.get(`/schedules?date=${date}&limit=1000`);
      if (response.data.success && response.data.data?.schedules) {
        return {
          success: true,
          message: response.data.message,
          data: response.data.data.schedules,
        };
      }
      return {
        success: false,
        message: response.data.message || '取得今日排程失敗',
      };
    } catch (error: any) {
      console.error('取得今日排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '取得今日排程失敗',
      };
    }
  }

  /**
   * 建立工單排程
   * @param data 排程資料
   */
  static async createSchedule(data: CreateScheduleRequest): Promise<ApiResponse<TicketScheduleWithRelations>> {
    try {
      const response = await api.post('/schedules', data);
      return response.data;
    } catch (error: any) {
      console.error('建立工單排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '建立工單排程失敗',
      };
    }
  }

  /**
   * 更新工單排程
   * @param scheduleId 排程 ID
   * @param data 更新資料
   */
  static async updateSchedule(
    scheduleId: string, 
    data: UpdateScheduleRequest
  ): Promise<ApiResponse<TicketScheduleWithRelations>> {
    try {
      const response = await api.put(`/schedules/${scheduleId}`, data);
      return response.data;
    } catch (error: any) {
      console.error('更新工單排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '更新工單排程失敗',
      };
    }
  }

  /**
   * 刪除工單排程
   * @param scheduleId 排程 ID
   */
  static async deleteSchedule(scheduleId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/schedules/${scheduleId}`);
      return response.data;
    } catch (error: any) {
      console.error('刪除工單排程失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '刪除工單排程失敗',
      };
    }
  }
}
