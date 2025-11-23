// src/pages/OrdersPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, limit } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { useOutletContext, useSearchParams } from 'react-router-dom';

import { useNotifications } from '../contexts/NotificationContext.jsx';
import { OrderList } from '../components/orders/OrderList.jsx';
import { OrderDetailModal } from '../components/orders/OrderDetailModal.jsx';
import { ErrorState } from '../components/shared/ErrorState.jsx';
import { sanitizePhoneForWhatsApp } from '../utils/phoneUtils.js';

export function OrdersPage() {
  const { user, store, services, showError, showSuccess, onOpenUpgradeModal } = useOutletContext();
  const { db } = services;
  const { sendSystemNotification } = useNotifications();

  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState(initialStatus);
  const [orderDateFilter, setOrderDateFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

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

  const handleWhatsAppReviewRequest = (order) => {
    if (!order || !order.customerPhone) {
      showError("This order has no customer phone number.");
      return;
    }

    const customerName = order.customerName || 'Valued Customer';
    const storeName = store.name || 'our store';
    const cleanPhone = sanitizePhoneForWhatsApp(order.customerPhone);
    const message = `Hi ${customerName}! This is ${storeName}. We see your order was delivered. We hope you love it!\n\nIf you have a moment, could you send a quick review? Your feedback means a lot to us.\n\n(مرحباً ${customerName}! معك ${storeName}. نتمنى أن طلبك قد وصل.\n\nإذا عندك دقيقة، ممكن تبعتلنا رأيك؟ رأيك بهمنا كتير.)`;
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
    showSuccess("Opening WhatsApp to request review...");
  };

  // Fetch orders
  useEffect(() => {
    if (!user || !db) return;
    const storeId = user.uid;
    const ordersRef = collection(db, 'stores', storeId, 'orders');

    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoadError(null);
      setIsLoading(false);
    }, (error) => {
      console.error('Orders listener error:', error);
      setLoadError(error.message);
      setIsLoading(false);
      showError('Failed to load orders.');
    }
    );
    return () => unsubscribe();
  }, [user, db, showError]);

  const handleRetry = () => {
    setIsLoading(true);
    setLoadError(null);
    // The useEffect will re-run and attempt to fetch orders again
  };

  // Filter Logic
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

      if (orderDateFilter === 'today') {
        tempOrders = tempOrders.filter((order) => {
          const orderDate = order.createdAt?.toDate();
          if (!orderDate) return false;
          return orderDate >= today;
        });
      } else if (orderDateFilter === 'last7days') {
        const sevenDaysAgo = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
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
        {loadError ? (
          <ErrorState message={loadError} onRetry={handleRetry} />
        ) : (
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
            isLoading={isLoading}
            store={store}
          />
        )}
      </div>

      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        handleUpdateOrderStatus={handleUpdateOrderStatus}
        onWhatsAppReview={handleWhatsAppReviewRequest}
      />
    </>
  );
}
