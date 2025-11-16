// src/OrdersPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
// import { httpsCallable } from 'firebase/functions'; // No longer needed for this
import { 
  Eye, X, ShoppingBag, Loader2, Lock, SlidersHorizontal, 
  Package, CheckCircle, AlertCircle, MessageSquare // <-- IMPORTED MessageSquare
} from 'lucide-react';
import { useFirebaseServices } from './contexts/FirebaseContext.jsx';
import { ProductImage } from './ProductImage.jsx';
import { doc, updateDoc } from 'firebase/firestore';
import { useNotifications } from './contexts/NotificationContext.jsx';
import { useOutletContext } from 'react-router-dom';

// --- Reusable Locked Feature Card (Local Definition for this page) ---
const LockedFeatureTeaser = ({ title, description, icon, planName, onUpgrade, className = "" }) => {
  const Icon = icon || Lock;
  const planColorClass = planName === 'Basic' ? 'text-subscription-basic' : 'text-subscription-pro';
  
  return (
    <div className={`p-4 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                <Icon className={`w-4 h-4 mr-2 ${planColorClass}`} />
                {title}
            </h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planColorClass} bg-white border border-current`}>
                {planName} Plan
            </span>
        </div>
        <p className='text-sm text-gray-500 mt-1 mb-2'>{description}</p>
        <button
            type="button"
            onClick={onUpgrade}
            className="mt-1 text-sm font-semibold text-primary-600 hover:text-primary-500 transition-colors"
        >
            {`Upgrade to ${planName} to enable`}
        </button>
    </div>
);
};

// --- Reusable Status Badge ---
const getStatusClasses = (status) => {
  switch (status) {
    case 'COMPLETED':
      return 'bg-alert-success/10 text-alert-success border border-alert-success/20';
    case 'SHIPPED':
      return 'bg-blue-100 text-blue-800 border border-blue-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'PENDING':
    default:
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  }
};

const StatusBadge = ({ status }) => (
  <span
    className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusClasses(
      status || 'PENDING'
    )}`}
  >
    {status || 'PENDING'}
  </span>
);


// --- OrderDetailModal (Redesigned) ---
// --- RENAMED 'onRequestReview' to 'onWhatsAppReview' ---
function OrderDetailModal({ isOpen, onClose, order, handleUpdateOrderStatus, onWhatsAppReview }) {
  if (!isOpen || !order) return null;

  const {
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    items,
    total,
    paymentMethod,
    paymentProofUrl,
    status,
    createdAt,
    id: orderId,
  } = order;

  const formattedDate = createdAt?.toDate
    ? new Date(createdAt.toDate()).toLocaleString()
    : 'N/A';
  const statusOptions = ['PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col transition-transform duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Order Details{' '}
            <code className="text-base bg-gray-100 px-2 rounded font-mono ml-2">
              #{orderId.slice(-6).toUpperCase()}
            </code>
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow overflow-y-auto p-5 space-y-6">
          {/* Status and Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg border bg-gray-50 md:col-span-1">
              <p className="text-xs text-gray-600 uppercase font-medium">
                Order Date
              </p>
              <p className="font-semibold text-sm">{formattedDate}</p>
            </div>
            <div className="p-3 rounded-lg border bg-gray-50 md:col-span-1">
              <p className="text-xs text-gray-600 uppercase font-medium">
                Total Value
              </p>
              <p className="font-bold text-lg text-alert-success">
                JOD {total?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div
              className={`p-3 rounded-lg border md:col-span-1 ${getStatusClasses(
                status || 'PENDING'
              )}`}
            >
              <p className="text-xs uppercase font-bold">Status</p>
              <p className="font-extrabold text-lg">{status || 'PENDING'}</p>
            </div>
          </div>

          {/* Customer and Shipping Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-primary-700 mb-2">
              Customer & Shipping
            </h3>
            <p className="text-sm">
              <strong>Name:</strong> {customerName}
            </p>
            <p className="text-sm">
              <strong>Phone:</strong> {customerPhone}
            </p>
            {customerEmail && (
              <p className="text-sm">
                <strong>Email:</strong> {customerEmail}
              </p>
            )}
            <p className="text-sm">
              <strong>Address:</strong> {customerAddress}
            </p>
          </div>

          {/* Payment Details */}
          <div className="border p-4 rounded-lg space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">
              Payment Method
            </h3>
            <p className="text-sm">
              <strong>Method:</strong> {paymentMethod}
            </p>
            {paymentMethod === 'CLIQ' && (
              <p className="text-sm text-alert-warning font-medium">
                Note: Requires merchant verification.
              </p>
            )}
            {paymentProofUrl && (
              <a
                href={paymentProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline flex items-center font-medium pt-1"
              >
                <Eye className="w-4 h-4 mr-1" /> View Payment Proof
              </a>
            )}
          </div>

          {/* Items List */}
          <div className="border p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Items Purchased
            </h3>
            <ul className="space-y-2 text-sm">
              {items?.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center border-b last:border-b-0 py-2"
                >
                    <ProductImage src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-md object-cover mr-3" />
                    <div className="flex-1">
                        <span className='font-medium text-gray-800'>{item.name}</span>
                        <span className='block text-xs text-gray-500'>Qty: {item.quantity}</span>
                    </div>
                  <span className="font-semibold text-gray-800">
                    JOD {(item.price * item.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- MODIFIED Footer: Status Update Action --- */}
        <div className="p-5 border-t bg-gray-50 flex flex-wrap items-center gap-3">
          <label
            htmlFor="modal-status-update"
            className="text-sm font-medium text-gray-700 flex-shrink-0"
          >
            Change Status:
          </label>
          <select
            id="modal-status-update"
            value={status || 'PENDING'}
            onChange={(e) => {
              handleUpdateOrderStatus(orderId, e.target.value);
              onClose(); // Close modal immediately after action
            }}
            className="flex-grow px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-primary-500 focus:border-primary-500"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          
          {/* --- REPLACED BUTTON with WhatsApp Review Request --- */}
          <button
            type="button"
            onClick={() => {
              onWhatsAppReview(order);
              onClose(); // Close modal after action
            }}
            className="btn-secondary btn-sm flex items-center gap-1.5 flex-grow sm:flex-grow-0 justify-center"
            style={{ backgroundColor: '#25D366', color: 'white', borderColor: '#25D366' }} // WhatsApp Green
            title="Send a review request via WhatsApp"
            disabled={!customerPhone} // Disable if no phone number
          >
            <MessageSquare className="w-4 h-4" />
            Request Review (WhatsApp)
          </button>
          {/* --- END OF REPLACED BUTTON --- */}

        </div>
      </div>
    </div>
  );
}

// --- OrderList (Redesigned) ---
const statusOptions = ['ALL', 'PENDING', 'SHIPPED', 'COMPLETED', 'CANCELLED'];

function OrderList({
  orders,
  handleUpdateOrderStatus,
  currentPlanId,
  statusFilter,
  onStatusFilterChange,
  orderDateFilter,
  onDateFilterChange,
  totalOrdersCount,
  onViewDetails,
  onOpenUpgradeModal
}) {
  
  const isFreePlan = currentPlanId === 'free';
  const isProPlan = currentPlanId === 'pro';

  return (
    <div className="card p-6">
      {/* Header with Filters */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <ShoppingBag className="w-6 h-6 mr-3 text-primary-600"/>
            All Orders
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Pro Date Filter */}
          {isProPlan ? (
            <div className="w-full sm:w-auto">
              <select
                value={orderDateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="last7days">Last 7 Days</option>
              </select>
            </div>
          ) : !isFreePlan && (
            // Basic plan sees the teaser for date filtering
             <LockedFeatureTeaser
                title="Filter by Date"
                planName="Pro"
                onUpgrade={onOpenUpgradeModal}
              />
          )}
          
          {/* Basic Status Filter */}
          {!isFreePlan ? (
            <div className="w-full sm:w-auto">
              <select
                id="order-status-filter"
                value={statusFilter}
                onChange={(e) => onStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm shadow-sm focus:ring-primary-500 focus:border-primary-500"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'ALL' ? 'All Statuses' : status}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      </div>
      
        {/* Free Plan Filter Teaser */}
      {isFreePlan && (
         <LockedFeatureTeaser
            title="Order Filtering"
            description="Upgrade to Basic to filter orders by status, or Pro to also filter by date."
            icon={SlidersHorizontal}
            planName="Basic"
            onUpgrade={onOpenUpgradeModal}
            className="mb-4"
        />
      )}

      {/* Summary Card (Basic/Pro) */}
      {!isFreePlan && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-600 uppercase">
            Order Summary
          </h3>
          <p className="text-2xl font-bold text-gray-800">
            {orders.length}{' '}
            <span className="text-lg font-normal text-gray-500">
              of {totalOrdersCount} total orders shown
            </span>
          </p>
        </div>
      )}

      {/* Order List Area */}
      <div className="space-y-4 max-h-[60rem] overflow-y-auto pr-2">
        {orders.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
             <ShoppingBag className="w-12 h-12 mx-auto text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">No orders found</h3>
            <p className="text-gray-500 text-sm mt-1">
              {statusFilter !== 'ALL' || (isProPlan && orderDateFilter !== 'all')
                ? 'No orders match your filters.'
                : 'When you get a new order, it will appear here.'}
            </p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="card card-hover p-4 cursor-pointer"
              onClick={() => onViewDetails(order)}
            >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                    {/* Left Side: Customer & ID */}
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{order.customerName}</p>
                        <p className="text-sm text-gray-500">
                            Order ID:{' '}
                            <code className="text-xs bg-gray-100 px-1 rounded font-mono">
                                {order.id.slice(-6).toUpperCase()}
                            </code>
                        </p>
                    </div>
                    
                    {/* Right Side: Status & Total */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <p className="font-bold text-lg text-alert-success">
                            JOD {order.total?.toFixed(2) || '0.00'}
                        </p>
                        <StatusBadge status={order.status} />
                        <Eye className="w-5 h-5 text-gray-400 hidden sm:block" />
                    </div>
                </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function OrdersPage() {
  const { user, store, services, showError, showSuccess, onOpenUpgradeModal } = useOutletContext();
  const { db } = services;
  const { sendSystemNotification } = useNotifications();

  // Define handleUpdateOrderStatus INSIDE the component
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    const storeId = user?.uid;
    if (!storeId || !db) return;

    try {
      const orderRef = doc(db, "stores", storeId, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      showSuccess(`Order status updated to ${newStatus}.`);

      if (newStatus === 'COMPLETED' && store.planId !== 'free') {
        sendSystemNotification(
          storeId,
          store.email,
          store.planId,
          'order_completed',
          `Order ${orderId.slice(-6).toUpperCase()} has been marked as COMPLETED.`
        );
      }
    } catch (error) { 
      showError(`Update failed: ${error.message}`);
    }
  };

  
  // --- REPLACED with WhatsApp Review Request function ---
  const handleWhatsAppReviewRequest = (order) => {
    if (!order || !order.customerPhone) {
      showError("This order has no customer phone number.");
      return;
    }
    
    const customerName = order.customerName || 'Valued Customer';
    const storeName = store.name || 'our store';
    
    // Create the bilingual message template
    const message = `Hi ${customerName}! This is ${storeName}. We see your order was delivered. We hope you love it!
    
If you have a moment, could you send a quick review? Your feedback means a lot to us.
    
(مرحباً ${customerName}! معك ${storeName}. نتمنى أن طلبك قد وصل.

إذا عندك دقيقة، ممكن تبعتلنا رأيك؟ رأيك بهمنا كتير.)`;

    // Create the wa.me link
    const whatsappUrl = `https://wa.me/${order.customerPhone}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
    
    showSuccess("Opening WhatsApp to request review...");
  };
  // --- END OF NEW FUNCTION ---

  
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- Filter State ---
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderDateFilter, setOrderDateFilter] = useState('all');

  // Fetch orders
  useEffect(() => {
    if (!user || !db) return;

    const storeId = user.uid;
    const ordersRef = collection(db, 'stores', storeId, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error('Orders listener error:', error);
        showError('Failed to load orders.');
      }
    );

    return () => unsubscribe();
  }, [user, db, showError]);

  // Filtered Data Logic
  const filteredOrders = useMemo(() => {
    let tempOrders = [...orders];

    if (orderStatusFilter !== 'ALL') {
      tempOrders = tempOrders.filter(
        (order) => (order.status || 'PENDING') === orderStatusFilter
      );
    }

    if (store?.planId === 'pro' && orderDateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // --- THIS IS THE LINE WITH THE TYPO ---
      // I removed the extra '.' before 'if'
      if (orderDateFilter === 'today') {
        tempOrders = tempOrders.filter((order) => {
          const orderDate = order.createdAt?.toDate();
          if (!orderDate) return false;
          return orderDate >= today;
        });
      } else if (orderDateFilter === 'last7days') {
        const sevenDaysAgo = new Date(
          today.getTime() - 6 * 24 * 60 * 60 * 1000
        );
        tempOrders = tempOrders.filter((order) => {
          const orderDate = order.createdAt?.toDate();
          if (!orderDate) return false;
          return orderDate >= sevenDaysAgo;
        });
      }
    }

    return tempOrders;
  }, [orders, orderStatusFilter, orderDateFilter, store?.planId]);

  if (!store) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
        </div>
    );
  }

  return (
    <>
<div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
        <OrderList
        orders={filteredOrders}
        onViewDetails={setSelectedOrder}
        handleUpdateOrderStatus={handleUpdateOrderStatus}
        currentPlanId={store?.planId || 'free'}
        statusFilter={orderStatusFilter}
        onStatusFilterChange={setOrderStatusFilter}
        orderDateFilter={orderDateFilter}
        onDateFilterChange={setOrderDateFilter}
        totalOrdersCount={orders.length}
        onOpenUpgradeModal={onOpenUpgradeModal}
      />
      </div>

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        handleUpdateOrderStatus={handleUpdateOrderStatus}
        onWhatsAppReview={handleWhatsAppReviewRequest} // <-- PASS THE NEW FUNCTION HERE
      />
    </>
  );
}