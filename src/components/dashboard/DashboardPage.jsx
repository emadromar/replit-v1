// src/components/dashboard/DashboardPage.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, onSnapshot, query, orderBy, doc
} from 'firebase/firestore';
import {
  Package, Copy, Eye, AlertCircle, CheckCircle, Zap, TrendingUp, DollarSign,
  Info, Rocket, LayoutDashboard, AlertTriangle, Lock, Loader2,
  BarChart3, Sparkles, MessageSquare, ExternalLink, Check, X,
} from 'lucide-react';
import { PLAN_DETAILS } from '../../config.js';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import { RevenueChart } from '../../RevenueChart.jsx';
import { ProductImage } from '../../ProductImage.jsx';
import { LockedFeatureCard } from '../shared/LockedFeatureCard.jsx'; // <-- This is our refactor!
import { UpgradeTeaserWidget } from './UpgradeTeaserWidget.jsx';
import { useOutletContext } from 'react-router-dom';
import { SalesLeakDiagnostic } from './SalesLeakDiagnostic.jsx';

// +++ 1. IMPORT THE PRODUCT FORM WE CREATED +++
import { ProductForm } from './ProductForm.jsx'; 

//=================================================================
// 1. REUSABLE DASHBOARD COMPONENTS
//=================================================================
// ... (MetricCard, SetupGuide, StoreLinkCard, SubscriptionCard, SalesTargetCard, InventoryAlertCard, TopProductsCard, AiCoachCard, AnalyticsCard) ...
// ALL YOUR REUSABLE COMPONENTS STAY EXACTLY THE SAME.
// NO CHANGES NEEDED TO THEM.
// SCROLL PAST THEM...

/**
 * A reusable card for displaying key metrics.
 */
const MetricCard = ({ title, value, icon, color = 'primary' }) => {
  const Icon = icon || DollarSign;
  const colorClass = {
    primary: 'text-primary-700',
    green: 'text-alert-success',
    orange: 'text-alert-warning',
  }[color];
  
  const bgClass = {
    primary: 'bg-primary-50',
    green: 'bg-green-50',
    orange: 'bg-orange-50',
  }[color];

  return (
    <div className={`card p-4 sm:p-5 ${bgClass}`}>
      <div className="flex items-center">
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-white`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <div className="ml-3 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{value}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * The new Setup Guide, now with Framer Motion.
 */
const SetupGuide = ({ store, products, onOpenUpgradeModal }) => {
  const [tasks, setTasks] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const currentPlanId = store?.planId || 'free';

  useEffect(() => {
    const newTasks = [
      { id: 'products', title: 'Add your first product', isComplete: products.length > 0, href: '/products', plan: 'free' },
      { id: 'theme', title: 'Choose your theme color', isComplete: store.themeColor !== '#6D28D9', href: '/settings/general', plan: 'basic' },
      { id: 'logo', title: 'Upload your store logo', isComplete: !!store.logoUrl, href: '/settings/general', plan: 'basic' },
    ];
    setTasks(newTasks);
  }, [store, products]);

  const completedTasks = tasks.filter((task) => task.isComplete).length;
  const isAllComplete = completedTasks === tasks.length;
  const progressPercent = (completedTasks / tasks.length) * 100;

  if (isAllComplete) {
    return null; // Hide when all tasks are done
  }

  const renderTask = (task) => {
    const isLocked = (task.plan === 'basic' && currentPlanId === 'free');
    
    const content = (
      <div className="flex items-center flex-1 min-w-0">
        <motion.div 
          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
            task.isComplete ? 'bg-primary-700 border-primary-700' : 'bg-white border-gray-300'
          }`}
          layout
        >
          {task.isComplete && <Check className="w-4 h-4 text-white" />}
        </motion.div>
        <span className={`ml-3 text-sm font-medium ${task.isComplete ? 'text-gray-500 line-through' : 'text-gray-800'} truncate`}>
          {task.title}
        </span>
        {isLocked && !task.isComplete && (
          <span 
            className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-subscription-basic/10 text-subscription-basic flex items-center flex-shrink-0"
          >
            <Lock className="w-3 h-3 mr-1" /> Basic
          </span>
        )}
      </div>
    );
    
    if (isLocked && !task.isComplete) {
      return (
        <button 
          onClick={(e) => { e.preventDefault(); onOpenUpgradeModal(); }}
          className="flex items-center w-full p-3 rounded-lg bg-gray-50 border border-gray-200 transition-all duration-150 hover:border-primary-300 cursor-pointer"
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        to={task.href}
        className={`flex items-center w-full p-3 rounded-lg transition-all duration-150 ${
          task.isComplete ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200 hover:bg-gray-50'
        }`}
      >
        {content}
        {!task.isComplete && !isLocked && (
            <span className="ml-auto text-xs font-semibold text-primary-600">Start →</span>
        )}
      </Link>
    );
  };

  return (
    <motion.div 
      className="card p-6 col-span-1 lg:col-span-2"
      layout // Framer Motion will animate layout changes
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <Rocket className="w-5 h-5 mr-2 text-primary-700" />
          Your Setup Guide
        </h2>
        <span className="text-sm font-semibold text-gray-500">
          {completedTasks}/{tasks.length} Complete
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2 mb-4">
        Complete these steps to get your store ready for customers.
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-5">
        <motion.div
          className="bg-primary-700 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {tasks.map((task) => (
          <li key={task.id}>
            {renderTask(task)}
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

const StoreLinkCard = ({ storeUrl, customPath, onOpenUpgradeModal, currentPlanId }) => {
  const [copied, setCopied] = useState(false);
  const { showSuccess } = useNotifications();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(storeUrl).then(() => {
      setCopied(true);
      showSuccess("Store link copied!");
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const canUseCustomPath = currentPlanId === 'pro';

  return (
    <motion.div 
      className="card p-6"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Your Public Store Link</h2>
      
      {!canUseCustomPath && (
        <div className="flex items-start text-sm mb-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
          <Info className="w-5 h-5 text-primary-700 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-primary-800">
            Upgrade to Pro for a custom store path (e.g., /my-store).
            <button onClick={onOpenUpgradeModal} className="ml-1 font-semibold underline">Upgrade Now</button>
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          readOnly
          value={storeUrl}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none font-mono text-sm"
        />
        <button
          onClick={copyToClipboard}
          className={`flex items-center justify-center px-4 py-2 rounded-lg shadow-sm w-full sm:w-auto transition-all duration-150 ${
            copied
              ? 'bg-alert-success hover:bg-green-700'
              : 'bg-primary-700 hover:bg-primary-800'
          } text-white font-medium`}
        >
          {copied ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <a
          href={storeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto transition-colors font-medium"
        >
          <ExternalLink className="w-4 h-4 mr-2 text-gray-500" />
          Preview
        </a>
      </div>
    </motion.div>
  );
};

const SubscriptionCard = ({ currentPlanId, planDetails, subscriptionEndDate, isSubscriptionActive, onOpenUpgradeModal }) => {
  const planColorClass = {
    free: 'text-subscription-free',
    basic: 'text-subscription-basic',
    pro: 'text-subscription-pro',
  }[currentPlanId];
  
  const expiryText = !isSubscriptionActive 
    ? `Expired on: ${subscriptionEndDate?.toLocaleDateString() || 'N/A'}` 
    : `Renews on: ${subscriptionEndDate?.toLocaleDateString() || 'N/A'}`;

  return (
    <motion.div 
      className="card p-6"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Subscription</h2>
      
      <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase ${planColorClass} bg-white border-2 border-current`}>
            {planDetails.name}
          </span>
      </div>

      <div className="mb-4 space-y-1">
        {currentPlanId !== 'free' && (
          <p className={`text-sm font-medium ${isSubscriptionActive ? 'text-gray-600' : 'text-alert-error'}`}>
            {expiryText}
          </p>
        )}
        {currentPlanId === 'free' && (
            <p className="text-sm text-gray-500">
              Upgrade to unlock powerful features.
            </p>
        )}
      </div>

      <button
        onClick={onOpenUpgradeModal}
        className="w-full px-4 py-2 bg-primary-700 text-white font-semibold rounded-lg shadow-sm hover:bg-primary-800 transition-colors duration-150"
      >
        {currentPlanId === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
      </button>
    </motion.div>
  );
};

const SalesTargetCard = ({ store, totalRevenue, onOpenUpgradeModal, currentPlanId }) => {
  const hasBasic = currentPlanId === 'basic' || currentPlanId === 'pro';

  if (!hasBasic) {
    return (
      <LockedFeatureCard
        title="Sales Target"
        description="Set monthly goals to visually track your revenue progress."
        icon={Zap}
        planName="Basic"
        onUpgrade={onOpenUpgradeModal}
      />
    );
  }

  const target = store?.monthlyTarget || 0;
  const revenue = parseFloat(totalRevenue) || 0;
  const percentage = target > 0 ? Math.min(100, (revenue / target) * 100) : 0;

  return (
    <motion.div 
      className="card card-hover p-6 flex flex-col justify-between"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Sales Target</h2>
        {target > 0 ? (
          <>
            <p className="text-3xl font-bold text-gray-900">
              JOD {revenue.toFixed(2)}
            </p>
            <p className="text-sm font-medium text-gray-500">
              of {`JOD ${target.toFixed(2)}`} goal
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <motion.div
                className="bg-alert-success h-2.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            <div className="flex justify-between text-xs font-semibold text-gray-500 mt-1">
              <span>0%</span>
              <span>{percentage.toFixed(0)}%</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            Set a monthly goal to track your sales progress.
          </p>
        )}
      </div>
      <Link
        to="/settings/general"
        className="mt-4 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors self-start"
      >
        {target > 0 ? 'Adjust Target →' : 'Set Monthly Target →'}
      </Link>
    </motion.div>
  );
};

const InventoryAlertCard = ({ products, onOpenUpgradeModal, currentPlanId }) => {
  const hasBasic = currentPlanId === 'basic' || currentPlanId === 'pro';

  if (!hasBasic) {
    return (
      <LockedFeatureCard
        title="Inventory Alerts"
        description="Get instant alerts when your products are running low."
        icon={AlertTriangle}
        planName="Basic"
        onUpgrade={onOpenUpgradeModal}
      />
    );
  }

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= 5);
  }, [products]);

  if (lowStockProducts.length === 0) {
    return (
      <motion.div 
        className="card p-6 flex flex-col justify-center"
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-green-50">
            <CheckCircle className="w-5 h-5 text-alert-success" />
          </div>
          <div className="ml-4">
            <p className="text-lg font-semibold text-gray-900">Stock Levels Good</p>
            <p className="text-sm text-gray-500">All products are well-stocked.</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="card p-6 bg-orange-50 border-2 border-alert-warning"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2 text-alert-warning" />
        Low Stock Warning
      </h2>
      <p className="text-sm text-gray-600 mt-2 mb-4">
        You have <strong className="text-alert-warning">{lowStockProducts.length} product(s)</strong> running low.
      </p>
      <ul className="space-y-2 max-h-24 overflow-y-auto pr-2">
        {lowStockProducts.map((p) => (
          <li key={p.id} className="flex justify-between items-center text-sm">
            <span className="font-medium text-gray-700 truncate" title={p.name}>
              {p.name}
            </span>
            <span className="font-bold text-alert-warning ml-2 flex-shrink-0">
              {p.stock} left
            </span>
          </li>
        ))}
      </ul>
      <Link
        to="/products"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-alert-warning px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-orange-600"
      >
        Restock Now →
      </Link>
    </motion.div>
  );
};

function TopProductsCard({ topProducts, onOpenUpgradeModal, currentPlanId }) {
  const hasPro = currentPlanId === 'pro';

  if (!hasPro) {
    return (
      <LockedFeatureCard
        title="Top Selling Products"
        description="See your best-performing products at a glance."
        icon={BarChart3}
        planName="Pro"
        onUpgrade={onOpenUpgradeModal}
      />
    );
  }

  if (topProducts.length === 0) {
    return (
      <motion.div 
        className="card p-6 flex flex-col justify-center h-full min-h-[300px]"
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <BarChart3 className="w-10 h-10 mx-auto text-gray-400 mb-3"/>
        <h3 className="text-lg font-semibold mb-1 text-gray-900 text-center">
            No Sales Data
        </h3>
        <p className="text-sm text-gray-500 text-center">
            Analytics are based on **completed orders**.
        </p>
      </motion.div>
    );
  }
    
  return (
    <motion.div 
      className="card p-6"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2 text-primary-700"/> Top Selling Products
      </h3>
      <ul className="space-y-4">
        {topProducts.map((product, index) => (
          <li key={product.id} className="flex items-center space-x-3 border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
            <span className="text-xl font-bold text-primary-700 w-6 flex-shrink-0">
              {index + 1}.
            </span>
            <ProductImage 
              src={product.imageUrl} 
              alt={product.name} 
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100" 
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 truncate text-sm" title={product.name}>{product.name}</p>
              <div className="flex justify-between text-xs text-gray-500 mt-0.5">
                <span className='text-primary-700'>Sold: <strong>{product.salesCount}</strong> units</span>
                <span className='text-alert-success'>Revenue: <strong>JOD {product.totalRevenue.toFixed(2)}</strong></span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

const AiCoachCard = ({ onOpenUpgradeModal, currentPlanId, topProducts }) => {
  const hasPro = currentPlanId === 'pro';

  if (!hasPro) {
    return (
      <LockedFeatureCard
        title="AI Sales Coach"
        description="Unlock smart, conversational insights and suggestions."
        icon={MessageSquare}
        planName="Pro"
        onUpgrade={onOpenUpgradeModal}
      />
    );
  }
  
  const lowStockProduct = topProducts.find(p => p.salesCount > 0 && p.stock < 5);
  const insightMessage = lowStockProduct 
    ? `Your top-selling product, **${lowStockProduct.name}**, is critically low with **${lowStockProduct.stock} units** left. RESTOCK URGENTLY!`
    : "Everything looks stable! Your sales are trending up 5% this week. Keep running that social media campaign.";

  return (
    <motion.div 
      className="card p-6 relative bg-ai-light border border-ai/20 overflow-hidden"
      whileHover={{ y: -5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <h2 className="text-lg font-semibold text-gray-900 flex items-center">
        <Sparkles className="w-5 h-5 mr-2 text-ai" />
        AI Sales Coach
      </h2>
      
      <div className="mt-4 space-y-3">
        <div className="flex items-start">
          <div className="w-8 h-8 rounded-full bg-ai flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white"/>
          </div>
          <div className="ml-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 relative">
              <p className="text-sm text-gray-800" dangerouslySetInnerHTML={{ __html: insightMessage.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        </div>
        
        <div className='ml-11'>
            <button className="text-xs font-semibold text-primary-700 hover:underline">
                View More Insights →
            </button>
        </div>
      </div>
    </motion.div>
  );
};

const AnalyticsCard = ({ currentPlanId, orders, proAnalytics, onOpenUpgradeModal }) => {
  const hasPro = currentPlanId === 'pro';

  if (!hasPro) {
      return (
            <LockedFeatureCard
              title="Advanced Analytics"
              description="Unlock detailed sales metrics, revenue charts, and average order value data."
              icon={TrendingUp}
              planName="Pro"
              onUpgrade={onOpenUpgradeModal}
            />
      );
  }
  
  return (
      <motion.div 
        className="card p-6"
        whileHover={{ y: -5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary-700" />
            Sales Analytics
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-b border-gray-100 pb-4 mb-4">
            <MetricCard title="Pending Revenue" value={`JOD ${proAnalytics.pendingRevenue}`} icon={AlertCircle} color="orange" />
            <MetricCard title="Total Revenue" value={`JOD ${proAnalytics.totalRevenue}`} icon={DollarSign} color="green" />
            <MetricCard title="Total Orders" value={proAnalytics.totalOrders} icon={Package} color="primary" />
            <MetricCard title="Avg. Order Value" value={`JOD ${proAnalytics.averageOrderValue}`} icon={DollarSign} color="primary" />
        </div>
        
        <div className="mt-4 h-[350px]">
            <RevenueChart orders={orders} />
        </div>
      </motion.div>
  );
};


//=================================================================
// 4. MAIN DASHBOARD PAGE COMPONENT
//=================================================================


// ...
export function DashboardPage() {
  const { 
    user, store, services, showError, showSuccess, 
    sendSystemNotification, onOpenUpgradeModal 
  } = useOutletContext();
  const { db, storage, functions } = services; // <-- Need storage & functions
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  // +++ 2. ADD MODAL STATE AND CATEGORY/BRAND STATE +++
  const [loading, setLoading] = useState(true);
  const [showFirstProductModal, setShowFirstProductModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  
  // --- This is the prop getter for ProductForm ---
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
      product: null, // This modal is only for *new* products
      onDone: () => setShowFirstProductModal(false), // This closes the modal
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

  // Fetch orders
  useEffect(() => {
    if (!user) return;
    const ordersRef = collection(db, 'stores', user.uid, 'orders');
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        setOrders(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
        console.error('Orders listener error:', error);
        showError('Failed to load orders.');
    });
    return () => unsubscribe();
  }, [store, db, showError]);

  // Fetch products, categories, and brands
  useEffect(() => {
    if (!store) return;
    setLoading(true);
    
    // 1. Products
    const productsRef = collection(db, 'stores', store.id, 'products');
    const qProducts = query(productsRef);
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
        const fetchedProducts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
        
        // +++ 3. ADD ONBOARDING LOGIC +++
        // Only show modal if products finish loading and there are 0
        if (fetchedProducts.length === 0) {
          setShowFirstProductModal(true);
        }
        
        setLoading(false); // Set loading false after products are loaded
    }, (error) => {
        console.error('Products listener error:', error);
        showError('Failed to load products for dashboard.');
        setLoading(false);
    });

    // 2. Categories
    const categoriesRef = collection(db, 'stores', store.id, 'categories');
    const qCategories = query(categoriesRef, orderBy('name'));
    const unsubCategories = onSnapshot(qCategories, (snapshot) => {
        setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error('Categories listener error:', error));

    // 3. Brands
    const brandsRef = collection(db, 'stores', store.id, 'brands');
    const qBrands = query(brandsRef, orderBy('name'));
    const unsubBrands = onSnapshot(qBrands, (snapshot) => {
        setBrands(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }, (error) => console.error('Brands listener error:', error));

    return () => {
      unsubProducts();
      unsubCategories();
      unsubBrands();
    };
  }, [store, db, showError]); // End of data-fetching useEffect

  // --- Analytics Calculation (Unchanged) ---
  const proAnalytics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const pendingRevenue = orders
        .filter(order => (order.status || 'PENDING') === 'PENDING')
        .reduce((sum, order) => sum + (order.total || 0), 0);
    return { 
        totalRevenue: totalRevenue.toFixed(2), 
        totalOrders, 
        averageOrderValue: averageOrderValue.toFixed(2),
        pendingRevenue: pendingRevenue.toFixed(2)
    };
  }, [orders]);
  
  // --- Top Products (Unchanged) ---
  const topProducts = useMemo(() => {
    const salesMap = new Map();
    orders.filter((order) => order.status === 'COMPLETED').forEach((order) => {
        order.items.forEach((item) => {
            const productId = item.id;
            const quantity = item.quantity || 0;
            const revenue = (item.price || 0) * quantity;
            const productData = products.find(p => p.id === productId);
            const stock = productData?.stock ?? 0; 

            const currentData = salesMap.get(productId) || { 
              id: productId, 
              name: item.name, 
              salesCount: 0, 
              totalRevenue: 0, 
              imageUrl: item.imageUrl, 
              stock: stock 
            };
            currentData.salesCount += quantity;
            currentData.totalRevenue += revenue;
            salesMap.set(productId, currentData);
        });
    });
    const sortedProducts = Array.from(salesMap.values()).sort((a, b) => b.salesCount - a.salesCount);
    return sortedProducts.slice(0, 5);
  }, [orders, products]);

  // --- Loading State ---
  if (!store || loading) { 
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="w-12 h-12 animate-spin text-primary-700" />
        <span className="mt-4 text-xl font-semibold text-primary-700">
          Loading dashboard...
        </span>
      </div>
    );
  }

  // --- Main Props & Plan Logic (Unchanged) ---
  const currentPlanId = store?.planId || 'free';
  const currentPlanDetails = PLAN_DETAILS[currentPlanId];
  const isOnboardingComplete = products.length > 0 && (store.logoUrl || currentPlanId !== 'free');
  const subscriptionEndDate = store?.subscriptionEnds?.toDate();
  const isSubscriptionActive = subscriptionEndDate ? subscriptionEndDate > new Date() : currentPlanId === 'free';
  const defaultSlug = store?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || user.uid;
  const storeUrl = `${window.location.origin}/${store?.customPath || defaultSlug}`;

  // --- Main Dashboard Layout ---
  return (
    <>
      <AnimatePresence>
        {/* +++ 4. RENDER THE ONBOARDING MODAL +++ */}
        {showFirstProductModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Rocket className="w-6 h-6 mr-3 text-primary-700" />
                  Welcome to Your New Store!
                </h2>
                <p className="mt-1 text-gray-600">
                  Let's add your first product to get started. You can add more later.
                </p>
              </div>
              <div className="p-6 overflow-y-auto">
                <ProductForm {...getProductFormProps()} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* +++ 5. HIDE THE DASHBOARD IF MODAL IS OPEN +++ */}
      <AnimatePresence>
        {!showFirstProductModal && (
          <motion.main 
            className="max-w-screen-2xl mx-auto p-4 md:p-8 space-y-6 pb-24 md:pb-8"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { staggerChildren: 0.05, delayChildren: 0.1 }
              }
            }}
          >
            
            {/* --- Section 1: Setup Guide (if needed) --- */}
            {!isOnboardingComplete && (
              <AnimatePresence>
                <SetupGuide 
                    store={store} 
                    products={products} 
                    onOpenUpgradeModal={onOpenUpgradeModal}
                />
              </AnimatePresence>
            )}

            {/* --- Section 2: Main Grid (Content & Sidebar) --- */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
              
              {/* --- Main Content Column --- */}
              <div className="lg:col-span-2 space-y-6">
                <AnalyticsCard 
                  currentPlanId={currentPlanId}
                  orders={orders}
                  proAnalytics={proAnalytics}
                  onOpenUpgradeModal={onOpenUpgradeModal}
                />
                <AiCoachCard 
                  currentPlanId={currentPlanId} 
                  onOpenUpgradeModal={onOpenUpgradeModal} 
                  topProducts={topProducts}
                />
                <TopProductsCard 
                  currentPlanId={currentPlanId}
                  topProducts={topProducts}
                  onOpenUpgradeModal={onOpenUpgradeModal}
                />
              </div>

              {/* --- Sidebar Column --- */}
              <div className="lg:col-span-1 space-y-6">
                <StoreLinkCard 
                  storeUrl={storeUrl} 
                  customPath={store?.customPath}
                  currentPlanId={currentPlanId}
                  onOpenUpgradeModal={onOpenUpgradeModal}
                />
                <SubscriptionCard
                  currentPlanId={currentPlanId}
                  planDetails={currentPlanDetails}
                  subscriptionEndDate={subscriptionEndDate}
                  isSubscriptionActive={isSubscriptionActive}
                  onOpenUpgradeModal={onOpenUpgradeModal}
                />

                {currentPlanId === 'free' ? (
  <SalesLeakDiagnostic 
    onUpgrade={onOpenUpgradeModal} 
    orders={orders}
    products={products}
  />
) : currentPlanId === 'basic' ? (
  <UpgradeTeaserWidget 
    planName="Pro"
    onUpgrade={onOpenUpgradeModal}
  />
) : null}

                <SalesTargetCard
                    store={store}
                    totalRevenue={proAnalytics.totalRevenue}
                    currentPlanId={currentPlanId}
                    onOpenUpgradeModal={onOpenUpgradeModal}
                />
                <InventoryAlertCard 
                  products={products} 
                  currentPlanId={currentPlanId} 
                  onOpenUpgradeModal={onOpenUpgradeModal} 
                />
              </div>
            </div>
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
}