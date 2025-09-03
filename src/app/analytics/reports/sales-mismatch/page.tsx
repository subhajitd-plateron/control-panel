'use client';
import { useState } from 'react';
import { DatePicker, Button, Select, Table, Alert, Spin, Input } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { API_CONFIG } from '@/constants/api';
import type { MismatchReportResponse, MismatchReportRequest } from '@/types/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface MismatchRecord {
  order_ref_id: string;
  order_id: string;
  transaction_total: number;
  calculated_total: number;
  difference: number;
}

export default function SalesMismatchReport() {
  const [businessId, setBusinessId] = useState('');
  const [dates, setDates] = useState<[string, string]>(['', '']);
  const [outputType, setOutputType] = useState<'JSON' | 'CSV'>('JSON');
  const [data, setData] = useState<MismatchRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalMismatch, setTotalMismatch] = useState(0);

  const handleDownloadCSV = (blob: Blob) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-mismatch-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [fromDate, toDate] = dates;
      
      // Format dates to match API specification (YYYY-MM-DD HH:mm:ss)
      const formatDateForAPI = (dateString: string) => {
        if (!dateString) return '';
        // If the date doesn't have seconds, append ":00"
        return dateString.includes(':') && dateString.split(':').length === 2 
          ? `${dateString}:00` 
          : dateString;
      };
      
      // Prepare request payload
      const requestPayload: MismatchReportRequest = {
        business_ref_id: businessId,
        from_date: formatDateForAPI(fromDate),
        to_date: formatDateForAPI(toDate),
        output_type: outputType
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SALES_MISMATCH}`, {
        method: 'POST',
        headers: {
          'token': API_CONFIG.HEADERS.TOKEN,
          'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      if (outputType === 'JSON') {
        const responseData: MismatchReportResponse = await response.json();
        
        // Check for API-level errors
        if (responseData.error) {
          throw new Error(responseData.error);
        }
        
        setData(responseData.data || []);
        setTotalMismatch(responseData.data?.reduce((acc: number, curr: MismatchRecord) => acc + curr.difference, 0) || 0);
      } else {
        // For CSV, response is text
        const csvData = await response.text();
        handleDownloadCSV(new Blob([csvData], { type: 'text/csv' }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales mismatch data');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Order Ref ID',
      dataIndex: 'order_ref_id',
      key: 'order_ref_id',
    },
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
    },
    {
      title: 'Transaction Total',
      dataIndex: 'transaction_total',
      key: 'transaction_total',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    {
      title: 'Calculated Total',
      dataIndex: 'calculated_total',
      key: 'calculated_total',
      render: (value: number) => `$${value.toFixed(2)}`
    },
    {
      title: 'Difference',
      dataIndex: 'difference',
      key: 'difference',
      render: (value: number) => (
        <span style={{ color: value > 0 ? '#cf1322' : '#3f8600' }}>
          ${Math.abs(value).toFixed(2)}
        </span>
      )
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-600 mb-2">Sales Mismatch Report</h1>
        <p className="text-gray-700 dark:text-gray-400">Generate detailed reports to identify discrepancies between transaction totals and calculated amounts</p>
      </div>

      {/* Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Report Parameters
          </h2>
          <p className="text-sm text-gray-600 mt-1">Configure your report settings and criteria</p>
        </div>

        {/* Form Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Business ID Field */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Business Reference ID
                <span className="text-red-500 ml-1">*</span>
              </label>
              <Input
                size="large"
                placeholder="Enter business reference ID"
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                className="w-full"
                prefix={
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
              <p className="text-xs text-gray-500 mt-1">Unique identifier for the business entity</p>
            </div>

            {/* Date Range Field */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Date Range
                <span className="text-red-500 ml-1">*</span>
              </label>
              <RangePicker
                size="large"
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
                onChange={(dates, dateStrings) => setDates(dateStrings as [string, string])}
                className="w-full"
                placeholder={['Start date', 'End date']}
              />
              <p className="text-xs text-gray-500 mt-1">Select the time period for analysis</p>
            </div>

            {/* Output Type Field */}
            <div className="lg:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Output Format
              </label>
              <Select
                size="large"
                value={outputType}
                onChange={(value) => setOutputType(value)}
                className="w-full"
                suffixIcon={
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                }
              >
                <Option value="JSON">
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    JSON (Table View)
                  </div>
                </Option>
                <Option value="CSV">
                  <div className="flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    CSV (Download)
                  </div>
                </Option>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Choose your preferred output format</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4 border-t border-gray-100">
            <Button
              type="primary"
              size="large"
              onClick={handleSubmit}
              icon={outputType === 'CSV' ? <DownloadOutlined /> : undefined}
              loading={loading}
              disabled={!businessId || !dates[0] || !dates[1]}
              className="px-8 py-2 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '8px',
              }}
            >
              {loading ? (
                'Processing...'
              ) : outputType === 'CSV' ? (
                'Download CSV Report'
              ) : (
                'Generate Report'
              )}
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="px-6 pb-6">
            <Alert
              message="Report Generation Failed"
              description={error}
              type="error"
              showIcon
              className="rounded-lg"
              closable
              onClose={() => setError('')}
            />
          </div>
        )}
      </div>

      {outputType === 'JSON' && data.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="mb-4 text-lg font-semibold">
            Total Mismatch: ${totalMismatch.toFixed(2)}
          </div>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="order_ref_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </div>
      )}
    </div>
  );
}
