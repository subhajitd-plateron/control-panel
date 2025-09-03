'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ExternalLink,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { ApiService } from '@/services/api';
import { MissingOrder, DateRange } from '@/types/api';

export default function MissingOrdersPage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange>({
    fromDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    toDate: new Date()
  });
  const [missingOrders, setMissingOrders] = useState<MissingOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const handleDateChange = (field: 'fromDate' | 'toDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: new Date(value)
    }));
  };

  const fetchMissingOrders = async () => {
    setError(null);
    setLoading(true);

    try {
      // Validate date range
      const validation = ApiService.validateDateRange(dateRange.fromDate, dateRange.toDate);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid date range');
        setLoading(false);
        return;
      }

      const response = await ApiService.fetchMissingOrders({
        from_date: ApiService.formatDateForApi(dateRange.fromDate),
        to_date: ApiService.formatDateForApi(dateRange.toDate)
      });

      setMissingOrders(response.data || []);
      setLastFetch(new Date());
    } catch (err) {
      setError('Failed to fetch missing orders. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefIdClick = (refId: string) => {
    router.push(`/analytics/reports/order-event/${refId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Missing Orders Analysis</h1>
            <p className="text-orange-100 text-lg">
              Identify orders missing between source and reports
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 rounded-full p-4">
              <AlertCircle className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-theme-card rounded-xl shadow-sm border border-theme p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-theme-foreground flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Date Range Selection
          </h3>
          <span className="text-sm text-theme-muted">Maximum 2 days range allowed</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-theme-foreground mb-2">
              From Date
            </label>
            <input
              type="datetime-local"
              value={dateRange.fromDate.toISOString().slice(0, 16)}
              onChange={(e) => handleDateChange('fromDate', e.target.value)}
              className="w-full px-3 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-theme-background text-theme-foreground"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-theme-foreground mb-2">
              To Date
            </label>
            <input
              type="datetime-local"
              value={dateRange.toDate.toISOString().slice(0, 16)}
              onChange={(e) => handleDateChange('toDate', e.target.value)}
              className="w-full px-3 py-2 border border-theme rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-theme-background text-theme-foreground"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchMissingOrders}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center transition-colors"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Searching...' : 'Search Orders'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
      </div>

      {/* Results Section */}
      {lastFetch && (
        <div className="bg-theme-card rounded-xl shadow-sm border border-theme">
          <div className="p-6 border-b border-theme">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-theme-foreground">
                  Missing Orders Results
                </h3>
                <p className="text-sm text-theme-muted mt-1">
                  Last updated: {lastFetch.toLocaleString()}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-theme-foreground">
                  {missingOrders.length} missing orders found
                </span>
                <button
                  onClick={fetchMissingOrders}
                  disabled={loading}
                  className="p-2 text-theme-muted hover:text-theme-foreground transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {missingOrders.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-theme-foreground mb-2">
                  No Missing Orders Found
                </h4>
                <p className="text-theme-muted">
                  All orders are properly synchronized between source and reports.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-theme">
                      <th className="text-left py-3 px-4 font-semibold text-theme-foreground">
                        Reference ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-theme-foreground">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-theme-foreground">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-theme-foreground">
                        Completion Date
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-theme-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {missingOrders.map((order) => (
                      <tr key={order.refId} className="border-b border-theme hover:bg-accent/50 transition-colors">
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleRefIdClick(order.refId)}
                            className="text-blue-600 hover:text-blue-800 font-mono text-sm underline-offset-4 hover:underline flex items-center"
                          >
                            {order.refId}
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-sm text-theme-foreground">
                            {order.orderId}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center text-sm text-theme-foreground">
                            <Clock className="w-4 h-4 mr-1 text-theme-muted" />
                            {formatDate(order.completionDate)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleRefIdClick(order.refId)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            View Events
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
