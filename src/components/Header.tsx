'use client';

import { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { clsx } from 'clsx';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
}

export default function Header({ onToggleSidebar, isSidebarCollapsed }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const notifications = [
    {
      id: 1,
      title: 'New user registration',
      message: 'John Doe has registered',
      time: '2 minutes ago',
      unread: true,
    },
    {
      id: 2,
      title: 'System backup completed',
      message: 'Daily backup completed successfully',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Security alert',
      message: 'Failed login attempt detected',
      time: '3 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="bg-theme-header border-b border-l border-theme px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Menu Toggle & Search */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isSidebarCollapsed ? (
              <Menu className="w-5 h-5 text-gray-600" />
            ) : (
              <X className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search admin panel features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-96 border border-theme rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 bg-theme-card text-theme-foreground"
            />
          </div>
        </div>

        {/* Right Side - Notifications & Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <Bell className="w-5 h-5 text-theme-header" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-theme-card rounded-lg shadow-lg ring-1 ring-border ring-opacity-20 z-50">
                <div className="p-4 border-b border-theme">
                  <h3 className="text-lg font-semibold text-theme-foreground">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={clsx(
                        'p-4 border-b border-theme hover:bg-secondary cursor-pointer',
                        notification.unread && 'bg-accent'
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className={clsx(
                            'text-sm font-medium',
                            notification.unread ? 'text-theme-foreground' : 'text-theme-muted'
                          )}>
                            {notification.title}
                          </h4>
                          <p className="text-sm text-theme-muted mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-theme-muted mt-2">
                            {notification.time}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4">
                  <button className="text-sm text-primary hover:opacity-80 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">A</span>
              </div>
              <span className="text-sm font-medium text-theme-header">Admin</span>
              <ChevronDown className="w-4 h-4 text-theme-muted" />
            </button>

            {/* Profile Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-theme-card rounded-lg shadow-lg ring-1 ring-border ring-opacity-20 z-50">
                <div className="p-4 border-b border-theme">
                  <p className="text-sm font-medium text-theme-foreground">Admin User</p>
                  <p className="text-sm text-theme-muted">admin@company.com</p>
                </div>
                <div className="py-2">
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-theme-foreground hover:bg-secondary"
                  >
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </a>
                  <a
                    href="#"
                    className="flex items-center px-4 py-2 text-sm text-theme-foreground hover:bg-secondary"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </a>
                  <hr className="my-2" />
                  <a
                    href="/login"
                    className="flex items-center px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}