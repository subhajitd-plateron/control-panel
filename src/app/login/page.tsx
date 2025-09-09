'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail } from 'lucide-react';
import { API_CONFIG } from '@/constants/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH_SEND_OTP}`, {
        method: 'POST',
        headers: {
          'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
        },
        body: JSON.stringify({
          email: email
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error response
        showToast(data.error || 'Failed to send OTP. Please try again.', 'error');
        return;
      }

      // Success response
      showToast(`OTP sent successfully! Expires in ${data.expires_in} seconds.`, 'success');
      setTimeout(() => {
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      }, 1500);

    } catch (error) {
      console.error('Error sending OTP:', error);
      showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
          toast.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-black relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            <div className="mb-12">
              <img 
                src="https://7leaves.uat.novatab.com/static/media/NovaLogo.b289864bc6b565e0505a27b18000c66f.svg" 
                alt="Nova Logo" 
                className="h-20 mx-auto"
              />
            </div>
            <h1 className="text-5xl font-bold mb-4 text-white text-center">Admin Panel</h1>
            <p className="text-xl text-white text-center">
              Management & Control System
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="https://7leaves.uat.novatab.com/static/media/NovaLogo.b289864bc6b565e0505a27b18000c66f.svg" 
                alt="Nova Logo" 
                className="w-12 h-12"
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 text-center">Admin Panel</h1>
            <p className="text-gray-600 mt-2 text-center">Management & Control System</p>
          </div>

          {/* Login Form */}
          <div className="bg-theme-card rounded-2xl shadow-xl p-8">
            <div className="hidden lg:block mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600">Please sign in here</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-theme-foreground mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-theme-muted" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="block w-full pl-10 pr-3 py-3 border border-theme rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-theme-card text-theme-foreground disabled:opacity-50"
                    placeholder="admin@company.com"
                  />
                </div>
              </div>



              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  'Continue'
                )}
              </button>
            </form>

          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-theme-muted">
              Need help?{' '}
              <a href="#" className="font-medium text-primary hover:opacity-80 transition-colors">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
