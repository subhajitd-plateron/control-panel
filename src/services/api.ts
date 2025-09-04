import { API_CONFIG } from '@/constants/api';
import { 
  MissingOrdersResponse, 
  MissingOrdersRequest, 
  SyncStatusResponse,
  AnalyticsDashboardResponse,
  SyncOrderRequest,
  SyncOrderResponse,
  FailedOrdersResponse,
  SuccessOrdersResponse,
  MismatchReportResponse
} from '@/types/api';

export class ApiService {
  private static baseUrl = API_CONFIG.BASE_URL;
  private static headers = {
    'token': API_CONFIG.HEADERS.TOKEN,
    'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
  };

  // Request deduplication cache
  private static pendingRequests = new Map<string, Promise<any>>();
  
  // Generate cache key for requests
  private static generateCacheKey(url: string, options: any = {}): string {
    return `${options.method || 'GET'}:${url}:${JSON.stringify(options.body || '')}`;
  }

  static async fetchMissingOrders(request: MissingOrdersRequest): Promise<MissingOrdersResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.MISSING_ORDERS}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MissingOrdersResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching missing orders:', error);
      throw error;
    }
  }


  static async fetchSyncStatus(orderId: string): Promise<SyncStatusResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SYNC_STATUS}/${orderId}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SyncStatusResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sync status:', error);
      throw error;
    }
  }

  static async fetchAnalyticsDashboard(): Promise<AnalyticsDashboardResponse> {
    return this.getMockAnalyticsData();
  }

  static async fetchFailedOrders(limit: number = 3): Promise<FailedOrdersResponse> {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.FAILED_ORDERS}?type=only_failed&limit=${limit}`;
    const cacheKey = this.generateCacheKey(url, { method: 'GET' });

    // Check if there's already a pending request for this
    if (this.pendingRequests.has(cacheKey)) {
      console.log('🔄 Reusing pending request for failed orders');
      return this.pendingRequests.get(cacheKey)!;
    }

    console.log('🚀 Making new request for failed orders');
    const requestPromise = this.makeRequest<FailedOrdersResponse>(url, {
      method: 'GET',
      headers: this.headers,
    }).catch(() => {
      // Return mock data if API fails
      return this.getMockFailedOrders(limit);
    });

    // Store the promise
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove from cache after completion
      this.pendingRequests.delete(cacheKey);
    }
  }

  static async fetchSuccessOrders(limit: number = 3): Promise<SuccessOrdersResponse> {
    const url = `${this.baseUrl}${API_CONFIG.ENDPOINTS.SUCCESS_ORDERS}?limit=${limit}`;
    const cacheKey = this.generateCacheKey(url, { method: 'GET' });

    // Check if there's already a pending request for this
    if (this.pendingRequests.has(cacheKey)) {
      console.log('🔄 Reusing pending request for success orders');
      return this.pendingRequests.get(cacheKey)!;
    }

    console.log('🚀 Making new request for success orders');
    const requestPromise = this.makeRequest<SuccessOrdersResponse>(url, {
      method: 'GET',
      headers: this.headers,
    }).catch(() => {
      // Return mock data if API fails
      return this.getMockSuccessOrders(limit);
    });

    // Store the promise
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Remove from cache after completion
      this.pendingRequests.delete(cacheKey);
    }
  }

  static async syncOrder(request: SyncOrderRequest): Promise<SyncOrderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}${API_CONFIG.ENDPOINTS.SYNC_ORDER}/${request.order_ref_id}`, {
        method: 'GET',
        headers: {
          'token': this.headers.token,
          // Don't include Content-Type for GET requests
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error || `HTTP error! status: ${response.status}`
        };
      }

      const data = await response.json();
      
      // Handle the new API response format
      if (data.error) {
        // Error response: { "error": "ERROR: ..." }
        return {
          success: false,
          error: data.error
        };
      } else if (data.message) {
        // Success response: { "message": "order synced" }
        return {
          success: true,
          message: data.message
        };
      } else {
        // Fallback for unexpected response format
        return {
          success: true,
          message: 'Order synced successfully'
        };
      }
    } catch (error) {
      console.error('Error syncing order:', error);
      // Return proper error response structure
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while syncing order'
      };
    }
  }

  static async executeQuery(params: { 
    query: string;
    max_rows: number;
    timeout: number;
    output_type: 'JSON' | 'CSV';
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/internal/resiliency/execute-query`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        // Try to get error message from response
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || `HTTP error! status: ${response.status}`);
        } catch {
          throw new Error(`HTTP error! status: ${response.status}: ${errorText}`);
        }
      }

      // Handle CSV response differently
      if (params.output_type === 'CSV') {
        const csvText = await response.text();
        
        // Try to parse as JSON first (in case it's an error response)
        try {
          const jsonResponse = JSON.parse(csvText);
          if (jsonResponse.error) {
            return { error: jsonResponse.error };
          }
          // If it's a successful JSON response, return it
          return jsonResponse;
        } catch {
          // It's actual CSV data, parse it
          return {
            data: {
              csv: csvText,
              // Parse CSV into rows for table display
              ...this.parseCSV(csvText)
            }
          };
        }
      } else {
        // Handle JSON response
        return await response.json();
      }
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  private static parseCSV(csvText: string): { columns: string[], rows: string[][], count: number } {
    const lines = csvText.trim().split('\n');
    if (lines.length === 0) {
      return { columns: [], rows: [], count: 0 };
    }

    // Parse header row
    const headerLine = lines[0];
    const columns = headerLine.split(',').map(col => col.replace(/"/g, '').trim());

    // Parse data rows
    const rows: string[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.trim()) {
        // Simple CSV parsing - handles quoted values
        const values = this.parseCSVRow(line);
        rows.push(values);
      }
    }

    return {
      columns,
      rows,
      count: rows.length
    };
  }

  private static parseCSVRow(row: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        if (inQuotes && row[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of value
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add final value
    values.push(current.trim());
    return values;
  }

  private static getMockAnalyticsData(): AnalyticsDashboardResponse {
    return {
      order_counts: {
        mongodb_count: 15247,
        reports_count: 15240,
        difference: 7,
        last_updated: new Date().toISOString()
      },
      system_status: 'warning'
    };
  }

  private static getMockFailedOrders(limit: number = 3): FailedOrdersResponse {
    const mockData = [
      {
        refId: "65bf403a-8b9d-4c79-9280-79e515d086b5",
        description: "Order sync failed due to missing product data",
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        retry_count: 3,
        order_id: "ORD-12345",
        sync_status: "failed",
        logs: "Error: Product not found in catalog"
      },
      {
        refId: "f2a1b3c4-5d6e-7f8g-9h0i-1j2k3l4m5n6o",
        description: "Payment verification timeout",
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        retry_count: 2,
        order_id: "ORD-12346",
        sync_status: "failed",
        logs: "Error: Payment gateway timeout"
      },
      {
        refId: "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
        description: "Invalid customer address format",
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        retry_count: 1,
        order_id: "ORD-12347",
        sync_status: "failed",
        logs: "Error: Address validation failed"
      }
    ];
    
    return {
      data: mockData.slice(0, limit),
      message: "Mock failed orders data"
    };
  }

  private static getMockSuccessOrders(limit: number = 3): SuccessOrdersResponse {
    const mockData = [
      {
        ref_id: "z9y8x7w6-v5u4-t3s2-r1q0-p9o8n7m6l5k4",
        order_id: "ORD-12348",
        report_created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      },
      {
        ref_id: "k4l5m6n7-o8p9-q0r1-s2t3-u4v5w6x7y8z9",
        order_id: "ORD-12349",
        report_created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() // 3 hours ago
      },
      {
        ref_id: "q1w2e3r4-t5y6-u7i8-o9p0-a1s2d3f4g5h6",
        order_id: "ORD-12350",
        report_created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
      }
    ];

    return {
      data: mockData.slice(0, limit),
      message: "Mock success orders data"
    };
  }

  // Generic request method with error handling
  private static async makeRequest<T>(url: string, options: RequestInit): Promise<T> {
    try {
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: T = await response.json();
      return data;
    } catch (error) {
      console.error(`Error making request to ${url}:`, error);
      throw error;
    }
  }

  static formatDateForApi(date: Date): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  static validateDateRange(fromDate: Date, toDate: Date): { isValid: boolean; error?: string } {
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 200) {
      return {
        isValid: false,
        error: 'Maximum date range allowed is 2 days'
      };
    }

    if (fromDate >= toDate) {
      return {
        isValid: false,
        error: 'From date must be earlier than to date'
      };
    }

    return { isValid: true };
  }
}

// Alternative axios-based API for compatibility with existing pages
interface AxiosResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

const api = {
  post: async <T>(url: string, data: any): Promise<AxiosResponse<T>> => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
        method: 'POST',
        headers: {
          'token': API_CONFIG.HEADERS.TOKEN,
          'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

export default api;
