'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Save, X, CheckCircle, AlertCircle, Smartphone, Award, Clock, Ban, Gift } from 'lucide-react';
import { ApiService } from '@/services/api';

interface LoyaltyFormData {
  mobileNumber: string;
  countryCode: string;
  businessRefId: string;
  pointsToAdd: number;
}

interface TransactionFormData {
  userRefId: string;
  businessRefId: string;
  limit: number;
}

interface LoyaltyTransaction {
  type: 'earn' | 'redeem';
  pointsChanged: number;
  transactionRefId: string;
  eventDate: string;
  restaurantRefId: string;
  restaurantName: string;
  restaurantAddress: string;
}

interface ApiResponse {
  message?: string;
  success: boolean;
  data?: any;
}

type ActiveTab = 'add-points' | 'view-transactions';

export default function LoyaltyPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('add-points');

  // Add Points Form State
  const [formData, setFormData] = useState<LoyaltyFormData>({
    mobileNumber: '',
    countryCode: '+1',
    businessRefId: '',
    pointsToAdd: 0
  });

  // Transaction Form State
  const [transactionFormData, setTransactionFormData] = useState<TransactionFormData>({
    userRefId: '',
    businessRefId: '',
    limit: 10
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Clear response after 5 seconds
  useEffect(() => {
    if (response) {
      const timer = setTimeout(() => setResponse(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [response]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (activeTab === 'add-points') {
      // Mobile number validation
      if (!formData.mobileNumber.trim()) {
        newErrors.mobileNumber = 'Mobile number is required';
      } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
        newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
      }

      // Business ref ID validation
      if (!formData.businessRefId.trim()) {
        newErrors.businessRefId = 'Business reference ID is required';
      } else if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(formData.businessRefId)) {
        newErrors.businessRefId = 'Please enter a valid UUID';
      }

      // Points validation
      if (formData.pointsToAdd <= 0) {
        newErrors.pointsToAdd = 'Points must be greater than 0';
      } else if (formData.pointsToAdd > 10000) {
        newErrors.pointsToAdd = 'Points cannot exceed 10,000';
      }
    } else {
      // Transaction form validation
      if (!transactionFormData.userRefId.trim()) {
        newErrors.userRefId = 'User reference ID is required';
      } else if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(transactionFormData.userRefId)) {
        newErrors.userRefId = 'Please enter a valid UUID';
      }

      if (!transactionFormData.businessRefId.trim()) {
        newErrors.businessRefId = 'Business reference ID is required';
      } else if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(transactionFormData.businessRefId)) {
        newErrors.businessRefId = 'Please enter a valid UUID';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (activeTab === 'add-points') {
      setFormData(prev => ({
        ...prev,
        [field]: typeof value === 'string' && ['pointsToAdd'].includes(field)
          ? parseInt(value) || 0
          : value
      }));
    } else {
      setTransactionFormData(prev => ({
        ...prev,
        [field]: typeof value === 'string' && ['limit'].includes(field)
          ? parseInt(value) || 10
          : value
      }));
    }
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setResponse(null);

    try {
      const result = await ApiService.addLoyaltyPoints(formData);

      if (result.success) {
        setResponse({
          success: true,
          message: result.message || 'Loyalty points added successfully',
          data: result.data
        });

        // Reset form on success
        setFormData({
          mobileNumber: '',
          countryCode: '+1',
          businessRefId: '',
          pointsToAdd: 0
        });
      } else {
        setResponse({
          success: false,
          message: result.message || 'Failed to add loyalty points'
        });
      }
    } catch (error) {
      setResponse({
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTransactions = async () => {
    if (!validateForm()) {
      return;
    }

    setIsFetchingTransactions(true);
    setResponse(null);

    try {
      const result = await ApiService.fetchLoyaltyTransactions(transactionFormData);

      if (result.success && result.data?.data) {
        setTransactions(result.data.data);
        setResponse({
          success: true,
          message: `Found ${result.data.data.length} transactions`
        });
      } else {
        setTransactions([]);
        setResponse({
          success: false,
          message: result.message || 'Failed to fetch transactions'
        });
      }
    } catch (error) {
      setTransactions([]);
      setResponse({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch transactions'
      });
    } finally {
      setIsFetchingTransactions(false);
    }
  };

  const formatMobileNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (cleaned.length >= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 3) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return cleaned;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionTypeColor = (type: string) => {
    if (type === 'earn') return 'text-green-600 bg-green-50';
    if (type === 'redeem') return 'text-blue-600 bg-blue-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getTransactionTypeIcon = (type: string) => {
    if (type === 'earn') return <Award className="w-4 h-4" />;
    if (type === 'redeem') return <Gift className="w-4 h-4" />;
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 text-sm text-gray-500 mb-2">
              <span>Customers</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-900 font-medium">Loyalty</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Loyalty Program Management</h1>
            <p className="text-gray-600 mt-2">
              Add loyalty points to customers or view their transaction history
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('add-points')}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'add-points'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Add Points
          </button>
          <button
            onClick={() => setActiveTab('view-transactions')}
            className={`px-6 py-4 text-sm font-medium border-b-2 ${
              activeTab === 'view-transactions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            View Transactions
          </button>
        </div>

        <div className="p-6">
          {/* Success/Error Messages */}
          {response && (
            <div className={`rounded-lg p-4 mb-6 ${
              response.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center">
                {response.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                )}
                <div>
                  <p className={`font-medium ${
                    response.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {response.message}
                  </p>
                  {response.success && response.data && activeTab === 'add-points' && (
                    <p className="text-sm text-green-700 mt-1">
                      Points Balance: {response.data.pointsBalance || 'Updated'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'add-points' ? (
            <>
              <form onSubmit={handleAddPointsSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mobile Number */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <div className="flex">
                      <div className="flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 rounded-l-md">
                        <Smartphone className="w-4 h-4 text-gray-500 mr-2" />
                        <select
                          value={formData.countryCode}
                          onChange={(e) => handleInputChange('countryCode', e.target.value)}
                          className="bg-transparent border-none outline-none text-sm font-medium"
                        >
                          <option value="+1">+1 (US)</option>
                          <option value="+91">+91 (IN)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+61">+61 (AU)</option>
                        </select>
                      </div>
                      <input
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={formData.mobileNumber}
                        onChange={(e) => {
                          const formatted = formatMobileNumber(e.target.value);
                          handleInputChange('mobileNumber', formatted);
                        }}
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                          errors.mobileNumber ? 'border-red-300 focus:ring-red-500' : ''
                        }`}
                        maxLength={14}
                      />
                    </div>
                    {errors.mobileNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.mobileNumber}</p>
                    )}
                  </div>

                  {/* Business Reference ID */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Reference ID *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., b938790e-4a03-4600-bad9-8458984dcb8f"
                      value={formData.businessRefId}
                      onChange={(e) => handleInputChange('businessRefId', e.target.value)}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                        errors.businessRefId ? 'border-red-300 focus:ring-red-500' : ''
                      }`}
                    />
                    {errors.businessRefId && (
                      <p className="mt-1 text-sm text-red-600">{errors.businessRefId}</p>
                    )}
                  </div>

                  {/* Points to Add */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points to Add *
                    </label>
                    <div className="flex items-center">
                      <Award className="w-5 h-5 text-gray-500 mr-3" />
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={formData.pointsToAdd || ''}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          handleInputChange('pointsToAdd', value);
                        }}
                        className={`flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                          errors.pointsToAdd ? 'border-red-300 focus:ring-red-500' : ''
                        }`}
                        placeholder="Enter points (1-10000)"
                      />
                    </div>
                    {errors.pointsToAdd && (
                      <p className="mt-1 text-sm text-red-600">{errors.pointsToAdd}</p>
                    )}
                    <p className="mt-1 text-sm text-gray-500">
                      Enter the number of loyalty points to add to the customer&#39;s account
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        mobileNumber: '',
                        countryCode: '+1',
                        businessRefId: '',
                        pointsToAdd: 0
                      });
                      setErrors({});
                      setResponse(null);
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4 inline mr-2" />
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding Points...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 inline mr-2" />
                        Add Loyalty Points
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Transaction Search Form */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Reference ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., c23bd6f1-df36-42ec-bcaf-b6e4c85423d6"
                    value={transactionFormData.userRefId}
                    onChange={(e) => handleInputChange('userRefId', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.userRefId ? 'border-red-300 focus:ring-red-500' : ''
                    }`}
                  />
                  {errors.userRefId && (
                    <p className="mt-1 text-sm text-red-600">{errors.userRefId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Reference ID *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., b938790e-4a03-4600-bad9-8458984dcb8f"
                    value={transactionFormData.businessRefId}
                    onChange={(e) => handleInputChange('businessRefId', e.target.value)}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none ${
                      errors.businessRefId ? 'border-red-300 focus:ring-red-500' : ''
                    }`}
                  />
                  {errors.businessRefId && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessRefId}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={transactionFormData.limit}
                    onChange={(e) => handleInputChange('limit', parseInt(e.target.value) || 10)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Default limit: 10 (max: 1000)
                </div>
                <button
                  onClick={handleViewTransactions}
                  disabled={isFetchingTransactions}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetchingTransactions ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 inline mr-2" />
                      View Transactions
                    </>
                  )}
                </button>
              </div>

              {/* Transactions Table */}
              {transactions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 rounded-lg">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Restaurant</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map((transaction, index) => (
                          <tr key={transaction.transactionRefId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.type)}`}>
                                {getTransactionTypeIcon(transaction.type)}
                                <span className="ml-1">{transaction.type}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${
                                transaction.type === 'earn' ? 'text-green-600' : 'text-blue-600'
                              }`}>
                                {transaction.type === 'earn' ? '+' : '-'}{Math.abs(transaction.pointsChanged)}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(transaction.eventDate)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {transaction.restaurantName}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500 max-w-xs truncate">
                              {transaction.restaurantAddress}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {transactions.length === 0 && !isFetchingTransactions && response && response.success === true && (
                <div className="mt-6 text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
                  <p className="text-gray-600">
                    No loyalty transactions found for this user.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Award className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">Loyalty Program</h3>
            <p className="mt-1 text-sm text-blue-700">
              Manage customer loyalty points by adding rewards or viewing their complete transaction history
              across all restaurants and locations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
