// src/components/orders/OrderList.jsx
import React from 'react';
import { ShoppingBag, SlidersHorizontal, Eye, Download, Calendar, User, ChevronRight } from 'lucide-react';
import { LockedFeatureTeaser } from '../shared/LockedFeatureTeaser.jsx';
import * as XLSX from 'xlsx';
import { CURRENCY_CODE } from '../../config.js';

const getStatusClasses = (status) => {
  switch (status) {
    case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
    case 'SHIPPED': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
    case 'PENDING': default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusClasses(status || 'PENDING')}`}>
    {status || 'PENDING'}
  </span>
);

const statusOptions = ['ALL', 'PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

// --- Sub-component: Mobile Order Card ---
const MobileOrderCard = ({ order, onClick }) => (
  <div 
    onClick={() => onClick(order)}
    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-primary-300 transition-all cursor-pointer active:scale-[0.99]"
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
  orderDateFilter, onDateFilterChange, totalOrdersCount, onViewDetails, onOpenUpgradeModal
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
              <ShoppingBag className="w-5 h-5 mr-2 text-gray-500"/> 
              Orders <span className="ml-2 text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{orders.length}</span>
          </h2>
          
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <button onClick={exportToExcel} className="btn-secondary-sm flex items-center whitespace-nowrap">
              <Download className="w-4 h-4 mr-2" /> Export
            </button>
            {!isFreePlan && (
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
            ) : !isFreePlan && (
               <button onClick={onOpenUpgradeModal} className="btn-secondary-sm text-xs whitespace-nowrap border-dashed">
                 Filter Date <span className="ml-1 text-[10px] px-1 bg-primary-100 text-primary-700 rounded">PRO</span>
               </button>
            )}
          </div>
        </div>
      </div>
      
      {isFreePlan && (
         <div className="p-4 bg-white"><LockedFeatureTeaser title="Order Filtering" planName="Basic" onUpgrade={onOpenUpgradeModal} /></div>
      )}

      <div className="flex-1 overflow-y-auto bg-gray-50 md:bg-white">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-6">
             <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"><ShoppingBag className="w-8 h-8 text-gray-300" /></div>
             <h3 className="text-base font-semibold text-gray-900">No orders found</h3>
             <p className="text-sm text-gray-500 mt-1">Your orders will appear here.</p>
          </div>
        ) : (
          <>
            {/* MOBILE: Stacked Cards */}
            <div className="md:hidden space-y-3 p-4">
              {orders.map(order => <MobileOrderCard key={order.id} order={order} onClick={onViewDetails} />)}
            </div>

            {/* DESKTOP: Proper Data Table */}
            <div className="hidden md:block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
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
                      className="hover:bg-gray-50 cursor-pointer transition-colors group"
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
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}