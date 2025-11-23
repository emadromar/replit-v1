// src/components/orders/OrderDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Eye, MessageSquare, Loader2, Check, ExternalLink, Calendar, DollarSign, Tag, Package, MapPin, CreditCard, Mail, Phone, User } from 'lucide-react';
import { ProductImage } from '../../ProductImage.jsx';
import { CURRENCY_CODE } from '../../config.js';

const getStatusClasses = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-100';
    case 'SHIPPED':
      return 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-100';
    case 'CANCELLED':
      return 'bg-red-50 text-red-700 border-red-200 ring-1 ring-red-100';
    case 'PENDING': default:
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-100';
  }
};

export function OrderDetailModal({ isOpen, onClose, order, handleUpdateOrderStatus, onWhatsAppReview }) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusJustChanged, setStatusJustChanged] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fix #10: Escape key handler
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  // Fix #24: Focus management
  useEffect(() => {
    if (isOpen) {
      const focusableElement = document.querySelector('#modal-status-update');
      if (focusableElement) {
        setTimeout(() => focusableElement.focus(), 100);
      }
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const {
    customerName, customerPhone, customerEmail, customerAddress, items,
    total, paymentMethod, paymentProofUrl, status, createdAt, id: orderId,
  } = order;

  const formattedDate = createdAt?.toDate ? new Date(createdAt.toDate()).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A';
  const statusOptions = ['PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

  // Check if status has changed from original
  const hasStatusChanged = selectedStatus && selectedStatus !== status;

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSaveStatus = async () => {
    if (!hasStatusChanged) return;

    // Fix #12: Confirmation for destructive CANCELLED action
    if (selectedStatus === 'CANCELLED' && status !== 'CANCELLED') {
      const confirmed = window.confirm(
        'Are you sure you want to cancel this order? This action indicates the order will not be fulfilled.'
      );
      if (!confirmed) {
        setSelectedStatus(status);
        return;
      }
    }

    setIsUpdatingStatus(true);
    try {
      await handleUpdateOrderStatus(orderId, selectedStatus);
      setStatusJustChanged(true);

      // Delay modal close for visual feedback
      setTimeout(() => {
        setStatusJustChanged(false);
        setSelectedStatus('');
        onClose();
      }, 1500);
    } catch (error) {
      setIsUpdatingStatus(false);
    }
  };

  const handleModalClose = () => {
    if (!isUpdatingStatus) {
      setSelectedStatus('');
      setStatusJustChanged(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity" onClick={handleModalClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-transform duration-300 scale-100" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Order Details
              <span className="text-sm font-mono font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">#{orderId.slice(-6).toUpperCase()}</span>
            </h2>
          </div>
          <button onClick={handleModalClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors" disabled={isUpdatingStatus} title="Close (Esc)">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col items-center text-center hover:border-primary-100 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-primary-600">
                <Calendar className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Order Date</p>
              <p className="font-medium text-gray-900 text-sm mt-1">{formattedDate}</p>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col items-center text-center hover:border-primary-100 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">Total Value</p>
              <p className="font-bold text-lg text-emerald-700 mt-1">{CURRENCY_CODE} {total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
            </div>

            <div className={`p-4 rounded-xl border flex flex-col items-center text-center transition-colors ${getStatusClasses(status || 'PENDING')}`}>
              <div className="w-10 h-10 rounded-full bg-white/80 shadow-sm flex items-center justify-center mb-3">
                <Tag className="w-5 h-5" />
              </div>
              <p className="text-xs uppercase font-bold opacity-80 tracking-wide">Status</p>
              <p className="font-extrabold text-lg mt-1">{status || 'PENDING'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" /> Customer Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500 font-bold text-xs">
                    {customerName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{customerName}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {customerPhone}</p>
                    {customerEmail && <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {customerEmail}</p>}
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700 leading-relaxed">{customerAddress || 'No address provided'}</p>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" /> Payment Info
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="text-sm text-gray-600">Method</span>
                  <span className="font-semibold text-gray-900">{paymentMethod}</span>
                </div>

                {paymentMethod === 'CLIQ' && (
                  <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100 flex items-start gap-2">
                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                    Requires merchant verification. Check your bank app.
                  </div>
                )}

                {paymentProofUrl && (
                  <a href={paymentProofUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full p-2.5 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors border border-primary-100 group">
                    <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    View Payment Proof
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Items List */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-400" /> Items Purchased
            </h3>
            <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {items?.map((item, index) => (
                  <li key={index} className="flex items-center p-4 hover:bg-white transition-colors">
                    <ProductImage src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-gray-200 shadow-sm mr-4" />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">Quantity: <span className="font-medium text-gray-900">{item.quantity}</span></p>
                    </div>
                    <div className="text-right pl-4">
                      <p className="font-bold text-gray-900">{CURRENCY_CODE} {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      {item.quantity > 1 && <p className="text-xs text-gray-400 mt-0.5">{CURRENCY_CODE} {item.price} each</p>}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="bg-gray-100 p-4 flex justify-between items-center border-t border-gray-200">
                <span className="font-medium text-gray-600">Total Amount</span>
                <span className="font-bold text-xl text-gray-900">{CURRENCY_CODE} {total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-grow w-full sm:w-auto flex items-center gap-3 bg-white p-1.5 rounded-xl border border-gray-200 shadow-sm">
              <label htmlFor="modal-status-update" className="text-sm font-semibold text-gray-600 pl-3 whitespace-nowrap">Change Status:</label>
              <select
                id="modal-status-update"
                value={selectedStatus || status || 'PENDING'}
                onChange={handleStatusChange}
                disabled={isUpdatingStatus}
                className={`flex-grow border-0 bg-transparent text-sm font-medium focus:ring-0 cursor-pointer py-1.5 pl-2 pr-8 text-gray-900 ${isUpdatingStatus ? 'opacity-50' : ''}`}
              >
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {hasStatusChanged && (
              <button
                onClick={handleSaveStatus}
                disabled={isUpdatingStatus}
                className={`w-full sm:w-auto btn-primary py-2.5 px-6 flex items-center justify-center gap-2 shadow-md transition-all ${statusJustChanged ? 'bg-green-600 hover:bg-green-700 border-green-600' : ''
                  } ${isUpdatingStatus ? 'opacity-75 cursor-wait' : ''}`}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : statusJustChanged ? (
                  <>
                    <Check className="w-4 h-4" />
                    Updated!
                  </>
                ) : (
                  'Save New Status'
                )}
              </button>
            )}
          </div>

          {customerPhone && (
            <div className="pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { onWhatsAppReview(order); handleModalClose(); }}
                disabled={isUpdatingStatus}
                className="w-full group relative overflow-hidden rounded-xl bg-[#25D366] p-3 text-white shadow-sm transition-all hover:bg-[#1ea952] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
              >
                <div className="relative z-10 flex items-center justify-center gap-2 font-semibold">
                  <MessageSquare className="w-5 h-5" />
                  <span>Request Review via WhatsApp</span>
                </div>
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:animate-shimmer" />
              </button>
              <p className="text-xs text-gray-500 text-center mt-2.5">
                Send a pre-filled message to {customerName} asking for their feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}