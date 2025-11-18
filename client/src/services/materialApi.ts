import axios from 'axios';

export interface Material {
  name: string;
  type?: string | null;
  spec?: string | null;
  quantity: number | null;
  unit: string;
  pending?: boolean; // 標記是否待設定
  collected?: boolean; // 是否已領料
}

export interface MaterialRequest {
  id: string;
  ticketId: string;
  deviceId: string;
  status: 'PENDING' | 'PREPARED' | 'CANCELLED';
  materials: string; // JSON string
  createdAt: string;
  updatedAt: string;
  ticket?: {
    id: string;
    deviceId: string;
    createdAt: string;
    schedules?: Array<{
      id: string;
      scheduledDate: string;
      scheduledTime?: string;
      target?: {
        id: string;
        name: string;
      };
    }>;
  };
}

function getApiBaseUrl(): string {
  const currentHost = window.location.hostname;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:5000/api';
  } else if (currentHost === 'irmed.workorder.ngrok.dev') {
    return 'https://irmed.woapi.ngrok.dev/api';
  } else if (currentHost.includes('.ngrok.dev') || currentHost.includes('.ngrok.io')) {
    const baseDomain = currentHost.replace('.ngrok.dev', '').replace('.ngrok.io', '');
    const tld = currentHost.includes('.ngrok.dev') ? '.ngrok.dev' : '.ngrok.io';
    return `https://${baseDomain}-api${tld}/api`;
  }
  
  return 'http://localhost:5000/api';
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：動態設置 baseURL
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export class MaterialService {
  /**
   * 查詢所有備料需求
   */
  static async getMaterialRequests(status?: string): Promise<ApiResponse<MaterialRequest[]>> {
    try {
      const params = status ? { status } : {};
      const response = await api.get('/materials', { params });
      return response.data;
    } catch (error: any) {
      console.error('查詢備料需求錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '查詢備料需求失敗',
      };
    }
  }

  /**
   * 查詢單一備料需求
   */
  static async getMaterialRequest(id: string): Promise<ApiResponse<MaterialRequest>> {
    try {
      const response = await api.get(`/materials/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('查詢備料需求錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '查詢備料需求失敗',
      };
    }
  }

  /**
   * 更新備料狀態
   */
  static async updateMaterialStatus(
    id: string,
    status: 'PENDING' | 'PREPARED' | 'CANCELLED'
  ): Promise<ApiResponse<MaterialRequest>> {
    try {
      const response = await api.put(`/materials/${id}/status`, { status });
      return response.data;
    } catch (error: any) {
      console.error('更新備料狀態錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '更新備料狀態失敗',
      };
    }
  }

  /**
   * 為工單計算並創建備料需求
   */
  static async calculateMaterials(ticketId: string): Promise<ApiResponse<MaterialRequest>> {
    try {
      const response = await api.post(`/materials/calculate/${ticketId}`);
      return response.data;
    } catch (error: any) {
      console.error('計算備料需求錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '計算備料需求失敗',
      };
    }
  }

  /**
   * 批量為所有現有工單計算備料需求
   */
  static async batchCalculateMaterials(): Promise<ApiResponse<{
    total: number;
    processed: number;
    created: number;
    updated: number;
    errors?: Array<{ ticketId: string; deviceId: string; error: string }>;
  }>> {
    try {
      const response = await api.post('/materials/batch-calculate');
      return response.data;
    } catch (error: any) {
      console.error('批量計算備料需求錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '批量計算備料需求失敗',
      };
    }
  }

  /**
   * 解析材料 JSON 字串
   */
  static parseMaterials(materialsJson: string): Material[] {
    try {
      return JSON.parse(materialsJson);
    } catch {
      return [];
    }
  }

  /**
   * 清空所有備料需求
   */
  static async clearAllMaterials(): Promise<ApiResponse<{ deletedCount: number }>> {
    try {
      const response = await api.delete('/materials');
      return response.data;
    } catch (error: any) {
      console.error('清空備料需求錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '清空備料需求失敗',
      };
    }
  }

  /**
   * 更新個別材料的領料狀態
   */
  static async updateMaterialCollectedStatus(
    materialRequestId: string,
    materialIndex: number,
    collected: boolean
  ): Promise<ApiResponse<MaterialRequest>> {
    try {
      const response = await api.put(`/materials/${materialRequestId}/material/${materialIndex}`, {
        collected
      });
      return response.data;
    } catch (error: any) {
      console.error('更新材料領料狀態錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '更新材料領料狀態失敗',
      };
    }
  }
}

