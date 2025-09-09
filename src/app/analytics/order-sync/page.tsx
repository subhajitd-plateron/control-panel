'use client';

import React, { useState } from 'react';
import { 
  CheckCircle,
  RefreshCw,
  Loader2,
  Search,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { ApiService } from '@/services/api';

export default function OrderSyncPage() {
  // Sync order states
  const [syncOrderId, setSyncOrderId] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  // DateTime sync states
  const [restaurantRefId, setRestaurantRefId] = useState('');
  const [datetimeSyncLoading, setDatetimeSyncLoading] = useState(false);
  const [datetimeSyncResult, setDatetimeSyncResult] = useState<{ success: boolean; message: string } | null>(null);

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

  const handleSyncDateTime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantRefId.trim()) return;

    setDatetimeSyncLoading(true);
    setDatetimeSyncResult(null);

    try {
      const result = await ApiService.syncDateTime({ restaurant_ref_id: restaurantRefId.trim() });

      if (result.success) {
        setDatetimeSyncResult({
          success: true,
          message: result.message || 'Restaurant date time settings synced successfully'
        });
      } else {
        setDatetimeSyncResult({
          success: false,
          message: result.error || 'Failed to sync date time settings'
        });
      }
    } catch (err) {
      setDatetimeSyncResult({
        success: false,
        message: 'An unexpected error occurred while syncing date time settings'
      });
    } finally {
      setDatetimeSyncLoading(false);
      // Clear result after 5 seconds
      setTimeout(() => setDatetimeSyncResult(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Data Sync</h1>
            <p className="text-purple-100 text-lg">Manually trigger synchronization for orders and restaurant settings</p>
          </div>
          <div className="bg-white/20 rounded-full p-3">
            <RotateCcw className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Main Sync Section */}
      <div className="bg-theme-card rounded-xl shadow-sm border border-theme">
        <div className="p-6 border-b border-theme">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <RotateCcw className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-foreground">Order Synchronization</h3>
              <p className="text-theme-muted text-sm">Enter an order reference ID to manually sync it with the reports database</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSyncOrder} className="space-y-6">
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
              <p className="mt-2 text-sm text-theme-muted">
                This will attempt to re-sync the specified order with the reports database. Use this when you notice a specific order is missing from reports.
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-theme-muted">
                <div className="space-y-1">
                  <p>• This action will fetch the order from MongoDB</p>
                  <p>• Process and validate the order data</p>
                  <p>• Insert or update the order in the reports database</p>
                </div>
              </div>
              <button
                type="submit"
                disabled={!syncOrderId.trim() || syncLoading}
                className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
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
            <div className={`mt-6 p-4 rounded-lg border ${syncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
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

      {/* DateTime Sync Section */}
      <div className="bg-theme-card rounded-xl shadow-sm border border-theme">
        <div className="p-6 border-b border-theme">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <RefreshCw className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-foreground">Restaurant DateTime Sync</h3>
              <p className="text-theme-muted text-sm">Enter a restaurant reference ID to sync its date and time settings</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSyncDateTime} className="space-y-6">
            <div>
              <label htmlFor="restaurantRefId" className="block text-sm font-medium text-theme-foreground mb-2">
                Restaurant Reference ID
              </label>
              <div className="relative">
                <input
                  id="restaurantRefId"
                  type="text"
                  value={restaurantRefId}
                  onChange={(e) => setRestaurantRefId(e.target.value)}
                  placeholder="Enter restaurant reference ID (e.g., c4a8ab6c-4d1d-47bc-b660-ef222ebd8f15)"
                  className="w-full px-4 py-3 pl-12 border border-theme rounded-lg bg-theme-background text-theme-foreground placeholder-theme-muted focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  disabled={datetimeSyncLoading}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-muted" />
              </div>
              <p className="mt-2 text-sm text-theme-muted">
                This will sync the restaurant's date and time settings with the latest configuration. Use this when you need to update timezone or other temporal settings.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-theme-muted">
                <div className="space-y-1">
                  <p>• Validates the restaurant reference ID</p>
                  <p>• Fetches current date and time settings</p>
                  <p>• Updates the configuration in the system</p>
                </div>
              </div>
              <button
                type="submit"
                disabled={!restaurantRefId.trim() || datetimeSyncLoading}
                className="inline-flex items-center px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {datetimeSyncLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync DateTime
                  </>
                )}
              </button>
            </div>
          </form>

          {/* DateTime Sync Result */}
          {datetimeSyncResult && (
            <div className={`mt-6 p-4 rounded-lg border ${datetimeSyncResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center">
                {datetimeSyncResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                )}
                <div>
                  <h4 className={`font-medium ${datetimeSyncResult.success ? 'text-green-800' : 'text-red-800'} mb-1`}>
                    {datetimeSyncResult.success ? 'DateTime Sync Successful' : 'DateTime Sync Failed'}
                  </h4>
                  <p className={`text-sm ${datetimeSyncResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {datetimeSyncResult.message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h4 className="font-medium text-blue-800 mb-3 flex items-center">
          <RefreshCw className="w-5 h-5 mr-2" />
          How Data Sync Works
        </h4>
        <div className="text-blue-700 text-sm space-y-2">
          <p>
            <strong>Manual Sync Process:</strong> When you manually sync an order, the system performs the following steps:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Searches for the order in the primary MongoDB database</li>
            <li>Validates and processes the order data according to current business rules</li>
            <li>Updates or inserts the order record in the reports database</li>
            <li>Ensures data consistency across both systems</li>
          </ul>
          <p className="mt-3">
            <strong>When to use:</strong> Use this tool when you notice discrepancies in order counts or when specific orders are missing from reports.
          </p>
        </div>
      </div>
    </div>
  );
}
