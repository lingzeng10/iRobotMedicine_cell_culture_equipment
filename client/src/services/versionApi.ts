import axios from 'axios';
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
      const response = await axios.get(`${getApiBaseUrl()}/version`);
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
      const response = await axios.get(`${getApiBaseUrl()}/version/changelog`);
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
      const response = await axios.get(`${getApiBaseUrl()}/version/check`, {
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
      version: '1.5.0',
      buildNumber: '20251112-001',
      releaseDate: '2025-11-12',
      changelog: [
        {
          version: '1.5.0',
          date: '2025-11-12',
          changes: [
            '🤖 新增AI agent智能助手功能',
            '📊 新增工單狀態顯示（未開始、進行中、已完成）',
            '📅 新增排程日曆功能',
            '🎨 工單狀態顏色標示（未開始：黃色、進行中：藍色、已完成：綠色）',
            '✏️ 支援編輯工單狀態',
            '🔄 優化生產排程表格顯示'
          ]
        },
        {
          version: '1.4.0',
          date: '2025-11-04',
          changes: [
            '♻️ 新增回收/丟棄工單詳情功能',
            '📦 新增收集原料種類欄位（下拉選單）',
            '👤 新增負責人員欄位（OP001、OP002、OP003）',
            '🔄 優化預生產目標表單',
            '📊 更新 Excel 匯出功能'
          ]
        },
        {
          version: '1.3.0',
          date: '2025-11-02',
          changes: [
            '📅 新增今日排程功能',
            '🔄 優化排程查詢與顯示',
            '🎯 支援按日期篩選排程'
          ]
        },
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
        '今日排程功能',
        '回收/丟棄工單詳情',
        '收集原料種類管理',
        '負責人員指派',
        '照片上傳管理',
        'Excel 資料匯出',
        '外部設備訪問',
        '智慧醫療主題',
        'AI agent智能助手',
        '工單狀態顯示與編輯',
        '排程日曆'
      ]
    };
  }
}

export default new VersionService();
