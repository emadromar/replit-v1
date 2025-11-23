// src/components/orders/OrderDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Eye, MessageSquare, Loader2, Check, ExternalLink } from 'lucide-react';
import { ProductImage } from '../../ProductImage.jsx';
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
      return 'bg-gray-50 text-gray-700 border-gray-300 ring-1 ring-gray-200';
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

  const formattedDate = createdAt?.toDate ? new Date(createdAt.toDate()).toLocaleString() : 'N/A';
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
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity" onClick={handleModalClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          {/* Fix #19: modal header responsive */}
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Order Details <code className="text-sm md:text-base bg-gray-100 px-2 rounded font-mono ml-2">#{orderId.slice(-6).toUpperCase()}</code>
          </h2>
          {/* Fix #27: Tooltip on close button */}
          <button onClick={handleModalClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200" disabled={isUpdatingStatus} title="Close (Esc)">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-5 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border bg-gray-50 md:col-span-1">
              <p className="text-xs text-gray-600 uppercase font-medium">Order Date</p>
              <p className="font-semibold text-sm">{formattedDate}</p>
            </div>
            <div className="p-3 rounded-lg border bg-gray-50 md:col-span-1">
              <p className="text-xs text-gray-600 uppercase font-medium">Total Value</p>
              {/* Fix #17: Thousand separator */}
              <p className="font-bold text-lg text-alert-success">{CURRENCY_CODE} {total?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</p>
            </div>
            <div className={`p-3 rounded-lg border md:col-span-1 ${getStatusClasses(status || 'PENDING')}`}>
              <p className="text-xs uppercase font-bold">Status</p>
              <p className="font-extrabold text-lg">{status || 'PENDING'}</p>
            </div>
          </div>

          {/* Customer */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-primary-700 mb-2">Customer & Shipping</h3>
            <p className="text-sm"><strong>Name:</strong> {customerName}</p>
            <p className="text-sm"><strong>Phone:</strong> {customerPhone}</p>
            {customerEmail && <p className="text-sm"><strong>Email:</strong> {customerEmail}</p>}
            <p className="text-sm"><strong>Address:</strong> {customerAddress}</p>
          </div>

          {/* Payment */}
          <div className="border p-4 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">Payment Method</h3>
            <p className="text-sm"><strong>Method:</strong> {paymentMethod}</p>
            {paymentMethod === 'CLIQ' && <p className="text-sm text-alert-warning font-medium">Note: Requires merchant verification.</p>}
            {/* Fix #23: External link icon */}
            {paymentProofUrl && (
              <a href={paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline flex items-center font-medium pt-1">
                <Eye className="w-4 h-4 mr-1" /> View Payment Proof <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            )}
          </div>

          {/* Items */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Items Purchased</h3>
            <ul className="space-y-2 text-sm">
              {items?.map((item, index) => (
                <li key={index} className="flex justify-between items-center border-b last:border-b-0 py-2">
                  <ProductImage src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-md object-cover mr-3" />
                  <div className="flex-1">
                    <span className='font-medium text-gray-800'>{item.name}</span>
                    <span className='block text-xs text-gray-500'>Qty: {item.quantity}</span>
                  </div>
                  {/* Fix #17: Thousand separator */}
                  <span className="font-semibold text-gray-800">{CURRENCY_CODE} {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="modal-status-update" className="text-sm font-medium text-gray-700 flex-shrink-0">Change Status:</label>
            <select
              id="modal-status-update"
              value={selectedStatus || status || 'PENDING'}
              onChange={handleStatusChange}
              disabled={isUpdatingStatus}
              className={`flex-grow px-3 py-2 border rounded-lg text-sm shadow-sm focus:ring-primary-500 focus:border-primary-500 transition-colors ${hasStatusChanged ? 'border-primary-400 bg-primary-50' : 'border-gray-300'
                } ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {hasStatusChanged && (
              <button
                onClick={handleSaveStatus}
                disabled={isUpdatingStatus}
                className={`btn-primary btn-sm flex items-center gap-1.5 whitespace-nowrap transition-all ${statusJustChanged ? 'bg-green-600 hover:bg-green-600' : ''
                  } ${isUpdatingStatus ? 'opacity-75' : ''}`}
              >
                {isUpdatingStatus ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving…
                  </>
                ) : statusJustChanged ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            )}
          </div>

          {customerPhone && (
            <div className="pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => { onWhatsAppReview(order); handleModalClose(); }}
                disabled={isUpdatingStatus}
                className={`w-full btn flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ea952] text-white border-0 shadow-sm transition-all ${isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'
                  }`}
              >
                <MessageSquare className="w-4 h-4" />
                {/* Fix #16: Shorter WhatsApp button text */}
                <span>Send WhatsApp Review Request</span>
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Send a friendly review request to {customerName}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}