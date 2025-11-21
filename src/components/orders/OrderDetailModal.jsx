// src/components/orders/OrderDetailModal.jsx
import React from 'react';
import { X, Eye, MessageSquare } from 'lucide-react';
import { ProductImage } from '../../ProductImage.jsx';

const getStatusClasses = (status) => {
  switch (status) {
    case 'COMPLETED': return 'bg-alert-success/10 text-alert-success border border-alert-success/20';
    case 'SHIPPED': return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'CANCELLED': return 'bg-red-100 text-red-800 border border-red-200';
    case 'PENDING': default: return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  }
};

export function OrderDetailModal({ isOpen, onClose, order, handleUpdateOrderStatus, onWhatsAppReview }) {
  if (!isOpen || !order) return null;

  const {
    customerName, customerPhone, customerEmail, customerAddress, items,
    total, paymentMethod, paymentProofUrl, status, createdAt, id: orderId,
  } = order;

  const formattedDate = createdAt?.toDate ? new Date(createdAt.toDate()).toLocaleString() : 'N/A';
  const statusOptions = ['PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Order Details <code className="text-base bg-gray-100 px-2 rounded font-mono ml-2">#{orderId.slice(-6).toUpperCase()}</code>
          </h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200">
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
              <p className="font-bold text-lg text-alert-success">${CURRENCY_CODE} {total?.toFixed(2) || '0.00'}</p>
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
            {paymentProofUrl && (
              <a href={paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline flex items-center font-medium pt-1">
                <Eye className="w-4 h-4 mr-1" /> View Payment Proof
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
                  <span className="font-semibold text-gray-800">${CURRENCY_CODE} {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-gray-50 flex flex-wrap items-center gap-3">
          <label htmlFor="modal-status-update" className="text-sm font-medium text-gray-700 flex-shrink-0">Change Status:</label>
          <select
            id="modal-status-update"
            value={status || 'PENDING'}
            onChange={(e) => { handleUpdateOrderStatus(orderId, e.target.value); onClose(); }}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <button
            type="button"
            onClick={() => { onWhatsAppReview(order); onClose(); }}
            className="btn-secondary btn-sm flex items-center gap-1.5 flex-grow sm:flex-grow-0 justify-center"
            style={{ backgroundColor: '#25D366', color: 'white', borderColor: '#25D366' }}
            title="Send a review request via WhatsApp"
            disabled={!customerPhone}
          >
            <MessageSquare className="w-4 h-4" />
            Request Review (WhatsApp)
          </button>
        </div>
      </div>
    </div>
  );
}