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
  magnification?: string; // 拍照倍數（僅 AOI 工單使用：4X, 10X, 20X）
  photoCount?: number; // 張數（僅 AOI 工單使用：3, 6, 9, 12, 16, 20, 27）
  mediumType?: string; // 培養液種類（僅換液工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5）
  recycledMediumType?: string; // 回收培養液種類（僅換液工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5）
  parentBoxCount?: number; // 親代盒數（僅繼代凍存工單使用）
  childBoxCount?: number; // 子代盒數（僅繼代凍存工單使用）
  subcultureMediumType?: string; // 繼代培養液種類（僅繼代凍存工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5）
  subcultureRecycledMediumType?: string; // 回收培養液種類（僅繼代凍存工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5, 不回收）
  frozenCellBoxCount?: number; // 凍存細胞盒數（僅繼代凍存工單使用）
  frozenTubeSpec?: string; // 凍管規格（僅繼代凍存工單使用：2ml, 5ml）
  frozenMediumType?: string; // 凍液種類（僅繼代凍存工單使用：凍液A, 凍液B）
  frozenTubeCount?: number; // 凍管支數（僅繼代凍存工單使用）
  thawCellName?: string; // 解凍細胞（僅解凍工單使用）
  thawCellGeneration?: number; // 細胞凍存代數（僅解凍工單使用）
  thawOriginalMediumType?: string; // 細胞凍存原培養液（僅解凍工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5, 無紀錄）
  thawFreezeDate?: string; // 凍管凍存日期（僅解凍工單使用）
  thawTubeCount?: number; // 解凍支數（僅解凍工單使用）
  thawMediumType?: string; // 解凍培養液（僅解凍工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5）
  thawCultureBoxCount?: number; // 解凍培養盒數（僅解凍工單使用）
  freezeBoxCount?: number; // 凍存盒數（僅凍存工單使用）
  freezeTubeCount?: number; // 凍管數量（僅凍存工單使用）
  freezeTubeSpec?: string; // 凍管規格（僅凍存工單使用：2ml, 5ml）
  freezeMediumType?: string; // 凍液種類（僅凍存工單使用：凍液A, 凍液B）
  subParentBoxCount?: number; // 親代盒數（僅繼代工單使用）
  subChildBoxCount?: number; // 子代盒數（僅繼代工單使用）
  subMediumType?: string; // 繼代培養液種類（僅繼代工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5）
  subRecycledMediumType?: string; // 回收培養液種類（僅繼代工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5, 不回收）
  collectDiscardBoxCount?: number; // 回收/丟盒數（僅回收/丟棄工單使用）
  collectDiscardRecycledMediumType?: string; // 回收培養液種類（僅回收/丟棄工單使用，可選：022-02.4, 022-02.1, SAM10, CM2, AM5）
  scheduleConfirmed?: boolean; // 是否已確認排程
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
  magnification?: string; // 拍照倍數（僅 AOI 工單使用：4X, 10X, 20X）
  photoCount?: number; // 張數（僅 AOI 工單使用：3, 6, 9, 12, 16, 20, 27）
  mediumType?: string; // 培養液種類（僅換液工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5）
  recycledMediumType?: string; // 回收培養液種類（僅換液工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5）
  parentBoxCount?: number; // 親代盒數（僅繼代凍存工單使用）
  childBoxCount?: number; // 子代盒數（僅繼代凍存工單使用）
  subcultureMediumType?: string; // 繼代培養液種類（僅繼代凍存工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5）
  subcultureRecycledMediumType?: string; // 回收培養液種類（僅繼代凍存工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5, 不回收）
  frozenCellBoxCount?: number; // 凍存細胞盒數（僅繼代凍存工單使用）
  frozenTubeSpec?: string; // 凍管規格（僅繼代凍存工單使用：2ml, 5ml）
  frozenMediumType?: string; // 凍液種類（僅繼代凍存工單使用：凍液A, 凍液B）
  frozenTubeCount?: number; // 凍管支數（僅繼代凍存工單使用）
  thawCellName?: string; // 解凍細胞（僅解凍工單使用）
  thawCellGeneration?: number; // 細胞凍存代數（僅解凍工單使用）
  thawOriginalMediumType?: string; // 細胞凍存原培養液（僅解凍工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5, 無紀錄）
  thawFreezeDate?: string; // 凍管凍存日期（僅解凍工單使用）
  thawTubeCount?: number; // 解凍支數（僅解凍工單使用）
  thawMediumType?: string; // 解凍培養液（僅解凍工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5）
  thawCultureBoxCount?: number; // 解凍培養盒數（僅解凍工單使用）
  freezeBoxCount?: number; // 凍存盒數（僅凍存工單使用）
  freezeTubeCount?: number; // 凍管數量（僅凍存工單使用）
  freezeTubeSpec?: string; // 凍管規格（僅凍存工單使用：2ml, 5ml）
  freezeMediumType?: string; // 凍液種類（僅凍存工單使用：凍液A, 凍液B）
  subParentBoxCount?: number; // 親代盒數（僅繼代工單使用）
  subChildBoxCount?: number; // 子代盒數（僅繼代工單使用）
  subMediumType?: string; // 繼代培養液種類（僅繼代工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5）
  subRecycledMediumType?: string; // 回收培養液種類（僅繼代工單使用：022-02.4, 022-02.1, SAM10, CM2, AM5, 不回收）
  collectDiscardBoxCount?: number; // 回收/丟盒數（僅回收/丟棄工單使用）
  collectDiscardRecycledMediumType?: string; // 回收培養液種類（僅回收/丟棄工單使用，可選：022-02.4, 022-02.1, SAM10, CM2, AM5）
  scheduleConfirmed?: boolean; // 是否已確認排程
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
