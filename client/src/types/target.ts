// 預生產目標狀態枚舉
export enum TargetStatus {
  PLANNING = 'PLANNING',     // 規劃中
  IN_PROGRESS = 'IN_PROGRESS', // 進行中
  COMPLETED = 'COMPLETED',   // 已完成
  CANCELLED = 'CANCELLED'    // 已取消
}

// 預生產目標資料介面
export interface ProductionTarget {
  id: string;
  name: string;                    // 目標名稱
  description?: string;            // 目標描述
  expectedCompletionDate: string;  // 預計完成時間
  status: TargetStatus;            // 目標狀態
  createdAt: string;              // 建立時間
  updatedAt: string;              // 更新時間
}

// 建立預生產目標請求介面
export interface CreateTargetRequest {
  name: string;
  description?: string;
  expectedCompletionDate: string;
}

// 更新預生產目標請求介面
export interface UpdateTargetRequest {
  name?: string;
  description?: string;
  expectedCompletionDate?: string;
  status?: TargetStatus;
}

// 預生產目標列表回應介面
export interface TargetListResponse {
  targets: ProductionTarget[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// 工單排程資料介面
export interface TicketSchedule {
  id: string;
  ticketId: string;
  targetId: string;
  scheduledDate: string;          // 排程日期
  scheduledTime?: string;         // 排程時間
  priority: 'HIGH' | 'MEDIUM' | 'LOW'; // 優先級
  status: string;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}

// 包含關聯資料的工單排程介面（用於 API 回應）
export interface TicketScheduleWithRelations extends TicketSchedule {
  ticket: {
    id: string;
    deviceId: string;
    imageId?: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  target: {
    id: string;
    name: string;
    description?: string;
    expectedCompletionDate: string;
    status: TargetStatus;
    createdAt: string;
    updatedAt: string;
  };
}
// 建立工單排程請求介面
export interface CreateScheduleRequest {
  ticketId: string;
  targetId: string;
  scheduledDate: string;
  scheduledTime?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// 更新工單排程請求介面
export interface UpdateScheduleRequest {
  scheduledDate?: string;
  scheduledTime?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  status?: string;
}
