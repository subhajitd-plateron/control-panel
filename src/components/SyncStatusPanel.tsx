'use client';

import React, { useState, useEffect } from 'react';
import { 
  RotateCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Loader2, 
  RefreshCw,
  Activity,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { ApiService } from '@/services/api';
import { SyncStatusEvent } from '@/types/api';

interface SyncStatusPanelProps {
  orderId: string;
}

export default function SyncStatusPanel({ orderId }: SyncStatusPanelProps) {
  const [syncEvents, setSyncEvents] = useState<SyncStatusEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);

  const fetchSyncStatus = async () => {
    if (!orderId) return;
    
    setError(null);
    setLoading(true);

    try {
      const response = await ApiService.fetchSyncStatus(orderId);
      setSyncEvents(response.data || []);
      setLastFetch(new Date());
    } catch (err) {
      setError('Failed to fetch sync status. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
  }, [orderId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
  };

  const getSyncStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('sync_started')) {
      return 'text-blue-600 bg-blue-100 border-blue-200';
    } else if (statusLower.includes('sync_failed')) {
      return 'text-red-600 bg-red-100 border-red-200';
    } else if (statusLower.includes('sync_completed') || statusLower.includes('success')) {
      return 'text-green-600 bg-green-100 border-green-200';
    } else if (statusLower.includes('sync_in_progress')) {
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    } else if (statusLower.includes('sent_for_retry')) {
      return 'text-orange-600 bg-orange-100 border-orange-200';
    } else if (statusLower.includes('order_details_fetched')) {
      return 'text-indigo-600 bg-indigo-100 border-indigo-200';
    } else {
      return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSyncStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    
    if (statusLower.includes('sync_started')) {
      return <Activity className="w-4 h-4" />;
    } else if (statusLower.includes('sync_failed')) {
      return <XCircle className="w-4 h-4" />;
    } else if (statusLower.includes('sync_completed') || statusLower.includes('success')) {
      return <CheckCircle className="w-4 h-4" />;
    } else if (statusLower.includes('sync_in_progress')) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    } else if (statusLower.includes('sent_for_retry')) {
      return <AlertTriangle className="w-4 h-4" />;
    } else if (statusLower.includes('order_details_fetched')) {
      return <CheckCircle className="w-4 h-4" />;
    } else {
      return <Clock className="w-4 h-4" />;
    }
  };

  const renderDescription = (description: string) => {
    // If description is a JSON string, try to parse and format it
    if (description.startsWith('{')) {
      try {
        const parsed = JSON.parse(description);
        return (
          <div className="mt-2">
            <details className="cursor-pointer">
              <summary className="text-sm text-theme-muted hover:text-theme-foreground">
                View order details
              </summary>
              <pre className="mt-2 p-2 bg-theme-background rounded text-xs text-theme-muted overflow-auto max-h-40">
                {JSON.stringify(parsed, null, 2)}
              </pre>
            </details>
          </div>
        );
      } catch (e) {
        // If parsing fails, show as regular text
      }
    }
    
    return (
      <p className="text-sm text-theme-muted mt-1">
        {description}
      </p>
    );
  };

  const getLatestSyncStatus = () => {
    if (syncEvents.length === 0) return null;
    
    const latest = syncEvents[syncEvents.length - 1];
    const statusLower = latest.event_status.toLowerCase();
    
    if (statusLower.includes('sync_failed')) {
      return { status: 'failed', color: 'text-red-600', icon: <XCircle className="w-5 h-5" /> };
    } else if (statusLower.includes('sync_completed') || statusLower.includes('success')) {
      return { status: 'completed', color: 'text-green-600', icon: <CheckCircle className="w-5 h-5" /> };
    } else if (statusLower.includes('sync_in_progress')) {
      return { status: 'in progress', color: 'text-yellow-600', icon: <Loader2 className="w-5 h-5 animate-spin" /> };
    } else if (statusLower.includes('sent_for_retry')) {
      return { status: 'retrying', color: 'text-orange-600', icon: <AlertTriangle className="w-5 h-5" /> };
    } else {
      return { status: 'processing', color: 'text-blue-600', icon: <Activity className="w-5 h-5" /> };
    }
  };

  const latestStatus = getLatestSyncStatus();

  if (loading) {
    return (
      <div className="bg-theme-card rounded-xl shadow-sm border border-theme">
        <div className="p-6 border-b border-theme">
          <h3 className="text-lg font-semibold text-theme-foreground flex items-center">
            <RotateCw className="w-5 h-5 mr-2" />
            Sync Status
          </h3>
        </div>
        <div className="p-6">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-3 text-theme-muted">Loading sync status...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-card rounded-xl shadow-sm border border-theme">
      <div className="p-6 border-b border-theme">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-theme-foreground flex items-center">
              <RotateCw className="w-5 h-5 mr-2" />
              Sync Status
            </h3>
            {latestStatus && (
              <div className={`ml-4 flex items-center ${latestStatus.color}`}>
                {latestStatus.icon}
                <span className="ml-1 text-sm font-medium capitalize">
                  {latestStatus.status}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {lastFetch && (
              <span className="text-sm text-theme-muted">
                Updated: {lastFetch.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchSyncStatus}
              disabled={loading}
              className="p-2 text-theme-muted hover:text-theme-foreground transition-colors"
              title="Refresh sync status"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-red-800 mb-1">Error Loading Sync Status</h4>
              <p className="text-red-700 text-sm">{error}</p>
              <button
                onClick={fetchSyncStatus}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        ) : syncEvents.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-theme-foreground mb-2">
              No Sync Status Found
            </h4>
            <p className="text-theme-muted">
              No sync events were found for this order.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-theme-muted mb-4">
              {syncEvents.length} sync event{syncEvents.length !== 1 ? 's' : ''} found
            </div>
            
            {syncEvents.map((event, index) => (
              <div key={index} className="relative">
                {/* Timeline connector */}
                {index < syncEvents.length - 1 && (
                  <div className="absolute left-8 top-12 w-px h-6 bg-theme border-dashed"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Event Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full border-2 flex items-center justify-center ${getSyncStatusColor(event.event_status)}`}>
                    {getSyncStatusIcon(event.event_status)}
                  </div>
                  
                  {/* Event Content */}
                  <div className="flex-1 bg-theme-background rounded-lg p-4 border border-theme">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-theme-foreground">
                        {event.event_status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <span className="text-xs text-theme-muted">
                        {formatDate(event.created_at)}
                      </span>
                    </div>
                    
                    {renderDescription(event.event_description)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
