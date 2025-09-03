'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Tag,
  Search,
  ExternalLink
} from 'lucide-react';
import SyncStatusPanel from '@/components/SyncStatusPanel';

export default function OrderEventPage() {
  const params = useParams();
  const router = useRouter();
  const refId = params.refid as string;
  const [newOrderId, setNewOrderId] = useState(refId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOrderId.trim() && newOrderId.trim() !== refId) {
      router.push(`/analytics/reports/order-event/${newOrderId.trim()}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Order Sync Status</h1>
            <p className="text-blue-100 text-lg">
              Real-time sync status monitoring and diagnostics
            </p>
          </div>
        </div>
      </div>

      {/* Order Reference Input */}
      <div className="bg-theme-card rounded-xl shadow-sm border border-theme">
        <div className="p-6 border-b border-theme">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <Tag className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-foreground">Order Reference</h3>
              <p className="text-theme-muted text-sm">Enter an order ID to view its sync status</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-theme-foreground mb-2">
                Order Reference ID
              </label>
              <div className="relative">
                <input
                  id="orderId"
                  type="text"
                  value={newOrderId}
                  onChange={(e) => setNewOrderId(e.target.value)}
                  placeholder="Enter order reference ID (e.g., f7bed926-86e7-400d-8d46-bd86fb956017)"
                  className="w-full px-4 py-3 pl-12 border border-theme rounded-lg bg-theme-background text-theme-foreground placeholder-theme-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-theme-muted" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-theme-muted">
                Current Order: <span className="font-mono text-theme-foreground">{refId}</span>
              </div>
              <button
                type="submit"
                disabled={!newOrderId.trim() || newOrderId.trim() === refId}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Sync Status
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Sync Status Panel */}
      <SyncStatusPanel orderId={refId} />
    </div>
  );
}
