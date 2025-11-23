// src/components/orders/OrderList.jsx
import React from 'react';
import { ShoppingBag, SlidersHorizontal, Eye, Download, Calendar, User, ChevronRight, Loader2 } from 'lucide-react';
import { LockedButton } from '../shared/LockedButton.jsx';
import * as XLSX from 'xlsx';
import { CURRENCY_CODE } from '../../config.js';

const getStatusClasses = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-green-50 text-green-700 border-green-300 ring-1 ring-green-200';
    case 'SHIPPED':
      return 'bg-blue-50 text-blue-700 border-blue-300 ring-1 ring-blue-200';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-300 ring-1 ring-red-200';
    case 'PENDING': default:
      return 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-200';
  }
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusClasses(status || 'PENDING')}`}>
    {status || 'PENDING'}
  </span>
);

const statusOptions = ['ALL', 'PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

// --- Sub-component: Mobile Order Card ---
const MobileOrderCard = ({ order, onClick }) => (
  <div
    onClick={() => onClick(order)}
    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-primary-300 transition-all cursor-pointer active:scale[0.99]"
  >
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">#{order.id.slice(-6).toUpperCase()}</span>
          <span className="text-xs text-gray-500">{order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'N/A'}</span>
        </div>
        <p className="text-sm text-gray-600 mt-0.5 flex items-center gap-1">
          <User className="w-3 h-3" /> {order.customerName || 'Guest'}
        </p>
      </div>
      <StatusBadge status={order.status} />
    </div>

    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
      <p className="text-base font-bold text-gray-900">
        {CURRENCY_CODE} {order.total?.toFixed(2) || '0.00'}
      </p>
      <div className="flex items-center text-primary-600 text-xs font-semibold">
        View Details <ChevronRight className="w-3 h-3 ml-1" />
      </div>
    </div>
  </div>
);

export function OrderList({
  orders, currentPlanId, statusFilter, onStatusFilterChange,
  orderDateFilter, onDateFilterChange, totalOrdersCount, onViewDetails, onOpenUpgradeModal, isLoading, store
}) {
  const isFreePlan = currentPlanId === 'free';
  const isProPlan = currentPlanId === 'pro';

  const exportToExcel = () => {
    if (orders.length === 0) return;
    const data = orders.map(order => ({
      'Order ID': order.id.slice(-6).toUpperCase(),
      'Date': order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'N/A',
      'Customer': order.customerName || 'Guest',
      'Total': order.total || 0,
      'Status': order.status || 'PENDING',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, `Orders_Export.xlsx`);
  };

  return (
    <div className="card h-full flex flex-col p-0 overflow-hidden bg-gray-50 md:bg-white border-0 md:border">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 bg-white">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-gray-500" />
            Orders <span className="ml-2 text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {orders.length === totalOrdersCount
                ? totalOrdersCount
                : `${orders.length} of ${totalOrdersCount}`
              }
            </span>
          </h2>

          <div className="relative">
            <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
              <button onClick={exportToExcel} className="btn-secondary-sm flex items-center whitespace-nowrap">
                <Download className="w-4 h-4 mr-2" /> Export
              </button>
              {isFreePlan ? (
                <LockedButton feature="Status Filter" planName="BASIC" onClick={onOpenUpgradeModal} className="whitespace-nowrap" />
              ) : (
                <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)} className="input py-1.5 text-sm w-auto">
                  {statusOptions.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>)}
                </select>
              )}
              {isProPlan ? (
                <select value={orderDateFilter} onChange={(e) => onDateFilterChange(e.target.value)} className="input py-1.5 text-sm w-auto">
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="last7days">7 Days</option>
                </select>
              ) : !isFreePlan ? (
                <LockedButton feature="Date Filter" planName="PRO" onClick={onOpenUpgradeModal} className="whitespace-nowrap" />
              ) : null}
            </div>
            {/* Mobile scroll indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 md:bg-white">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600 mb-4" />
            <p className="text-sm text-gray-500">Loading your orders...</p>
          </div>
        ) : totalOrdersCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center p-6 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <ShoppingBag className="w-10 h-10 text-primary-600" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Orders placed by your customers will appear here. Make sure your products are visible and your store is ready to receive orders.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a href="/dashboard/products" className="btn-primary px-6 py-2.5 w-full sm:w-auto justify-center text-center">
                View Products
              </a>
              <a href={`/${currentPlanId === 'pro' && store?.customPath ? store.customPath : 'store'}`} target="_blank" rel="noopener noreferrer" className="btn-secondary px-6 py-2.5 w-full sm:w-auto justify-center text-center">
                Preview Store
              </a>
            </div>

            <p className="text-xs text-gray-400 mt-6">
              Need help? <a href="https://webjor.com/guide" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">Read our guide</a> on getting your first sale.
            </p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-center p-6 max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <SlidersHorizontal className="w-10 h-10 text-gray-400" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">No orders match your filters</h3>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Try adjusting or clearing your filters to see more results. You have {totalOrdersCount} total {totalOrdersCount === 1 ? 'order' : 'orders'}.
            </p>

            <button
              onClick={() => {
                onStatusFilterChange('ALL');
                onDateFilterChange('all');
              }}
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => onViewDetails(order)}
                      className="hover:bg-primary-50 hover:shadow-sm cursor-pointer transition-all group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">
                          {order.customerName?.charAt(0) || 'G'}
                        </div>
                        {order.customerName || 'Guest'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : '-'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{CURRENCY_CODE} {order.total?.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span className="text-primary-600 group-hover:text-primary-800 flex items-center justify-end">View <Eye className="w-4 h-4 ml-1" /></span>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
    </div>
          </>
        )
}
      </div >
    </div >
  );
}