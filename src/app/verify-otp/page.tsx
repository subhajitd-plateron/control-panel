'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VerifyOTPPage() {
  const [otp, setOTP] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 4) {
      showToast('Please enter all 4 digits', 'error');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (otpValue === '6666') {
        showToast('OTP verified successfully! Redirecting...', 'success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        showToast('Invalid OTP. Please try again.', 'error');
        setOTP(['', '', '', '']);
        // Focus first input
        const firstInput = document.getElementById('otp-0');
        firstInput?.focus();
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOTP = [...otp];
      newOTP[index] = value;
      setOTP(newOTP);
      
      // Auto focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleResendOTP = () => {
    showToast('OTP resent successfully!', 'success');
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
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full h-full">
          <div className="flex flex-col items-center justify-center text-center">
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

      {/* Right Side - OTP Form */}
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

          {/* OTP Form */}
          <div className="bg-theme-card rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Enter Verification Code</h2>
              <p className="text-gray-600 text-center">
                Enter the 4-digit code sent to <br />
                <span className="font-medium">{email}</span>
              </p>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-theme-foreground mb-4 text-center">
                  Verification Code
                </label>
                <div className="flex justify-center space-x-4">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      disabled={isLoading}
                      className="w-14 h-14 text-center text-2xl font-bold border border-theme rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-theme-card text-theme-foreground disabled:opacity-50"
                    />
                  ))}
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
                    Verifying...
                  </div>
                ) : (
                  'Verify & Sign In'
                )}
              </button>

              {/* Back and Resend Options */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-theme rounded-lg text-sm font-medium text-theme-foreground hover:bg-theme-accent transition-all duration-200 disabled:opacity-50"
                >
                  Back to Login
                </button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm text-primary hover:opacity-80 transition-colors disabled:opacity-50"
                  >
                    Didn't receive code? Resend OTP
                  </button>
                </div>
              </div>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-accent rounded-lg">
              <p className="text-sm text-primary font-medium mb-2">Demo OTP:</p>
              <p className="text-xs text-primary">Enter: 6666</p>
            </div>
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
