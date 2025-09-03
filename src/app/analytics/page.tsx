'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  FileText,
  AlertTriangle,
  Search,
  ArrowRight
} from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();

  const analyticsCards = [
    {
      title: 'Performance Analytics',
      description: 'System performance metrics and monitoring',
      icon: TrendingUp,
      href: '/analytics/performance',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      available: false // Since this page doesn't exist yet
    },
    {
      title: 'Reports Dashboard',
      description: 'Order synchronization and analytics reports',
      icon: PieChart,
      href: '/analytics/reports',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      available: true
    }
  ];

  const reportPages = [
    {
      title: 'Main Reports Dashboard',
      description: 'Order counts, failed orders, and manual sync',
      href: '/analytics/reports',
      icon: BarChart3
    },
    {
      title: 'Missing Orders Analysis',
      description: 'Identify orders missing between source and reports',
      href: '/analytics/reports/missing-orders',
      icon: Search
    },
    {
      title: 'Sales Mismatch Report',
      description: 'Find discrepancies in order calculations',
      href: '/analytics/reports/sales-mismatch',
      icon: AlertTriangle
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Analytics Hub</h1>
        <p className="text-purple-100 text-lg">
          Comprehensive analytics and reporting dashboard
        </p>
      </div>

      {/* Main Analytics Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {analyticsCards.map((card, index) => (
          <div 
            key={index}
            className={`${card.bgColor} rounded-xl border-2 border-transparent hover:border-gray-200 transition-all cursor-pointer group ${
              !card.available ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            onClick={() => card.available && router.push(card.href)}
          >
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className={`${card.color} rounded-full p-3 mr-4`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </div>
                {card.available && (
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                )}
              </div>
              {!card.available && (
                <div className="text-sm text-gray-500 italic">
                  Coming Soon
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reports Section */}
      <div className="bg-theme-card rounded-xl shadow-sm border border-theme">
        <div className="p-6 border-b border-theme">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-foreground">Available Reports</h3>
              <p className="text-theme-muted text-sm">Quick access to all reporting tools</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportPages.map((report, index) => (
              <div 
                key={index}
                className="border border-theme rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer group"
                onClick={() => router.push(report.href)}
              >
                <div className="flex items-center mb-3">
                  <report.icon className="w-5 h-5 text-theme-muted mr-3" />
                  <h4 className="font-medium text-theme-foreground group-hover:text-blue-600 transition-colors">
                    {report.title}
                  </h4>
                </div>
                <p className="text-sm text-theme-muted">{report.description}</p>
                <div className="mt-3 flex items-center text-blue-600 text-sm">
                  <span>Open Report</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
