// 工單狀態枚舉
export enum TicketStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}

// 工單資料介面
export interface Ticket {
  id: string;
  deviceId: string;
  imageId?: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
}

// 建立工單請求介面
export interface CreateTicketRequest {
  deviceId: string;
  imageId?: string;
}

// 更新工單請求介面
export interface UpdateTicketRequest {
  status?: TicketStatus;
}

// API 回應介面
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// 分頁資訊介面
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// 工單列表回應介面
export interface TicketListResponse {
  tickets: Ticket[];
  pagination: PaginationInfo;
}
