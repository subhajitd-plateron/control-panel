'use client';

import React from 'react';
import { 
  TrendingUp, 
  Clock, 
  Activity, 
  Zap,
  Server,
  Database,
  Cpu,
  HardDrive
} from 'lucide-react';

export default function PerformancePage() {
  const metrics = [
    {
      title: 'Response Time',
      value: '245ms',
      change: '+12%',
      trend: 'up',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Throughput',
      value: '1,234/min',
      change: '-5%',
      trend: 'down',
      icon: Zap,
      color: 'text-green-600'
    },
    {
      title: 'Active Sessions',
      value: '456',
      change: '+23%',
      trend: 'up',
      icon: Activity,
      color: 'text-orange-600'
    },
    {
      title: 'Error Rate',
      value: '0.12%',
      change: '-8%',
      trend: 'down',
      icon: Server,
      color: 'text-red-600'
    }
  ];

  const systemMetrics = [
    { label: 'CPU Usage', value: '68%', color: 'bg-blue-500' },
    { label: 'Memory Usage', value: '45%', color: 'bg-green-500' },
    { label: 'Disk Usage', value: '78%', color: 'bg-orange-500' },
    { label: 'Network I/O', value: '34%', color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Performance Analytics</h1>
        <p className="text-green-100 text-lg">
          Real-time system performance monitoring and metrics
        </p>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <div className="flex items-center">
          <TrendingUp className="w-6 h-6 text-yellow-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-1">Performance Analytics Coming Soon</h3>
            <p className="text-yellow-700">
              This page is under development. Advanced performance metrics and monitoring tools will be available here.
            </p>
          </div>
        </div>
      </div>

      {/* Mock Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-theme-card rounded-xl shadow-sm border border-theme p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${metric.color} bg-opacity-10 rounded-full p-3`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <span className={`text-sm font-medium ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-theme-foreground mb-1">{metric.value}</h3>
              <p className="text-theme-muted text-sm">{metric.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* System Resources */}
      <div className="bg-theme-card rounded-xl shadow-sm border border-theme">
        <div className="p-6 border-b border-theme">
          <div className="flex items-center">
            <div className="bg-purple-100 rounded-full p-3 mr-4">
              <Cpu className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-theme-foreground">System Resources</h3>
              <p className="text-theme-muted text-sm">Current system resource utilization</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-theme-foreground font-medium">{metric.label}</span>
                  <span className="text-theme-muted">{metric.value}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${metric.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: metric.value }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Placeholder Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-theme-card rounded-xl shadow-sm border border-theme p-6">
          <h3 className="text-lg font-semibold text-theme-foreground mb-4">Response Time Trends</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart will be implemented</p>
            </div>
          </div>
        </div>

        <div className="bg-theme-card rounded-xl shadow-sm border border-theme p-6">
          <h3 className="text-lg font-semibold text-theme-foreground mb-4">System Load</h3>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Chart will be implemented</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
