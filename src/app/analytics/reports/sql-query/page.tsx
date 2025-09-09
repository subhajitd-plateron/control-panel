'use client';
import { useState, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { ApiService } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';
import './sql-query.css';

interface QueryResult {
  columns: string[];
  rows: any[][];
  count: number;
  executed_query?: string;
  csv?: string; // For CSV output type
}

interface ExpandedCells {
  [key: string]: boolean;
}

export default function SQLQueryPage() {
  const { theme } = useTheme();
  const [query, setQuery] = useState('SELECT * FROM order_sales WHERE created_at >= \'2024-01-01\' LIMIT 10');
  const [results, setResults] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<'JSON' | 'CSV'>('JSON');
  const [maxRows, setMaxRows] = useState(100);
  const [timeout, setTimeout] = useState(30);
  const [viewMode, setViewMode] = useState<'table' | 'json' | 'csv'>('table');
  const [expandedCells, setExpandedCells] = useState<ExpandedCells>({});
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  const handleDownloadCSV = (blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sql-query-results-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExecute = useCallback(async () => {
    if (!query.trim()) {
      setError('Please enter a valid SQL query.');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);
    setExecutionTime(null);
    
    const startTime = Date.now();
    
    try {
      const response = await ApiService.executeQuery({
        query: query.trim(),
        max_rows: maxRows,
        timeout: timeout,
        output_type: outputType
      });
      
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      
      if (response.error) {
        setError(response.error);
        setResults(null);
      } else if (response.data) {
        // Handle CSV download
        if (outputType === 'CSV' && response.data.csv) {
          handleDownloadCSV(new Blob([response.data.csv], { type: 'text/csv' }));
        }
        
        setResults(response.data);
        setError(null);
        // Reset expanded cells when new results load
        setExpandedCells({});
      } else {
        setError('Unexpected response format from server.');
        setResults(null);
      }
    } catch (err) {
      const endTime = Date.now();
      setExecutionTime(endTime - startTime);
      
      if (err instanceof Error) {
        setError(`Connection Error: ${err.message}`);
      } else {
        setError('Failed to execute query. Please check your connection and try again.');
      }
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [query, maxRows, timeout, outputType]);

  const toggleCellExpansion = (rowIndex: number, colIndex: number) => {
    const cellKey = `${rowIndex}-${colIndex}`;
    setExpandedCells(prev => ({
      ...prev,
      [cellKey]: !prev[cellKey]
    }));
  };

  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  const renderTableView = () => {
    if (!results) return null;

    return (
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {results.columns.map((column, index) => (
                <th key={index} title={column}>
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => {
                  const cellKey = `${rowIndex}-${colIndex}`;
                  const isExpanded = expandedCells[cellKey];
                  const formattedValue = formatCellValue(cell);
                  const isTruncated = formattedValue.length > 50;
                  
                  return (
                    <td key={colIndex} title={formattedValue}>
                      <div className={`cell-content ${isExpanded ? 'expanded' : ''}`}>
                        {isExpanded ? formattedValue : (
                          isTruncated ? `${formattedValue.substring(0, 50)}...` : formattedValue
                        )}
                        {isTruncated && (
                          <button
                            className="expand-btn"
                            onClick={() => toggleCellExpansion(rowIndex, colIndex)}
                          >
                            {isExpanded ? '▲' : '▼'}
                          </button>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderJsonView = () => {
    if (!results) return null;

    return (
      <pre className="result-json">
        {JSON.stringify(results, null, 2)}
      </pre>
    );
  };

  const renderCSVView = () => {
    if (!results?.csv) return null;

    return (
      <pre className="result-json">
        {results.csv}
      </pre>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    const showCSVOption = results.csv && outputType === 'CSV';

    return (
      <div className="results-container fade-in">
        <div className="results-header">
          <div>
            <h2 className="results-title">
              Query Results ({results.count} rows)
            </h2>
            <div className="results-meta">
              <span>Columns: {results.columns.length}</span>
              <span>Rows: {results.rows.length}</span>
              {executionTime && <span>Execution Time: {executionTime}ms</span>}
              {outputType === 'CSV' && <span>Output Format: CSV</span>}
            </div>
          </div>
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table View
            </button>
            <button
              className={`toggle-btn ${viewMode === 'json' ? 'active' : ''}`}
              onClick={() => setViewMode('json')}
            >
              JSON View
            </button>
            {showCSVOption && (
              <button
                className={`toggle-btn ${viewMode === 'csv' ? 'active' : ''}`}
                onClick={() => setViewMode('csv')}
              >
                Raw CSV
              </button>
            )}
          </div>
        </div>
        
        <div className="results-content">
          {viewMode === 'table' && renderTableView()}
          {viewMode === 'json' && renderJsonView()}
          {viewMode === 'csv' && showCSVOption && renderCSVView()}
        </div>
      </div>
    );
  };

  const renderError = () => {
    if (!error) return null;

    const isQueryError = error.includes('SQLSTATE') || error.includes('ERROR:');
    
    return (
      <div className="error-container fade-in">
        <div className="error-header">
          <span className="error-icon">⚠</span>
          <h3 className="error-title">
            {isQueryError ? 'SQL Execution Error' : 'Connection Error'}
          </h3>
        </div>
        <div className="error-message">
          {error}
        </div>
        {executionTime && (
          <div className="error-message" style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
            Failed after {executionTime}ms
          </div>
        )}
      </div>
    );
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleExecute();
    }
  };

  return (
    <div className="sql-query-container" onKeyDown={handleKeyPress}>
      <div className="page-header">
        <div>
          <h1 className="page-title">SQL Query Editor</h1>
          <p className="page-subtitle">
            Execute SQL queries against the analytics database with real-time results
          </p>
        </div>
        <div className="query-controls">
          <div className="control-group">
            <label>Output Format</label>
            <select 
              value={outputType} 
              onChange={(e) => setOutputType(e.target.value as 'JSON' | 'CSV')}
            >
              <option value="JSON">JSON</option>
              <option value="CSV">CSV</option>
            </select>
          </div>
          <div className="control-group">
            <label>Max Rows</label>
            <input
              type="number"
              value={maxRows}
              onChange={(e) => setMaxRows(parseInt(e.target.value) || 100)}
              min="1"
              max="10000"
            />
          </div>
          <div className="control-group">
            <label>Timeout (sec)</label>
            <input
              type="number"
              value={timeout}
              onChange={(e) => setTimeout(parseInt(e.target.value) || 30)}
              min="5"
              max="300"
            />
          </div>
        </div>
      </div>

      <div className="editor-section">
        <div className="section-header">
          <h3 className="section-title">SQL Query</h3>
          <div className="query-info">
            <span className="info-item">Press Ctrl+Enter to execute</span>
          </div>
        </div>
        <div className="editor-container">
          <Editor
            height="400px"
            defaultLanguage="sql"
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            value={query}
            onChange={(value) => setQuery(value || '')}
            options={{
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontSize: 14,
              lineHeight: 22,
              padding: { top: 16, bottom: 16 },
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
      </div>

      <div className="execution-section">
        <div className="query-info">
          <div className="info-item">
            <span>Query Length: {query.length} characters</span>
          </div>
          <div className="info-item">
            <span>Max Rows: {maxRows}</span>
          </div>
          <div className="info-item">
            <span>Timeout: {timeout}s</span>
          </div>
        </div>
        <div className="execution-controls">
          <button 
            className="btn-primary"
            onClick={handleExecute}
            disabled={loading || !query.trim()}
          >
            {loading && <div className="loading-spinner" />}
            {loading ? 'Executing...' : 'Run Query'}
          </button>
          {loading && (
            <button 
              className="btn-secondary"
              onClick={() => {
                setLoading(false);
                setError('Query execution was cancelled by user');
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {renderError()}
      {renderResults()}

      {!results && !error && !loading && (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <p>Enter a SQL query above and click &quot;Run Query&quot; to see results here.</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Example: SELECT * FROM order_sales WHERE created_at &gt;= &apos;2024-01-01&apos; LIMIT 10
          </p>
        </div>
      )}
    </div>
  );
}
