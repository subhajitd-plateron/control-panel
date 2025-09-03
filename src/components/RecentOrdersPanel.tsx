'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Calendar, 
  Hash,
  Clock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { ApiService } from '@/services/api';
import { FailedOrder, SuccessOrder } from '@/types/api';

interface RecentOrdersPanelProps {
  className?: string;
  failedOrders?: FailedOrder[];
  successOrders?: SuccessOrder[];
  onRefresh?: () => Promise<void>;
  lastUpdated?: Date | null;
  onOrderClick?: (refId: string) => void;
}

const RecentOrdersPanel = (props: RecentOrdersPanelProps) => {
  const { className = '', failedOrders = [], successOrders = [], onRefresh, lastUpdated, onOrderClick } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await onRefresh?.();
    } catch (err) {
      setError('Failed to refresh orders');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return formatDate(dateString);
  };

  if (isLoading && failedOrders.length === 0 && successOrders.length === 0) {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
        <div className="p-6">
          <div className="flex items-center justify-center h-40">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-gray-500">Last 3 failed and successful orders</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Updated {lastUpdated ? formatTimestamp(lastUpdated.toISOString()) : 'Never'}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-6">
          <div className="flex items-center space-x-3 text-red-600 bg-red-50 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Content Grid */}
      {!error && (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Failed Orders Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <h4 className="font-semibold text-gray-900">Recent Failed Orders</h4>
                <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full">
                  {failedOrders.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {failedOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No recent failed orders</p>
                  </div>
                ) : (
                  failedOrders.map((order) => (
                    <div 
                      key={order.refId} 
                      className="bg-red-50 border border-red-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer hover:bg-red-100"
                      onClick={() => onOrderClick?.(order.refId)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="font-mono text-sm text-gray-900 truncate">
                              {order.refId}
                            </span>
                          </div>
                          <p className="text-xs text-red-600 mb-2 line-clamp-2">
                            {order.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(order.created_at)}</span>
                            </span>
                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full font-medium">
                              Retry #{order.retry_count}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Success Orders Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold text-gray-900">Recent Successful Orders</h4>
                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                  {successOrders.length}
                </span>
              </div>
              
              <div className="space-y-3">
                {successOrders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <XCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No recent successful orders</p>
                  </div>
                ) : (
                  successOrders.map((order) => (
                    <div 
                      key={order.ref_id} 
                      className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer hover:bg-green-100"
                      onClick={() => onOrderClick?.(order.ref_id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="font-mono text-sm text-gray-900 truncate">
                              {order.ref_id}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(order.report_created_at)}</span>
                            </span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                              Completed
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentOrdersPanel;
