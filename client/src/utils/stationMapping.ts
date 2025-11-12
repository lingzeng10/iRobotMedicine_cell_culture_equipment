/**
 * 設備ID到Station的映射工具
 * 用於將設備ID轉換為對應的工作站顯示格式
 */

// 設備ID到工單名稱的映射表
const DEVICE_TO_TICKET_NAME_MAP: { [key: string]: string } = {
  'AOI': 'AOI工單',
  'Chang Medium': '換液工單',
  'Sub & Freeze': '繼代凍存工單',
  'Thaw': '解凍工單',
  'Freeze': '凍存工單',
  'Sub': '繼代工單',
  'Collect & Discard': '回收/丟棄工單',
};

// 設備ID到Station的映射表
const DEVICE_TO_STATION_MAP: { [key: string]: string } = {
  'AOI': 'AOI',
  'Chang Medium': 'CM & Sub',
  'Sub & Freeze': 'CM & Sub, Freeze',
  'Thaw': 'Freeze',
  'Freeze': 'CM & Sub, Freeze',
  'Sub': 'CM & Sub',
  'Collect & Discard': 'CM & Sub',
};

/**
 * 根據設備ID獲取對應的工單名稱
 * @param deviceId 設備ID
 * @returns 工單名稱，如果找不到對應的映射則返回原設備ID
 */
export const getTicketName = (deviceId: string): string => {
  return DEVICE_TO_TICKET_NAME_MAP[deviceId] || deviceId;
};

/**
 * 根據設備ID獲取對應的Station顯示文字
 * @param deviceId 設備ID
 * @returns Station顯示文字，如果找不到對應的映射則返回原設備ID
 */
export const getStationDisplay = (deviceId: string): string => {
  return DEVICE_TO_STATION_MAP[deviceId] || deviceId;
};

/**
 * 格式化工單顯示文字
 * @param ticketId 工單ID
 * @param deviceId 設備ID
 * @returns 格式化後的工單顯示文字
 */
export const formatTicketDisplay = (ticketId: string, deviceId: string): string => {
  const ticketName = getTicketName(deviceId);
  const station = getStationDisplay(deviceId);
  return `${ticketName} (Station: ${station})`;
};

/**
 * 獲取所有可用的設備ID列表
 * @returns 設備ID陣列
 */
export const getAvailableDeviceIds = (): string[] => {
  return Object.keys(DEVICE_TO_STATION_MAP);
};

/**
 * 獲取所有可用的Station列表
 * @returns Station陣列
 */
export const getAvailableStations = (): string[] => {
  return Array.from(new Set(Object.values(DEVICE_TO_STATION_MAP)));
};

// 工單狀態到中文顯示的映射表
const STATUS_TO_TEXT_MAP: { [key: string]: string } = {
  'NOT_STARTED': '未開始',
  'OPEN': '未開始', // 將「開啟」改為「未開始」
  'IN_PROGRESS': '進行中',
  'COMPLETED': '已完成',
  'CLOSED': '已完成', // 兼容舊的狀態值
  'CANCELLED': '已取消',
};

// 工單狀態到顏色的映射表（MUI Chip 顏色）
const STATUS_TO_COLOR_MAP: { [key: string]: string } = {
  'NOT_STARTED': 'default',
  'OPEN': 'default',
  'IN_PROGRESS': 'primary',
  'COMPLETED': 'success',
  'CLOSED': 'success', // 兼容舊的狀態值
  'CANCELLED': 'error',
};

// 工單狀態到自定義顏色的映射表（十六進制顏色）
const STATUS_TO_CUSTOM_COLOR_MAP: { [key: string]: string } = {
  'NOT_STARTED': '#F0F04D', // 黃色
  'OPEN': '#F0F04D', // 兼容：開啟也使用黃色
  'IN_PROGRESS': '#4D99F0', // 藍色
  'COMPLETED': '#7BF04D', // 綠色
  'CLOSED': '#7BF04D', // 兼容：已完成也使用綠色
  'CANCELLED': '#ff3366', // 紅色（保持原有的錯誤顏色）
};

/**
 * 根據工單狀態獲取對應的中文顯示文字
 * @param status 工單狀態
 * @returns 中文狀態文字，如果找不到對應的映射則返回原狀態
 */
export const getStatusText = (status: string): string => {
  return STATUS_TO_TEXT_MAP[status] || status;
};

/**
 * 根據工單狀態獲取對應的顏色
 * @param status 工單狀態
 * @returns 顏色名稱，如果找不到對應的映射則返回 'default'
 */
export const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' => {
  const color = STATUS_TO_COLOR_MAP[status] || 'default';
  return color as 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
};

/**
 * 根據工單狀態獲取對應的自定義顏色（十六進制）
 * @param status 工單狀態
 * @returns 十六進制顏色值，如果找不到對應的映射則返回 '#F0F04D'（未開始的顏色）
 */
export const getStatusCustomColor = (status: string): string => {
  return STATUS_TO_CUSTOM_COLOR_MAP[status] || '#F0F04D';
};