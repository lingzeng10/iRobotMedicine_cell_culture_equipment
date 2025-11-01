/**
 * 動態獲取 API URL
 * 如果從外部訪問，自動使用當前主機的 IP 地址
 */
export const getApiUrl = (): string => {
  // 優先使用環境變數
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 如果當前訪問地址不是 localhost，自動構建 API URL
  const currentHost = window.location.hostname;
  
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    // 本機訪問，使用 localhost
    return 'http://localhost:5000/api';
  } else {
    // 外部訪問（使用 IP 地址），構建對應的 API URL
    const port = window.location.port === '3000' ? '5000' : window.location.port;
    return `http://${currentHost}:${port}/api`;
  }
};

// 獲取完整的 API 基礎 URL（不含 /api）
export const getApiBaseUrl = (): string => {
  const apiUrl = getApiUrl();
  return apiUrl.replace('/api', '');
};

