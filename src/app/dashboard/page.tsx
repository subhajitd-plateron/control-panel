'use client';

import {
  Users,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Activity,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RecentOrdersPanel from '@/components/RecentOrdersPanel';
import { ApiService } from '@/services/api';
import { FailedOrder, SuccessOrder } from '@/types/api';

const statsCards = [
  {
    title: 'Total Users',
    value: '12,847',
    change: '+12%',
    changeType: 'increase' as const,
    icon: Users,
    color: 'blue',
  },
  {
    title: 'Revenue',
    value: '$89,247',
    change: '+8.2%',
    changeType: 'increase' as const,
    icon: DollarSign,
    color: 'green',
  },
  {
    title: 'Orders',
    value: '3,642',
    change: '-2.1%',
    changeType: 'decrease' as const,
    icon: ShoppingCart,
    color: 'orange',
  },
  {
    title: 'Conversion Rate',
    value: '2.8%',
    change: '+0.4%',
    changeType: 'increase' as const,
    icon: TrendingUp,
    color: 'purple',
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'user',
    title: 'New user registered',
    description: 'John Smith created an account',
    time: '2 minutes ago',
    status: 'success',
  },
  {
    id: 2,
    type: 'order',
    title: 'Order completed',
    description: 'Order #12847 has been fulfilled',
    time: '15 minutes ago',
    status: 'success',
  },
  {
    id: 3,
    type: 'alert',
    title: 'System alert',
    description: 'High CPU usage detected on server 2',
    time: '1 hour ago',
    status: 'warning',
  },
  {
    id: 4,
    type: 'backup',
    title: 'Backup completed',
    description: 'Daily backup completed successfully',
    time: '3 hours ago',
    status: 'success',
  },
];

const quickActions = [
  { name: 'Add New User', href: '/users/add', color: 'blue' },
  { name: 'View Reports', href: '/analytics/reports', color: 'green' },
  { name: 'System Settings', href: '/system/settings', color: 'purple' },
  { name: 'Database Backup', href: '/system/database', color: 'orange' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [recentFailedOrders, setRecentFailedOrders] = useState<FailedOrder[]>([]);
  const [recentSuccessOrders, setRecentSuccessOrders] = useState<SuccessOrder[]>([]);
  const [ordersLastUpdated, setOrdersLastUpdated] = useState<Date | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Fetch recent orders data on component mount
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        setOrdersLoading(true);
        const [failed, success] = await Promise.all([
          ApiService.fetchFailedOrders(3),
          ApiService.fetchSuccessOrders(3)
        ]);

        setRecentFailedOrders(failed.data || []);
        setRecentSuccessOrders(success.data || []);
        setOrdersLastUpdated(new Date());
      } catch (error) {
        console.error('Failed to fetch recent orders:', error);
        // Keep empty arrays on error
        setRecentFailedOrders([]);
        setRecentSuccessOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchRecentOrders();
  }, []);

  const handleOrdersRefresh = async () => {
    const [failed, success] = await Promise.all([
      ApiService.fetchFailedOrders(3),
      ApiService.fetchSuccessOrders(3)
    ]);

    setRecentFailedOrders(failed.data || []);
    setRecentSuccessOrders(success.data || []);
    setOrdersLastUpdated(new Date());
  };

  const handleOrderClick = (refId: string) => {
    router.push(`/analytics/reports/order-event/${refId}`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
            <p className="text-blue-100 text-lg">
              Here's what's happening with your business today.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 rounded-full p-4">
              <Activity className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.title} className="bg-theme-card rounded-xl shadow-sm p-6 border border-theme hover:shadow-lg hover:border-blue-500/50 hover:ring-1 hover:ring-blue-500/30 dark:hover:border-blue-400/60 dark:hover:ring-blue-400/40 transition-all duration-300 cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-theme-muted mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-theme-foreground">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-theme-muted ml-1">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <div className="bg-theme-card rounded-xl shadow-sm border border-theme hover:shadow-lg hover:border-blue-500/50 hover:ring-1 hover:ring-blue-500/30 dark:hover:border-blue-400/60 dark:hover:ring-blue-400/40 transition-all duration-300 cursor-pointer">
            <div className="p-6 border-b border-theme">
              <h3 className="text-lg font-semibold text-theme-foreground">Recent Activities</h3>
              <p className="text-sm text-theme-muted mt-1">Latest system activities and updates</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {activity.status === 'success' ? (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-theme-foreground">{activity.title}</p>
                      <p className="text-sm text-theme-muted">{activity.description}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-xs text-theme-muted">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & System Status */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-theme-card rounded-xl shadow-sm border border-theme hover:shadow-lg hover:border-blue-500/50 hover:ring-1 hover:ring-blue-500/30 dark:hover:border-blue-400/60 dark:hover:ring-blue-400/40 transition-all duration-300 cursor-pointer">
            <div className="p-6 border-b border-theme">
              <h3 className="text-lg font-semibold text-theme-foreground">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <a
                    key={action.name}
                    href={action.href}
                    className="block w-full text-left p-3 rounded-lg border border-theme hover:border-primary hover:bg-accent transition-all duration-200"
                  >
                    <span className="text-sm font-medium text-theme-foreground">{action.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-theme-card rounded-xl shadow-sm border border-theme hover:shadow-lg hover:border-blue-500/50 hover:ring-1 hover:ring-blue-500/30 dark:hover:border-blue-400/60 dark:hover:ring-blue-400/40 transition-all duration-300 cursor-pointer">
            <div className="p-6 border-b border-theme">
              <h3 className="text-lg font-semibold text-theme-foreground">System Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-muted">Server Status</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-muted">Database</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-muted">API Status</span>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    <span className="text-sm font-medium text-yellow-600">Slow</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-theme-muted">Last Backup</span>
                  <span className="text-sm text-theme-foreground">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Panel */}
      <RecentOrdersPanel
        failedOrders={recentFailedOrders}
        successOrders={recentSuccessOrders}
        onRefresh={handleOrdersRefresh}
        lastUpdated={ordersLastUpdated}
        onOrderClick={handleOrderClick}
      />

      {/* Performance Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-theme-card rounded-xl shadow-sm border border-theme hover:shadow-lg hover:border-blue-500/50 hover:ring-1 hover:ring-blue-500/30 dark:hover:border-blue-400/60 dark:hover:ring-blue-400/40 transition-all duration-300 cursor-pointer">
          <div className="p-6 border-b border-theme">
            <h3 className="text-lg font-semibold text-theme-foreground">Revenue Analytics</h3>
            <p className="text-sm text-theme-muted mt-1">Monthly revenue trends</p>
          </div>
          <div className="p-6">
            <div className="h-64 bg-secondary rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-theme-muted mx-auto mb-3" />
                <p className="text-theme-muted">Chart will be displayed here</p>
                <p className="text-sm text-theme-muted mt-1">Integration with charting library needed</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-theme-card rounded-xl shadow-sm border border-theme hover:shadow-lg hover:border-blue-500/50 hover:ring-1 hover:ring-blue-500/30 dark:hover:border-blue-400/60 dark:hover:ring-blue-400/40 transition-all duration-300 cursor-pointer">
          <div className="p-6 border-b border-theme">
            <h3 className="text-lg font-semibold text-theme-foreground">User Growth</h3>
            <p className="text-sm text-theme-muted mt-1">User registration trends</p>
          </div>
          <div className="p-6">
            <div className="h-64 bg-secondary rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Users className="w-12 h-12 text-theme-muted mx-auto mb-3" />
                <p className="text-theme-muted">Chart will be displayed here</p>
                <p className="text-sm text-theme-muted mt-1">Integration with charting library needed</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
