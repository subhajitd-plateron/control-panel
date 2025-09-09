import { API_CONFIG } from '@/constants/api';

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpSuccessResponse {
  message: string; // "OTP sent"
  expires_in: number; // seconds
}

export interface VerifyOtpRequest {
  email: string;
  otp: number;
}

export interface VerifyOtpSuccessResponse {
  token: string; // JWT token
  expires_in: number; // seconds
}

export interface ApiErrorResponse {
  error: string;
  code?: string;
}

class AuthService {
  async sendOtp(payload: SendOtpRequest): Promise<SendOtpSuccessResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_SEND_OTP}`, {
        method: 'POST',
        headers: {
          'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send OTP');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  }

  async verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpSuccessResponse> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_VERIFY_OTP}`, {
        method: 'POST',
        headers: {
          'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify OTP');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  }

  // Token management
  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  }

  isTokenExpired(): boolean {
    if (typeof window !== 'undefined') {
      const expiry = localStorage.getItem('tokenExpiry');
      if (!expiry) return true;
      return Date.now() > parseInt(expiry);
    }
    return true;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiry');
    }
  }
}

export const authService = new AuthService();

export default AuthService;


