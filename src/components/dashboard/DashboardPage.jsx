// src/components/dashboard/DashboardPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Loader2, Rocket, Sparkles } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Widgets
import { OverviewCard } from './widgets/OverviewCard.jsx';
import { SetupGuide } from './widgets/SetupGuide.jsx';
import { SalesTargetCard } from './widgets/SalesTargetCard.jsx';
import { InventoryAlertCard } from './widgets/InventoryAlertCard.jsx';
import { TopProductsCard } from './widgets/TopProductsCard.jsx';
import { AiCoachCard } from './widgets/AiCoachCard.jsx';
import { UpgradeTeaserWidget } from './UpgradeTeaserWidget.jsx';

// Components & Config
import { ProductForm } from './ProductForm.jsx';
import { RevenueChart } from '../../RevenueChart.jsx'; 
import { DashboardSkeleton } from '../shared/Skeleton.jsx';
import { PLAN_DETAILS, CURRENCY_CODE } from '../../config.js';

export function DashboardPage() {
  const { 
    user, store, services, showError, showSuccess, 
    sendSystemNotification, onOpenUpgradeModal 
  } = useOutletContext();
  
  const { db, storage, functions } = services;
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [showFirstProductModal, setShowFirstProductModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // --- Product Form Props ---
  const getProductFormProps = () => {
    const currentPlanId = store?.planId || 'free';
    const currentPlanDetails = PLAN_DETAILS[currentPlanId];
    const productLimit = currentPlanDetails?.limits?.products ?? 0;
    const canAddMoreProducts = products.length < productLimit;

    return {
      store,
      sendSystemNotification,
      showError,
      showSuccess,
      product: null, 
      onDone: () => setShowFirstProductModal(false), 
      db,
      storage,
      functions,
      canAddMoreProducts,
      productLimit,
      categories,
      brands,
      onOpenUpgradeModal,
    };
  };

  // --- Data Fetching ---
  useEffect(() => {
    if (!user) return;
    const ordersRef = collection(db, 'stores', user.uid, 'orders');
    // Limit to last 20 to prevent crashes
    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
        console.error('Orders listener error:', error);
        showError('Failed to load orders.');
    });
    return () => unsubscribe();
  }, [store, db, showError, user]);

  useEffect(() => {
    if (!store) return;
    setLoading(true);
    const productsRef = collection(db, 'stores', store.id, 'products');
    const qProducts = query(productsRef);
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
        const fetchedProducts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
        if (fetchedProducts.length === 0) { setShowFirstProductModal(true); }
        setLoading(false); 
    }, (error) => {
        console.error('Products listener error:', error);
        showError('Failed to load products.');
        setLoading(false);
    });
    
    // Only load categories/brands if needed
    const unsubCategories = onSnapshot(query(collection(db, 'stores', store.id, 'categories')), (s) => setCategories(s.docs.map(d => d.data())));
    const unsubBrands = onSnapshot(query(collection(db, 'stores', store.id, 'brands')), (s) => setBrands(s.docs.map(d => d.data())));
    
    return () => { unsubProducts(); unsubCategories(); unsubBrands(); };
  }, [store, db, showError]);

  // --- Analytics Calculation ---
  const proAnalytics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return { 
        totalRevenue: totalRevenue.toFixed(2), 
        totalOrders, 
        averageOrderValue: averageOrderValue.toFixed(2),
    };
  }, [orders]);
  
  const topProducts = useMemo(() => {
    const salesMap = new Map();
    orders.filter((order) => order.status === 'COMPLETED').forEach((order) => {
        order.items.forEach((item) => {
            const productId = item.id;
            const quantity = item.quantity || 0;
            const revenue = (item.price || 0) * quantity;
            const productData = products.find(p => p.id === productId);
            const stock = productData?.stock ?? 0; 
            const currentData = salesMap.get(productId) || { id: productId, name: item.name, salesCount: 0, totalRevenue: 0, imageUrl: item.imageUrl, stock: stock };
            currentData.salesCount += quantity;
            currentData.totalRevenue += revenue;
            salesMap.set(productId, currentData);
        });
    });
    const sortedProducts = Array.from(salesMap.values()).sort((a, b) => b.salesCount - a.salesCount);
    return sortedProducts.slice(0, 5);
  }, [orders, products]);

  // --- Render Loading Skeleton ---
  if (!store || loading) { 
    return <DashboardSkeleton />;
  }

  const currentPlanId = store?.planId || 'free';
  const isFree = currentPlanId === 'free';
  const isPro = currentPlanId === 'pro';
  
  const isOnboardingComplete = products.length > 0 && (store.logoUrl || !isFree);
  const defaultSlug = store?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || user.uid;
  const storeUrl = `${window.location.origin}/${store?.customPath || defaultSlug}`;

  return (
    <>
      <AnimatePresence>
        {showFirstProductModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Rocket className="w-6 h-6 mr-3 text-primary-700" /> Welcome to Your New Store!
                </h2>
                <p className="mt-1 text-gray-600">Let's add your first product to get started.</p>
              </div>
              <div className="p-6 overflow-y-auto">
                <ProductForm {...getProductFormProps()} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!showFirstProductModal && (
        <motion.main 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24"
          initial="hidden" animate="visible" 
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        >
          {/* 1. HEADER: Personal & Clean */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                {new Date().getHours() < 12 ? 'Good morning' : 'Good evening'}, {store.ownerName?.split(' ')[0]}
              </h1>
              <p className="text-gray-500 mt-1">Here is your store performance today.</p>
            </div>
            <a href={storeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors shadow-sm">
               <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
               View Live Store
            </a>
          </div>

          {/* 2. SETUP GUIDE (Only show if NOT complete) */}
          {!isOnboardingComplete && (
            <div className="mb-8">
               <SetupGuide store={store} products={products} onOpenUpgradeModal={onOpenUpgradeModal} />
            </div>
          )}

          {/* 3. KEY METRICS (The "Overview" - Clean Row) */}
          {!isFree ? (
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                   <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
                   <p className="text-2xl font-bold text-gray-900">{CURRENCY_CODE} {proAnalytics.totalRevenue}</p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                   <p className="text-sm text-gray-500 mb-1">Orders</p>
                   <p className="text-2xl font-bold text-gray-900">{proAnalytics.totalOrders}</p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
                   <p className="text-sm text-gray-500 mb-1">Avg. Order</p>
                   <p className="text-2xl font-bold text-gray-900">{CURRENCY_CODE} {proAnalytics.averageOrderValue}</p>
                </div>
                <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm flex items-center cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => document.getElementById('ai-coach')?.scrollIntoView({behavior: 'smooth'})}>
                   <div className="mr-3 p-2 bg-white rounded-full"><Sparkles className="w-4 h-4 text-indigo-600" /></div>
                   <div>
                      <p className="text-xs font-bold text-indigo-800 uppercase">AI Coach</p>
                      <p className="text-sm text-indigo-600 font-medium">1 New Insight</p>
                   </div>
                </div>
             </div>
          ) : (
             <div className="mb-8">
                <OverviewCard totalRevenue={proAnalytics.totalRevenue} totalOrders={proAnalytics.totalOrders} />
             </div>
          )}

          {/* 4. MAIN DASHBOARD GRID (The "Work" Area) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             
             {/* LEFT COLUMN (2/3): Operations & Trends */}
             <div className="lg:col-span-2 space-y-8">
                {isPro && (
                   <div className="card p-6">
                      <h3 className="font-bold text-gray-900 mb-4">Revenue Trend</h3>
                      <div className="h-64 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                         <RevenueChart orders={orders} />
                      </div>
                   </div>
                )}
                
                <TopProductsCard 
                   currentPlanId={currentPlanId}
                   topProducts={topProducts}
                   onOpenUpgradeModal={onOpenUpgradeModal}
                />
             </div>

             {/* RIGHT COLUMN (1/3): Strategy & Health */}
             <div className="space-y-8">
                <div id="ai-coach">
                    <AiCoachCard 
                        currentPlanId={currentPlanId} 
                        onOpenUpgradeModal={onOpenUpgradeModal} 
                        topProducts={topProducts}
                        orders={orders}
                    />
                </div>

                <InventoryAlertCard products={products} currentPlanId={currentPlanId} onOpenUpgradeModal={onOpenUpgradeModal} />
                
                <SalesTargetCard store={store} totalRevenue={proAnalytics.totalRevenue} currentPlanId={currentPlanId} onOpenUpgradeModal={onOpenUpgradeModal} />
             </div>
          </div>

          {/* 5. UPGRADE TEASER (Bottom, unobtrusive) */}
          {!isPro && (
             <div className="mt-12">
                <UpgradeTeaserWidget currentPlanId={currentPlanId} onOpenUpgradeModal={onOpenUpgradeModal} />
             </div>
          )}
        </motion.main>
      )}
    </>
  );
}