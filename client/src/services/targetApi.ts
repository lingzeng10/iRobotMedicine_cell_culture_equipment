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

// 建立 axios 實例，設定基礎 URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      return {
        success: false,
        message: error.response?.data?.message || '取得預生產目標列表失敗',
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
  static async getTargetSchedules(targetId: string): Promise<ApiResponse<TicketSchedule[]>> {
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
  ): Promise<ApiResponse<TicketSchedule>> {
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
