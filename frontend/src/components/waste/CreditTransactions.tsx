import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Calendar,

  Package,
  Gift,
  AlertTriangle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { wasteApi } from '../../services/api';
import type {
  CreditTransaction,
  CreditTransactionFilters
} from '../../types/waste';

interface CreditTransactionsProps {
  userId?: string; // If provided, shows only transactions for this user
  showFilters?: boolean;
}

export const CreditTransactions: React.FC<CreditTransactionsProps> = ({
  userId,
  showFilters = true
}) => {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<CreditTransactionFilters>({});
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const pageSize = 20;

  // Load credit balance
  useEffect(() => {
    const loadBalance = async () => {
      try {
        const data = await wasteApi.getCreditBalance();
        setBalance(data.balance);
      } catch (error) {
        console.error('Failed to load credit balance:', error);
      }
    };

    loadBalance();
  }, []);

  // Load transactions
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params = {
          ...filters,
          page: currentPage,
          page_size: pageSize,
          ordering: '-created_at',
          ...(userId && { user: userId })
        };

        const response = await wasteApi.getCreditTransactions(params);
        setTransactions(response.results);
        setTotalCount(response.count);
        setTotalPages(Math.ceil(response.count / pageSize));
      } catch (error) {
        console.error('Failed to load transactions:', error);
        setError('Failed to load credit transactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [currentPage, filters, userId]);

  const handleFilterChange = (newFilters: CreditTransactionFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'earned': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'spent': return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'bonus': return <Gift className="w-5 h-5 text-purple-600" />;
      case 'penalty': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'adjustment': return <Settings className="w-5 h-5 text-blue-600" />;
      default: return <Coins className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string): string => {
    switch (type) {
      case 'earned': return 'text-green-600';
      case 'spent': return 'text-red-600';
      case 'bonus': return 'text-purple-600';
      case 'penalty': return 'text-orange-600';
      case 'adjustment': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getAmountDisplay = (transaction: CreditTransaction): string => {
    const amount = parseFloat(transaction.amount);
    const sign = ['earned', 'bonus', 'adjustment'].includes(transaction.transaction_type) && amount > 0 ? '+' : '';
    return `${sign}${amount}`;
  };

  const handleExport = () => {
    if (transactions.length === 0) {
      alert('No transactions to export');
      return;
    }

    // Create CSV content
    const headers = ['Date', 'Type', 'Amount', 'Description', 'Reference'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(transaction => [
        format(new Date(transaction.created_at), 'yyyy-MM-dd HH:mm:ss'),
        transaction.transaction_type,
        transaction.amount,
        `"${transaction.description.replace(/"/g, '""')}"`, // Escape quotes
        transaction.reference_id || ''
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `credit-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading transactions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {userId ? 'My Credit Transactions' : 'Credit Transactions'}
          </h2>
          <p className="text-gray-600">
            {totalCount} transaction{totalCount !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex gap-2">
          {showFilters && (
            <button
              onClick={() => setShowFilterPanel(!showFilterPanel)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={loading || transactions.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            title={transactions.length === 0 ? "No transactions to export" : "Export transactions to CSV"}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-green-100">Current Balance</h3>
            <p className="text-3xl font-bold">{balance} Credits</p>
          </div>
          <Coins className="w-12 h-12 text-green-200" />
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && showFilterPanel && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transaction Type
              </label>
              <select
                value={filters.transaction_type || ''}
                onChange={(e) => handleFilterChange({ ...filters, transaction_type: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">All types</option>
                <option value="earned">Earned</option>
                <option value="spent">Spent</option>
                <option value="bonus">Bonus</option>
                <option value="penalty">Penalty</option>
                <option value="adjustment">Adjustment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => handleFilterChange({ ...filters, date_from: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => handleFilterChange({ ...filters, date_to: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setFilters({});
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <Coins className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No credit transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Related Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.transaction_type)}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 capitalize">
                            {transaction.transaction_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-500">{transaction.description}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-lg font-semibold ${getTransactionColor(transaction.transaction_type)}`}>
                        {getAmountDisplay(transaction)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.waste_report ? (
                        <div className="flex items-center">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-900">{transaction.waste_report.title}</p>
                            <p className="text-xs text-gray-500">
                              {transaction.waste_report.category.name} • {transaction.waste_report.estimated_weight} kg
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {format(new Date(transaction.created_at), 'MMM d, yyyy h:mm a')}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 font-mono">
                        {transaction.reference_id}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalCount)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{totalCount}</span>
                {' '}results
              </p>
            </div>
            
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        pageNum === currentPage
                          ? 'z-10 bg-green-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
