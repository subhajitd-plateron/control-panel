'use client';
import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';
import { SlowQuery } from '@/types/api';
import './slow-queries.css';

interface SortConfig {
  key: keyof SlowQuery;
  direction: 'asc' | 'desc';
}

export default function SlowQueriesPage() {
  const { theme } = useTheme();
  const [queries, setQueries] = useState<SlowQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'avg_exec_time', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedQueries, setExpandedQueries] = useState<Set<number>>(new Set());
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchSlowQueries = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.fetchSlowQueries();
      setQueries(response.data.slowLogs || []);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching slow queries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch slow queries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlowQueries();
  }, [fetchSlowQueries]);

  useEffect(() => {
    if (refreshInterval) {
      const interval = setInterval(fetchSlowQueries, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchSlowQueries]);

  const handleSort = (key: keyof SlowQuery) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedQueries = [...queries].sort((a, b) => {
    const { key, direction } = sortConfig;
    const aValue = a[key];
    const bValue = b[key];

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'desc' ? bValue - aValue : aValue - bValue;
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'desc' ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
    }

    return 0;
  });

  const filteredQueries = sortedQueries.filter(query =>
    query.query.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleQueryExpansion = (index: number) => {
    setExpandedQueries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const formatQuery = (query: string) => {
    // Basic SQL formatting - replace common keywords with line breaks
    return query
      .replace(/(\bSELECT\b)/gi, '\nSELECT')
      .replace(/(\bFROM\b)/gi, '\nFROM')
      .replace(/(\bWHERE\b)/gi, '\nWHERE')
      .replace(/(\bJOIN\b)/gi, '\nJOIN')
      .replace(/(\bINNER JOIN\b)/gi, '\nINNER JOIN')
      .replace(/(\bLEFT JOIN\b)/gi, '\nLEFT JOIN')
      .replace(/(\bRIGHT JOIN\b)/gi, '\nRIGHT JOIN')
      .replace(/(\bORDER BY\b)/gi, '\nORDER BY')
      .replace(/(\bGROUP BY\b)/gi, '\nGROUP BY')
      .replace(/(\bHAVING\b)/gi, '\nHAVING')
      .replace(/(\bLIMIT\b)/gi, '\nLIMIT')
      .replace(/(\bOFFSET\b)/gi, '\nOFFSET')
      .replace(/(\bUNION\b)/gi, '\nUNION')
      .replace(/(\bUPDATE\b)/gi, '\nUPDATE')
      .replace(/(\bSET\b)/gi, '\nSET')
      .trim();
  };

  const getSeverityColor = (avgTime: number) => {
    if (avgTime > 100) return 'var(--error-color)';
    if (avgTime > 50) return 'var(--warning-color)';
    return 'var(--success-color)';
  };

  const getSeverityLabel = (avgTime: number) => {
    if (avgTime > 100) return 'Critical';
    if (avgTime > 50) return 'Warning';
    return 'Normal';
  };

  const getSortIcon = (key: keyof SlowQuery) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'desc' ? '↓' : '↑';
  };

  if (loading && queries.length === 0) {
    return (
      <div className="slow-queries-container">
        <div className="loading-state">
          <div className="loading-spinner-large" />
          <p>Loading slow queries analysis...</p>
        </div>
      </div>
    );
  }

  if (error && queries.length === 0) {
    return (
      <div className="slow-queries-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Failed to Load Slow Queries</h3>
          <p>{error}</p>
          <button className="retry-button" onClick={fetchSlowQueries}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="slow-queries-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">Slow Queries Analysis</h1>
            <p className="page-subtitle">
              Monitor and analyze database queries with high execution times to optimize performance
            </p>
          </div>
          <div className="header-stats">
            <div className="stat-card critical">
              <span className="stat-value">
                {filteredQueries.filter(q => q.avg_exec_time > 100).length}
              </span>
              <span className="stat-label">Critical</span>
            </div>
            <div className="stat-card warning">
              <span className="stat-value">
                {filteredQueries.filter(q => q.avg_exec_time > 50 && q.avg_exec_time <= 100).length}
              </span>
              <span className="stat-label">Warning</span>
            </div>
            <div className="stat-card normal">
              <span className="stat-value">
                {filteredQueries.filter(q => q.avg_exec_time <= 50).length}
              </span>
              <span className="stat-label">Normal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-results">
            {filteredQueries.length} of {queries.length} queries
          </span>
        </div>
        
        <div className="action-controls">
          <select
            value={refreshInterval || ''}
            onChange={(e) => setRefreshInterval(e.target.value ? parseInt(e.target.value) : null)}
            className="refresh-select"
          >
            <option value="">Manual Refresh</option>
            <option value="30">Auto-refresh 30s</option>
            <option value="60">Auto-refresh 1min</option>
            <option value="300">Auto-refresh 5min</option>
          </select>
          
          <button 
            onClick={fetchSlowQueries}
            disabled={loading}
            className="refresh-button"
          >
            {loading ? <div className="loading-spinner" /> : '🔄'}
            Refresh
          </button>
          
          <span className="last-refresh">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Queries Table */}
      <div className="queries-section">
        {filteredQueries.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">📊</div>
            <p>No slow queries found matching your search criteria.</p>
          </div>
        ) : (
          <div className="queries-table-container">
            <table className="queries-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('avg_exec_time')} className="sortable">
                    Avg Time (ms) {getSortIcon('avg_exec_time')}
                  </th>
                  <th onClick={() => handleSort('min_exec_time')} className="sortable">
                    Min Time (ms) {getSortIcon('min_exec_time')}
                  </th>
                  <th onClick={() => handleSort('calls')} className="sortable">
                    Calls {getSortIcon('calls')}
                  </th>
                  <th>Severity</th>
                  <th>Query</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueries.map((query, index) => (
                  <tr key={index} className="query-row">
                    <td>
                      <span className="time-value" style={{ color: getSeverityColor(query.avg_exec_time) }}>
                        {query.avg_exec_time.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className="time-value">
                        {query.min_exec_time.toFixed(2)}
                      </span>
                    </td>
                    <td>
                      <span className="calls-badge">
                        {query.calls.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span 
                        className={`severity-badge ${getSeverityLabel(query.avg_exec_time).toLowerCase()}`}
                        style={{ color: getSeverityColor(query.avg_exec_time) }}
                      >
                        {getSeverityLabel(query.avg_exec_time)}
                      </span>
                    </td>
                    <td className="query-cell">
                      <div className="query-preview">
                        {expandedQueries.has(index) ? (
                          <pre className="query-full">
                            {formatQuery(query.query)}
                          </pre>
                        ) : (
                          <div className="query-truncated">
                            {query.query.length > 100
                              ? `${query.query.substring(0, 100)}...`
                              : query.query}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => toggleQueryExpansion(index)}
                        className="expand-button"
                      >
                        {expandedQueries.has(index) ? 'Collapse' : 'Expand'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {filteredQueries.length > 0 && (
        <div className="summary-section">
          <h3>Performance Summary</h3>
          <div className="summary-cards">
            <div className="summary-card">
              <span className="summary-label">Total Queries</span>
              <span className="summary-value">{filteredQueries.length}</span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Total Calls</span>
              <span className="summary-value">
                {filteredQueries.reduce((sum, q) => sum + q.calls, 0).toLocaleString()}
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Avg Execution Time</span>
              <span className="summary-value">
                {(filteredQueries.reduce((sum, q) => sum + q.avg_exec_time, 0) / filteredQueries.length).toFixed(2)}ms
              </span>
            </div>
            <div className="summary-card">
              <span className="summary-label">Slowest Query</span>
              <span className="summary-value">
                {Math.max(...filteredQueries.map(q => q.avg_exec_time)).toFixed(2)}ms
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
