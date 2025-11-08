import { Ticket } from './ticket';

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
  name: string;                    // 目標名稱（細胞）
  materialType?: string;            // 收集原料種類
  responsiblePerson?: string;      // 負責人員（OP001, OP002, OP003）
  productionTarget?: string;       // 生產目標（如 "3L"）
  startCultureDate?: string;        // 起始培養日期
  generation?: number;             // 代數
  boxCount?: number;                // 盒數
  expectedCompletionDate: string;  // 預計完成時間
  status: TargetStatus;            // 目標狀態
  createdAt: string;              // 建立時間
  updatedAt: string;              // 更新時間
}

// 建立預生產目標請求介面
export interface CreateTargetRequest {
  name: string;
  materialType?: string;           // 收集原料種類
  responsiblePerson?: string;      // 負責人員（OP001, OP002, OP003）
  productionTarget?: string;       // 生產目標（如 "3L"）
  startCultureDate?: string;        // 起始培養日期
  generation?: number;             // 代數
  boxCount?: number;                // 盒數
  expectedCompletionDate: string;
}

// 更新預生產目標請求介面
export interface UpdateTargetRequest {
  name?: string;
  materialType?: string;           // 收集原料種類
  responsiblePerson?: string;      // 負責人員（OP001, OP002, OP003）
  productionTarget?: string;       // 生產目標（如 "3L"）
  startCultureDate?: string;        // 起始培養日期
  generation?: number;             // 代數
  boxCount?: number;                // 盒數
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
  ticket: Ticket; // 使用完整的 Ticket 類型
  target: {
    id: string;
    name: string;
    materialType?: string;
    responsiblePerson?: string;
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
  deviceId?: string; // 工單類型（deviceId）
}

// 生產排程表格資料介面
export interface ProductionScheduleRow {
  id: string;
  cellName: string;                // 細胞（原生產目標名稱）
  productionTarget: string;        // 生產目標（如 "3L"）
  actualProduction: string;        // 實際即時產量（如 "1L"）
  startCultureDate: string;        // 起始培養日期
  generation: number;              // 代數
  boxCount: number;                // 盒數
  // 可選的日期欄位（用於水平滾動）
  dates?: {
    [date: string]: {
      schedules?: TicketScheduleWithRelations[]; // 該日期的所有排程
      recoveryVolume?: string;     // 回收量
      actualRecoveryVolume?: string; // 實際回收量
      workOrderType?: string;       // 工單類型
      scheduleId?: string; // 保留向後兼容
      status?: string;
      notes?: string;
    };
  };
}
