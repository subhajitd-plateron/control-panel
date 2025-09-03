export interface MissingOrder {
  refId: string;
  completionDate: string;
  status: string;
  orderId: string;
}

export interface MissingOrdersResponse {
  data: MissingOrder[] | null;
  message: string;
}

export interface MissingOrdersRequest {
  from_date: string;
  to_date: string;
}


export interface DateRange {
  fromDate: Date;
  toDate: Date;
}

export interface SyncStatusEvent {
  event_status: string;
  event_description: string;
  created_at: string;
}

export interface SyncStatusResponse {
  data: SyncStatusEvent[] | null;
  message: string;
}

// Analytics Dashboard Types
export interface OrderCountComparison {
  mongodb_count: number;
  reports_count: number;
  difference: number;
  last_updated: string;
}

export interface FailedOrder {
  refId: string;
  description: string;
  created_at: string;
  retry_count: number;
  order_id: string;
  sync_status: string;
  logs: string;
}

export interface SuccessOrder {
  ref_id: string;
  order_id: string;
  report_created_at: string;
}

export interface SuccessOrdersResponse {
  data: SuccessOrder[];
  message: string;
}

export interface FailedOrdersResponse {
  data: FailedOrder[];
  message: string;
}

export interface AnalyticsDashboardResponse {
  order_counts: OrderCountComparison;
  system_status: 'healthy' | 'warning' | 'critical';
}

export interface SyncOrderRequest {
  order_ref_id: string;
}

export interface SyncOrderResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Sales Mismatch Report Types
export interface MismatchRecord {
  order_ref_id: string;
  order_id: string;
  transaction_total: number;
  calculated_total: number;
  difference: number;
}

export interface MismatchReportRequest {
  from_date: string;
  to_date: string;
  business_ref_id: string;
  output_type: 'JSON' | 'CSV';
}

export interface MismatchReportResponse {
  data: MismatchRecord[] | null;
  message: string;
  error?: string;
}
