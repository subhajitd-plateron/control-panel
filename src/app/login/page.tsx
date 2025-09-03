'use client';

import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login - redirect to dashboard
    window.location.href = '/dashboard';
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
          <h1 className="text-3xl font-bold text-theme-foreground">Admin Control Panel</h1>
          <p className="text-theme-muted mt-2">Sign in to manage your business</p>
        </div>

        {/* Login Form */}
        <div className="bg-theme-card rounded-2xl shadow-xl p-8">
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
                  className="block w-full pl-10 pr-3 py-3 border border-theme rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-theme-card text-theme-foreground"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-theme-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-theme-muted" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-theme rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-theme-card text-theme-foreground"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-theme-muted hover:text-theme-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-theme-muted hover:text-theme-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-theme rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-theme-foreground">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:opacity-80 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 transform hover:scale-105"
            >
              Sign In
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-accent rounded-lg">
            <p className="text-sm text-primary font-medium mb-2">Demo Credentials:</p>
            <p className="text-xs text-primary">Email: admin@company.com</p>
            <p className="text-xs text-primary">Password: admin123</p>
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
  );
}
