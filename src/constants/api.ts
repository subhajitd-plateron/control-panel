export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://dev01.as1.dev.bakeit360.com/',
  ENDPOINTS: {
    MISSING_ORDERS: '/internal/orders/missing-orders',
    SYNC_STATUS: '/internal/orders/sync-status',
    ANALYTICS_DASHBOARD: '/internal/analytics/dashboard',
    SYNC_ORDER: '/sync',
    SYNC_DATETIME: '/sync/internal/restaurant-date-time-settings',
    FAILED_ORDERS: '/internal/orders/failed-orders',
    SUCCESS_ORDERS: '/internal/orders/success-orders',
    SALES_MISMATCH: '/internal/orders/sales-mismatch',
    // Auth endpoints
    AUTH_SEND_OTP: 'auth/admin-panel/login/send-otp',
    AUTH_VERIFY_OTP: 'auth/admin-panel/login/verify-otp',
  },
  HEADERS: {
    TOKEN: '7228562fbaff22325234871072ca2b3301a5e8cc6871a89db6919f5ac46d3c88',
    CONTENT_TYPE: 'application/json',
  },
} as const;
