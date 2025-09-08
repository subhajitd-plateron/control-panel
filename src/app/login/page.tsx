'use client';

import { useState, useRef, useEffect } from 'react';
import { Mail, Building2, ArrowLeft, Shield, RotateCcw } from 'lucide-react';

type LoginStep = 'email' | 'otp';

export default function LoginPage() {
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setStep('otp');
      setResendCountdown(30);
      setIsLoading(false);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 4) {
      setError('Please enter the 4-digit OTP');
      return;
    }
    
    if (otpValue !== '3333') {
      setError('Invalid OTP. Please try again.');
      setOtp(['', '', '', '']);
      otpInputRefs.current[0]?.focus();
      return;
    }
    
    setIsLoading(true);
    
    // Simulate verification
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1000);
  };

  const handleResendOtp = () => {
    if (resendCountdown > 0) return;
    
    setOtp(['', '', '', '']);
    setError('');
    setResendCountdown(30);
    otpInputRefs.current[0]?.focus();
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp(['', '', '', '']);
    setError('');
    setResendCountdown(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-theme-foreground">
            <a 
              href="/dashboard" 
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Admin Control Panel
            </a>
          </h1>
          <p className="text-theme-muted mt-2">
            {step === 'email' ? 'Enter your email to receive OTP' : 'Enter the OTP sent to your email'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-theme-card rounded-2xl shadow-xl p-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-16 -mt-16"></div>
          
          {step === 'email' ? (
            /* Email Step */
            <form onSubmit={handleEmailSubmit} className="space-y-6 relative z-10">
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
                    className="block w-full pl-10 pr-3 py-3 border border-theme rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-theme-card text-theme-foreground"
                    placeholder="admin@company.com"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          ) : (
            /* OTP Step */
            <div className="space-y-6 relative z-10">
              {/* Back button */}
              <button
                onClick={handleBackToEmail}
                className="flex items-center text-sm text-theme-muted hover:text-theme-foreground transition-colors"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to email
              </button>

              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-green-100 p-3 rounded-full">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-theme-foreground mb-2">
                  Verify Your Email
                </h3>
                <p className="text-sm text-theme-muted">
                  We&apos;ve sent a 4-digit code to<br />
                  <span className="font-medium text-theme-foreground">{email}</span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-6">
                {/* OTP Input */}
                <div>
                  <label className="block text-sm font-medium text-theme-foreground mb-4 text-center">
                    Enter OTP
                  </label>
                  <div className="flex justify-center space-x-3">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (otpInputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-12 text-center text-lg font-semibold border-2 border-theme rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-theme-card text-theme-foreground"
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 text-center">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otp.some(digit => !digit)}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </>
                  ) : (
                    'Verify & Sign In'
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCountdown > 0 || isLoading}
                    className="text-sm text-blue-600 hover:text-blue-700 disabled:text-theme-muted transition-colors flex items-center justify-center mx-auto"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend OTP'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Demo Info */}
          {step === 'otp' && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg relative z-10">
              <p className="text-sm text-yellow-800 font-medium mb-1">Demo OTP:</p>
              <p className="text-xs text-yellow-700">Use <span className="font-mono font-bold">3333</span> to login</p>
            </div>
          )}
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
  );
}
