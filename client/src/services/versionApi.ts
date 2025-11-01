import axios from 'axios';
import { ApiResponse } from '../types/ticket';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// 版本資訊介面
export interface VersionInfo {
  version: string;
  buildNumber: string;
  releaseDate: string;
  changelog: ChangelogEntry[];
  features: string[];
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

export interface VersionCheckResult {
  hasUpdate: boolean;
  currentVersion: string;
  clientVersion: string;
  latestChangelog: ChangelogEntry;
  updateAvailable: boolean;
}

/**
 * 版本服務類
 * 提供版本資訊、更新日誌和更新檢查功能
 */
class VersionService {
  /**
   * 獲取當前版本資訊
   * @returns Promise<ApiResponse<VersionInfo>>
   */
  async getVersionInfo(): Promise<ApiResponse<VersionInfo>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/version`);
      return response.data;
    } catch (error: any) {
      console.error('獲取版本資訊錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '獲取版本資訊失敗',
        data: undefined
      };
    }
  }

  /**
   * 獲取更新日誌
   * @returns Promise<ApiResponse<{changelog: ChangelogEntry[], currentVersion: string, buildNumber: string}>>
   */
  async getChangelog(): Promise<ApiResponse<{changelog: ChangelogEntry[], currentVersion: string, buildNumber: string}>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/version/changelog`);
      return response.data;
    } catch (error: any) {
      console.error('獲取更新日誌錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '獲取更新日誌失敗',
        data: undefined
      };
    }
  }

  /**
   * 檢查是否有更新
   * @param clientVersion 客戶端版本
   * @returns Promise<ApiResponse<VersionCheckResult>>
   */
  async checkForUpdates(clientVersion: string): Promise<ApiResponse<VersionCheckResult>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/version/check`, {
        params: { version: clientVersion }
      });
      return response.data;
    } catch (error: any) {
      console.error('檢查更新錯誤:', error);
      return {
        success: false,
        message: error.response?.data?.message || '檢查更新失敗',
        data: undefined
      };
    }
  }

  /**
   * 獲取本地版本資訊（從package.json）
   * @returns VersionInfo
   */
  getLocalVersionInfo(): VersionInfo {
    return {
      version: '1.2.0',
      buildNumber: '20241027-001',
      releaseDate: '2024-10-27',
      changelog: [
        {
          version: '1.2.0',
          date: '2024-10-27',
          changes: [
            '✨ 新增外部設備訪問功能',
            '🔧 修正Windows環境變數問題',
            '📱 支援手機/平板訪問',
            '🎨 優化智慧醫療藍白主題',
            '🖼️ 完善照片管理功能'
          ]
        }
      ],
      features: [
        '工單管理系統',
        '預生產目標管理', 
        '工單排程功能',
        '照片上傳管理',
        '外部設備訪問',
        '智慧醫療主題'
      ]
    };
  }
}

export default new VersionService();
