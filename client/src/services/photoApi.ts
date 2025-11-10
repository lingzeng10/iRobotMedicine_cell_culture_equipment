/**
 * 照片相關 API 服務
 * 處理照片上傳、查看、刪除等功能
 */

import axios from 'axios';

// 動態獲取 API URL（支援外部訪問）
const getApiBaseUrl = (): string => {
  // 優先使用環境變數
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 如果當前訪問地址不是 localhost，自動構建 API URL
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const isHttps = typeof window !== 'undefined' ? window.location.protocol === 'https:' : false;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // 本機訪問，使用 localhost
    return 'http://localhost:5000/api';
  } else if (currentHost === 'irmed.workorder.ngrok.dev') {
    // 如果是前端的 ngrok 域名，使用後端的 ngrok URL（HTTPS）
    return 'https://irmed.woapi.ngrok.dev/api';
  } else {
    // 外部訪問（使用 IP 地址），構建對應的 API URL
    const protocol = isHttps ? 'https' : 'http';
    return `${protocol}://${currentHost}:5000/api`;
  }
};

// API 基礎配置
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000, // 30 秒超時（照片上傳可能需要更長時間）
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

// 照片介面
export interface Photo {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  uploadedAt: string;
  url: string;
}

// API 回應介面
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// 照片列表回應介面
export interface PhotoListResponse {
  photos: Photo[];
}

/**
 * 照片服務類
 */
export class PhotoService {
  /**
   * 上傳照片
   * @param ticketId 工單ID
   * @param file 照片文件
   * @param description 照片描述
   */
  static async uploadPhoto(
    ticketId: string,
    file: File,
    description?: string
  ): Promise<ApiResponse<Photo>> {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('ticketId', ticketId);
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('上傳照片失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '上傳照片失敗',
      };
    }
  }

  /**
   * 獲取指定工單的所有照片
   * @param ticketId 工單ID
   */
  static async getTicketPhotos(ticketId: string): Promise<ApiResponse<Photo[]>> {
    try {
      const response = await api.get(`/photos/ticket/${ticketId}`);
      return response.data;
    } catch (error: any) {
      console.error('獲取照片列表失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '獲取照片列表失敗',
      };
    }
  }

  /**
   * 刪除照片
   * @param photoId 照片ID
   */
  static async deletePhoto(photoId: string): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/photos/${photoId}`);
      return response.data;
    } catch (error: any) {
      console.error('刪除照片失敗:', error);
      return {
        success: false,
        message: error.response?.data?.message || '刪除照片失敗',
      };
    }
  }

  /**
   * 獲取照片查看URL
   * @param photoId 照片ID
   */
  static getPhotoViewUrl(photoId: string): string {
    // 使用動態 API URL
    const apiBaseUrl = getApiBaseUrl();
    return `${apiBaseUrl}/photos/${photoId}/view`;
  }
}
