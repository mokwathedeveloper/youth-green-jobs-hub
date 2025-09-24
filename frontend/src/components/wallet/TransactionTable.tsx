// TransactionTable Component - Reusable Transaction Display
import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import type { CreditTransaction, TransactionFilters } from '../../types/wallet';

interface TransactionTableProps {
  transactions: CreditTransaction[];
  loading?: boolean;
  onFilter?: (filters: TransactionFilters) => void;
  showFilters?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading = false,
  onFilter,
  showFilters = true
}) => {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const formatAmount = (amount: number) => {
    return `KSh ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'earned':
      case 'bonus':
        return 'text-green-600';
      case 'spent':
      case 'penalty':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned':
      case 'bonus':
        return '+';
      case 'spent':
      case 'penalty':
        return '-';
      default:
        return '';
    }
  };

  const handleFilterChange = (key: keyof TransactionFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilter?.({});
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
          
          {showFilters && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Panel */}
        {showFilterPanel && showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="transaction-search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    id="transaction-search"
                    name="search"
                    type="text"
                    placeholder="Search transactions..."
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="transaction-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  id="transaction-type"
                  name="transaction_type"
                  value={filters.transaction_type || ''}
                  onChange={(e) => handleFilterChange('transaction_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoComplete="off"
                >
                  <option value="">All Types</option>
                  <option value="earned">Earned</option>
                  <option value="spent">Spent</option>
                  <option value="bonus">Bonus</option>
                  <option value="penalty">Penalty</option>
                </select>
              </div>

              <div>
                <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  id="date-from"
                  name="date_from"
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  id="date-to"
                  name="date_to"
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-4 w-48 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="animate-pulse bg-gray-200 h-4 w-20 rounded ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <ArrowUpDown className="w-12 h-12 text-gray-300 mb-4" />
                    <p className="text-lg font-medium">No transactions found</p>
                    <p className="text-sm">Your transaction history will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(transaction.created_at)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      {transaction.waste_report && (
                        <p className="text-xs text-gray-500">
                          {transaction.waste_report.category} - {transaction.waste_report.weight_kg}kg
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      transaction.transaction_type === 'earned' || transaction.transaction_type === 'bonus'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`text-sm font-medium ${getTransactionColor(transaction.transaction_type)}`}>
                      {getTransactionIcon(transaction.transaction_type)}{formatAmount(transaction.amount)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
