// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { Rocket, Filter, ChevronDown, Copy, Check, TrendingUp, AlertCircle } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

// Widgets
import { OverviewCard } from '../components/dashboard/widgets/OverviewCard.jsx';
import { SetupGuide } from '../components/dashboard/widgets/SetupGuide.jsx';
import { SalesTargetCard } from '../components/dashboard/widgets/SalesTargetCard.jsx';
import { InventoryAlertCard } from '../components/dashboard/widgets/InventoryAlertCard.jsx';
import { TopProductsCard } from '../components/dashboard/widgets/TopProductsCard.jsx';
import { AiCoachCard } from '../components/dashboard/widgets/AiCoachCard.jsx';
import { UpgradeTeaserWidget } from '../components/dashboard/UpgradeTeaserWidget.jsx';
import { QuickActions } from '../components/dashboard/widgets/QuickActions.jsx';
import { StatsRow } from '../components/dashboard/widgets/StatsRow.jsx'; // NEW

// Components & Config
import { ProductForm } from '../components/dashboard/ProductForm.jsx';
import { RevenueChart } from '../RevenueChart.jsx'; 
import { DashboardSkeleton } from '../components/shared/Skeleton.jsx';
import { PLAN_DETAILS, CURRENCY_CODE } from '../config.js';
import { SlideOver } from '../components/shared/SlideOver.jsx'; 
import ErrorBoundary from '../components/shared/ErrorBoundary.jsx';

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
  
  const [timeRange, setTimeRange] = useState(7);
  const [isFilterOpen, setIsFilterOpen] = useState(false); 
  const [linkCopied, setLinkCopied] = useState(false);

  // Drawer control
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // --- Derived State ---
  const currentPlanId = store?.planId || 'free';
  const isFree = currentPlanId === 'free';
  const isPro = currentPlanId === 'pro';
  const currentPlanDetails = PLAN_DETAILS[currentPlanId];
  const productLimit = currentPlanDetails?.limits?.products ?? 0;
  const canAddMoreProducts = products.length < productLimit;
  
  // Logic: Is the setup guide visible?
  // We check local storage to see if it was dismissed
  const isSetupDismissed = localStorage.getItem(`setup_dismissed_${store?.id}`);
  const isOnboardingComplete = products.length > 0 && (store.logoUrl || !isFree);
  const showSetupGuide = !isSetupDismissed && !isOnboardingComplete;

  const defaultSlug = store?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || user.uid;
  const storeUrl = `${window.location.origin}/${store?.customPath || defaultSlug}`;
  const chartDays = timeRange === 'this_month' ? new Date().getDate() : timeRange;

  // --- Data Fetching ---
  useEffect(() => {
    if (!user) return;
    const ordersRef = collection(db, 'stores', user.uid, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(100));
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
    
    const unsubCategories = onSnapshot(query(collection(db, 'stores', store.id, 'categories')), (s) => setCategories(s.docs.map(d => d.data())));
    const unsubBrands = onSnapshot(query(collection(db, 'stores', store.id, 'brands')), (s) => setBrands(s.docs.map(d => d.data())));
    
    return () => { unsubProducts(); unsubCategories(); unsubBrands(); };
  }, [store, db, showError]);

  // --- Calculations ---
  const filteredOrders = useMemo(() => {
    const now = new Date();
    let cutoffDate = new Date();
    if (timeRange === 'this_month') {
      cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      cutoffDate.setDate(now.getDate() - timeRange);
    }
    return orders.filter(order => {
      if (!order.createdAt) return false;
      const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
      return orderDate >= cutoffDate;
    });
  }, [orders, timeRange]);

  const proAnalytics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    return { 
        totalRevenue: totalRevenue.toFixed(2), 
        totalOrders, 
        averageOrderValue: averageOrderValue.toFixed(2),
    };
  }, [filteredOrders]);
  
  const pendingOrdersCount = useMemo(() => {
    return orders.filter(o => o.status === 'PENDING').length;
  }, [orders]);

  const topProducts = useMemo(() => {
    const salesMap = new Map();
    filteredOrders.filter((order) => order.status === 'COMPLETED').forEach((order) => {
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
    return Array.from(salesMap.values()).sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);
  }, [filteredOrders, products]);

  // --- Handlers ---
  const getGreeting = () => {
    const name = store.ownerName?.split(' ')[0] || 'Merchant';
    if (pendingOrdersCount > 0) return `Action Required, ${name}`;
    return `Good day, ${name}`;
  };

  const getRevenueLabel = () => {
    if (timeRange === 'this_month') {
      return `${new Date().toLocaleString('default', { month: 'long' })} Revenue`;
    }
    return `Last ${timeRange} Days Revenue`;
  };

  const handleCopyLink = () => {
    const copyText = (text) => {
        setLinkCopied(true);
        showSuccess("Store link copied!");
        setTimeout(() => setLinkCopied(false), 2000);
    }
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(storeUrl).then(() => copyText(storeUrl));
    } else {
      // Fallback
      try {
        const textArea = document.createElement("textarea");
        textArea.value = storeUrl;
        textArea.style.position = "fixed"; textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus(); textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        copyText(storeUrl);
      } catch (err) { showError("Failed to copy link."); }
    }
  };

  const handleDone = () => setShowForm(false);

  const getProductFormProps = () => ({
      store, sendSystemNotification, showError, showSuccess, product: null, 
      onDone: () => setShowFirstProductModal(false), 
      db, storage, functions, canAddMoreProducts, productLimit, categories, brands, onOpenUpgradeModal,
  });

  if (!store || loading) return <DashboardSkeleton />;

  return (
    <>
      <AnimatePresence>
        {showFirstProductModal && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Rocket className="w-6 h-6 mr-3 text-primary-700" /> Welcome to Your New Store!
                </h2>
                <p className="mt-1 text-gray-600">Let's add your first product to get started.</p>
              </div>
              <div className="p-6 overflow-y-auto">
                <ErrorBoundary><ProductForm {...getProductFormProps()} /></ErrorBoundary>
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
          {/* 1. HEADER & ACTIONS */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {getGreeting()}
              </h1>
              <p className="text-gray-500 mt-1 flex items-center text-sm sm:text-base">
                {pendingOrdersCount > 0 && <AlertCircle className="w-4 h-4 text-orange-500 mr-1.5 flex-shrink-0" />}
                {pendingOrdersCount > 0 ? `You have ${pendingOrdersCount} pending orders.` : "Here is your store overview."}
              </p>
            </div>
            
            <div className="flex flex-row items-center gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
               {!isFree && !showSetupGuide && (
                 <div className="relative z-20 flex-shrink-0">
                   <div className="hidden sm:flex bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
                      <button onClick={() => setTimeRange(7)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${timeRange === 7 ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>7D</button>
                      <button onClick={() => setTimeRange(30)} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${timeRange === 30 ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>30D</button>
                      <button onClick={() => setTimeRange('this_month')} className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${timeRange === 'this_month' ? 'bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-100' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>Month</button>
                   </div>
                   <div className="sm:hidden">
                      <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 shadow-sm">
                        <Filter className="w-3.5 h-3.5" />
                        <span>{timeRange === 'this_month' ? 'This Month' : `${timeRange} Days`}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      {isFilterOpen && (
                        <div className="absolute left-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-30">
                          <button onClick={() => { setTimeRange(7); setIsFilterOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-50">Last 7 Days</button>
                          <button onClick={() => { setTimeRange(30); setIsFilterOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-50">Last 30 Days</button>
                          <button onClick={() => { setTimeRange('this_month'); setIsFilterOpen(false); }} className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50">This Month</button>
                        </div>
                      )}
                   </div>
                 </div>
               )}

               <button onClick={handleCopyLink} className="flex items-center justify-center px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm flex-shrink-0" title="Copy Store Link">
                 {linkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                 <span className="hidden sm:inline ml-2 text-sm font-medium">Copy Link</span>
               </button>

               <a href={storeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-3 py-2 sm:px-4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-all shadow-sm flex-shrink-0" title="View Live Store">
                  <span className="w-2 h-2 bg-green-400 rounded-full sm:mr-2 animate-pulse"></span>
                  <span className="hidden sm:inline">View Store</span>
                  <span className="sm:hidden ml-1 font-bold">Store</span>
               </a>
            </div>
          </div>

          {/* 2. QUICK ACTIONS (Moved up for immediate access) */}
          <div className="mb-6">
             <ErrorBoundary><QuickActions /></ErrorBoundary>
          </div>

          {/* 3. SETUP GUIDE (Progressive Disclosure: If Setup is visible, hide analytics) */}
          {showSetupGuide && (
            <div className="mb-8">
               <ErrorBoundary><SetupGuide store={store} products={products} onOpenUpgradeModal={onOpenUpgradeModal} /></ErrorBoundary>
            </div>
          )}

          {/* 4. ANALYTICS (Only show if setup is done or user is active) */}
          {!isFree && !showSetupGuide ? (
             <ErrorBoundary>
                <StatsRow proAnalytics={proAnalytics} pendingOrdersCount={pendingOrdersCount} timeRangeLabel={getRevenueLabel()} />
             </ErrorBoundary>
          ) : !showSetupGuide && (
             // Fallback for Free plan users who finished setup
             <div className="mb-8">
                <ErrorBoundary><OverviewCard totalRevenue={proAnalytics.totalRevenue} totalOrders={proAnalytics.totalOrders} /></ErrorBoundary>
             </div>
          )}

          {/* 5. MAIN DASHBOARD GRID */}
          <div className={`grid gap-8 ${isFree ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
             
             {/* LEFT COLUMN - Only render if NOT free and NOT showing setup guide */}
             {!isFree && !showSetupGuide && (
               <div className="lg:col-span-2 md:col-span-2 space-y-8">
                  {isPro && (
                     <div className="card p-6 min-h-[400px]">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="font-bold text-gray-900 text-lg flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-primary-600"/> Revenue Trend</h3>
                        </div>
                        <div className="h-72 bg-white rounded-xl flex flex-col items-center justify-center overflow-hidden relative">
                           <ErrorBoundary>
                             {orders.length > 0 ? <RevenueChart orders={filteredOrders} days={chartDays} /> : (
                               <div className="text-center p-6 relative z-10">
                                  <div className="relative w-20 h-20 mx-auto mb-4"><div className="absolute inset-0 bg-indigo-100 rounded-full animate-ping opacity-75"></div><div className="relative w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 border border-indigo-100"><Rocket className="w-10 h-10 ml-1" /></div></div>
                                  <h4 className="text-lg font-bold text-gray-900">Ready for liftoff?</h4>
                                  <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">Your chart is waiting for your first sale.</p>
                               </div>
                             )}
                           </ErrorBoundary>
                        </div>
                     </div>
                  )}
                  <ErrorBoundary><TopProductsCard currentPlanId={currentPlanId} topProducts={topProducts} onOpenUpgradeModal={onOpenUpgradeModal}/></ErrorBoundary>
               </div>
             )}

             {/* RIGHT COLUMN (Always visible) */}
             <div className="space-y-8 md:col-span-2 lg:col-span-1">
                <ErrorBoundary><InventoryAlertCard products={products} currentPlanId={currentPlanId} onOpenUpgradeModal={onOpenUpgradeModal} /></ErrorBoundary>
                
                {!isFree && !showSetupGuide && (
                  <>
                    <ErrorBoundary><AiCoachCard currentPlanId={currentPlanId} onOpenUpgradeModal={onOpenUpgradeModal} topProducts={topProducts} orders={filteredOrders} /></ErrorBoundary>
                    <ErrorBoundary><SalesTargetCard store={store} totalRevenue={proAnalytics.totalRevenue} currentPlanId={currentPlanId} onOpenUpgradeModal={onOpenUpgradeModal} /></ErrorBoundary>
                  </>
                )}
             </div>
          </div>

          {/* 6. UPGRADE TEASER */}
          {!isPro && (
             <div className="mt-12">
                <ErrorBoundary><UpgradeTeaserWidget currentPlanId={currentPlanId} onOpenUpgradeModal={onOpenUpgradeModal} /></ErrorBoundary>
             </div>
          )}
        </motion.main>
      )}
      
      <SlideOver isOpen={showForm} onClose={handleDone} maxWidth="max-w-2xl">
        <ProductForm {...getProductFormProps()} />
      </SlideOver>
    </>
  );
}