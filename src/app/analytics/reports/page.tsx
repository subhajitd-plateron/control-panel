'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Database,
  FileText,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Loader2,
  ExternalLink,
  Search,
  Activity,
  TrendingUp,
  Clock,
  XCircle,
  BarChart3,
  RotateCcw
} from 'lucide-react';
import { ApiService } from '@/services/api';
import { AnalyticsDashboardResponse, FailedOrder, SuccessOrder } from '@/types/api';
import RecentOrdersPanel from '@/components/RecentOrdersPanel';

export default function AnalyticsReportsPage() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<AnalyticsDashboardResponse | null>(null);
  const [recentFailedOrders, setRecentFailedOrders] = useState<FailedOrder[]>([]);
  const [recentSuccessOrders, setRecentSuccessOrders] = useState<SuccessOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  
  // Sync order states
  const [syncOrderId, setSyncOrderId] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  // Add refs to track ongoing requests and prevent duplicates
  const fetchInProgressRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDashboardData = useCallback(async () => {
    // Prevent duplicate calls
    if (fetchInProgressRef.current) {
      console.log('Fetch already in progress, skipping duplicate call');
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    fetchInProgressRef.current = true;
    setError(null);
    setLoading(true);

    try {
      const [dashboard, failed, success] = await Promise.all([
        ApiService.fetchAnalyticsDashboard(),
        ApiService.fetchFailedOrders(3),
        ApiService.fetchSuccessOrders(3)
      ]);
      
      // Check if request was aborted
      if (abortController.signal.aborted) {
        return;
      }
      
      setDashboardData(dashboard);
      setRecentFailedOrders(failed.data);
      setRecentSuccessOrders(success.data);
      setLastFetch(new Date());
    } catch (err) {
      // Don't set error if request was aborted
      if (abortController.signal.aborted) {
        return;
      }
      setError('Failed to fetch analytics data. Please try again.');
      console.error('Error:', err);
    } finally {
      // Only update loading state if this is the current request
      if (!abortController.signal.aborted) {
        setLoading(false);
      }
      fetchInProgressRef.current = false;
    }
  }, []);



  const refreshAllData = async () => {
    await fetchDashboardData();
    // Removed fetchFailedOrders() to prevent duplicate API calls
  };

  const handleSyncOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncOrderId.trim()) return;

    setSyncLoading(true);
    setSyncResult(null);

    try {
      const result = await ApiService.syncOrder({ order_ref_id: syncOrderId.trim() });
      
      if (result.success) {
        setSyncResult({ 
          success: true, 
          message: result.message || 'Order synced successfully' 
        });
      } else {
        setSyncResult({ 
          success: false, 
          message: result.error || 'Failed to sync order' 
        });
      }
    } catch (err) {
      setSyncResult({ 
        success: false, 
        message: 'An unexpected error occurred while syncing the order' 
      });
    } finally {
      setSyncLoading(false);
      // Clear result after 5 seconds
      setTimeout(() => setSyncResult(null), 5000);
    }
  };

  const handleOrderClick = (refId: string) => {
    router.push(`/analytics/reports/order-event/${refId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSystemStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'critical':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Cleanup function to cancel ongoing requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      fetchInProgressRef.current = false;
    };
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Analytics Reports</h1>
          <p className="text-blue-100 text-lg">System monitoring and order sync analytics</p>
        </div>
        
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-theme-muted text-lg">Loading analytics data...</span>
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Analytics Reports</h1>
          <p className="text-blue-100 text-lg">System monitoring and order sync analytics</p>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center">
          <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-red-800 mb-1">Error Loading Analytics</h4>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={refreshAllData}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Analytics Reports</h1>
            <p className="text-blue-100 text-lg">System monitoring and order sync analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            {lastFetch && (
              <span className="text-blue-100 text-sm">
                Last updated: {lastFetch.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refreshAllData}
              disabled={loading}
              className="p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Refresh data"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* System Status Banner */}
      <div className={`rounded-xl border-2 p-4 flex items-center ${getSystemStatusColor(dashboardData.system_status)}`}>
        {getSystemStatusIcon(dashboardData.system_status)}
        <div className="ml-3">
          <h3 className="font-semibold text-sm uppercase tracking-wide">
            System Status: {dashboardData.system_status}
          </h3>
          <p className="text-sm opacity-90">
            {dashboardData.system_status === 'healthy' 
              ? 'All systems operational' 
              : dashboardData.system_status === 'warning'
              ? 'Some issues detected, monitoring closely'
              : 'Critical issues requiring attention'}
          </p>
        </div>
      </div>

      {/* Order Count Comparison */}
      <div className="bg-theme-card rounded-xl shadow-sm border border-theme">
        <div className="p-6 border-b border-theme">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-foreground">Order Count Comparison</h3>
              <p className="text-theme-muted text-sm">MongoDB vs Reports database synchronization status</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Database className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-theme-muted">MongoDB</span>
              </div>
              <div className="text-2xl font-bold text-theme-foreground">
                {dashboardData.order_counts.mongodb_count.toLocaleString()}
              </div>
              <div className="text-xs text-theme-muted">Total Orders</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="w-5 h-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-theme-muted">Reports DB</span>
              </div>
              <div className="text-2xl font-bold text-theme-foreground">
                {dashboardData.order_counts.reports_count.toLocaleString()}
              </div>
              <div className="text-xs text-theme-muted">Synced Orders</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-theme-muted">Difference</span>
              </div>
              <div className={`text-2xl font-bold ${dashboardData.order_counts.difference > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                {dashboardData.order_counts.difference > 0 ? '+' : ''}{dashboardData.order_counts.difference.toLocaleString()}
              </div>
              <div className="text-xs text-theme-muted">
                {dashboardData.order_counts.difference > 0 ? 'Missing Orders' : 'Fully Synced'}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-theme text-center">
            <span className="text-sm text-theme-muted">
              Last updated: {formatDate(dashboardData.order_counts.last_updated)}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders Panel */}
      <RecentOrdersPanel 
        failedOrders={recentFailedOrders}
        successOrders={recentSuccessOrders}
        onRefresh={fetchDashboardData}
        lastUpdated={lastFetch}
        onOrderClick={handleOrderClick}
      />

      {/* Sync Order Section */}
      <div className="bg-theme-card rounded-xl shadow-sm border border-theme">
        <div className="p-6 border-b border-theme">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <RotateCcw className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-foreground">Manual Order Sync</h3>
              <p className="text-theme-muted text-sm">Manually trigger synchronization for a specific order</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSyncOrder} className="space-y-4">
            <div>
              <label htmlFor="syncOrderId" className="block text-sm font-medium text-theme-foreground mb-2">
                Order Reference ID
              </label>
              <div className="relative">
                <input
                  id="syncOrderId"
                  type="text"
                  value={syncOrderId}
                  onChange={(e) => setSyncOrderId(e.target.value)}
                  placeholder="Enter order reference ID to sync..."
                  className="w-full px-4 py-3 pl-12 border border-theme rounded-lg bg-theme-background text-theme-foreground placeholder-theme-muted focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  disabled={syncLoading}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-muted" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-theme-muted">
                This will attempt to re-sync the specified order with the reports database.
              </div>
              <button
                type="submit"
                disabled={!syncOrderId.trim() || syncLoading}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {syncLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Sync Order
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sync Result */}
          {syncResult && (
            <div className={`mt-4 p-4 rounded-lg border ${syncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center">
                {syncResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                )}
                <div>
                  <h4 className={`font-medium ${syncResult.success ? 'text-green-800' : 'text-red-800'} mb-1`}>
                    {syncResult.success ? 'Sync Successful' : 'Sync Failed'}
                  </h4>
                  <p className={`text-sm ${syncResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {syncResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
