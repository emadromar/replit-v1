// src/App.jsx

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Outlet, Navigate, Route, Routes, useLocation, useOutletContext } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

// --- CONTEXTS ---
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { FirebaseProvider } from './contexts/FirebaseContext.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import { CartProvider } from './contexts/CartContext.jsx';

// --- CORE PAGES & COMPONENTS ---
import { PublicLayout } from './components/layout/PublicLayout.jsx'; 
import { FullScreenLoader } from './components/shared/FullScreenLoader.jsx';
import { useFirebaseServices } from './contexts/FirebaseContext.jsx';
import { useNotifications } from './contexts/NotificationContext.jsx';
import { onSnapshot, doc } from 'firebase/firestore';
import { UpgradeModal } from './common/UpgradeModal.jsx';
import { ensureStoreExists } from './services/storeInitializer.js';

// --- NEW: Updated Imports for Pages in src/pages/ ---
import { AuthPage } from './pages/AuthPage.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { PricingPage } from './pages/PricingPage.jsx';
import { PublicStorePage } from './pages/PublicStorePage.jsx'; 

// --- LAZY LOADED DASHBOARD PAGES (Updated Paths) ---
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx').then(module => ({ default: module.DashboardPage })));
const ProductsPage = lazy(() => import('./pages/ProductsPage.jsx').then(module => ({ default: module.ProductsPage })));
const OrdersPage = lazy(() => import('./pages/OrdersPage.jsx').then(module => ({ default: module.OrdersPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx').then(module => ({ default: module.SettingsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx').then(module => ({ default: module.ProfilePage })));
const BrandsPage = lazy(() => import('./pages/BrandsPage.jsx').then(module => ({ default: module.BrandsPage })));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx').then(module => ({ default: module.AdminPage })));
const MarketingPage = lazy(() => import('./pages/MarketingPage.jsx').then(module => ({ default: module.MarketingPage })));

// --- Components still in src/ or src/components ---
const DashboardNav = lazy(() => import('./components/dashboard/DashboardNav.jsx').then(module => ({ default: module.DashboardNav })));
// StoreSettingsForm is acting as a sub-page, keeping it in src root for now as per existing structure
const StoreSettingsForm = lazy(() => import('./StoreSettingsForm.jsx').then(module => ({ default: module.StoreSettingsForm })));


// --- A. PROTECTED ROUTE ---
function ProtectedRoute({ user, isAdmin, isAuthReady, onOpenUpgradeModal }) { 
  const services = useFirebaseServices();
  const { showError, showSuccess, sendSystemNotification } = useNotifications();
  const [store, setStore] = useState(null);
  const [loadingStore, setLoadingStore] = useState(true);

  useEffect(() => {
    if (user && services.db) {
      setLoadingStore(true);
      const storeRef = doc(services.db, "stores", user.uid);
      const unsubscribe = onSnapshot(storeRef, async (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            setStore({ id: docSnapshot.id, ...docSnapshot.data() });
          } else {
            const newStore = await ensureStoreExists(services.db, user);
            setStore(newStore);
          }
          setLoadingStore(false);
        } catch (error) {
          console.error('Error handling store:', error);
          showError('Failed to load store. Please try again.');
          setLoadingStore(false);
        }
      });
      return () => unsubscribe();
    } else if (!user) {
      setStore(null);
      setLoadingStore(false);
    }
  }, [user, services.db, showError]);

  if (!isAuthReady || loadingStore) {
    return <FullScreenLoader message="Loading..." />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ 
    user, isAdmin, isAuthReady, store, services, 
    showError, showSuccess, sendSystemNotification, onOpenUpgradeModal 
  }} />; 
}

// --- B. ADMIN ROUTE ---
function AdminRoute({ user, isAdmin, isAuthReady }) {
  if (!isAuthReady) return <FullScreenLoader message="Loading..." />;
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// --- C. PUBLIC STORE ROUTE ---
function StorePageWrapper() {
  return <PublicStorePage />;
}

// --- D. DASHBOARD LAYOUT ---
function DashboardLayout() { 
  const { user, store, services, showError, showSuccess, sendSystemNotification, onOpenUpgradeModal, isAdmin } = useOutletContext();

  if (!store) {
    return <FullScreenLoader message="Loading Your Store..." />;
  }

  return (
    <>
      <Suspense fallback={<FullScreenLoader message="Loading Page..." />}>
        <DashboardNav 
          store={store} user={user} db={services.db} 
          showError={showError} showSuccess={showSuccess} isAdmin={isAdmin}
          onOpenUpgradeModal={onOpenUpgradeModal} 
        />
        <main className="pb-24 md:pb-0">
          <Outlet context={{ 
            user, store, services, showError, showSuccess, 
            sendSystemNotification, onOpenUpgradeModal, isAdmin 
          }} /> 
        </main>
      </Suspense>
    </>
  );
}

// --- E. MAIN APP CONTENT ---
function AppContent() {
  const { user, isAdmin, isAuthReady } = useAuth();
  const services = useFirebaseServices();
  const { showError, showSuccess, sendSystemNotification } = useNotifications();
  const location = useLocation();
  const [store, setStore] = useState(null);

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const onOpenUpgradeModal = () => setIsUpgradeModalOpen(true);

  useEffect(() => {
    if (user && services.db) {
      const storeRef = doc(services.db, "stores", user.uid);
      const unsubscribe = onSnapshot(storeRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          setStore({ id: docSnapshot.id, ...docSnapshot.data() });
        } else if (isAuthReady && !docSnapshot.exists() && location.pathname !== '/welcome' && location.pathname !== '/signup') {
          setStore(null);
        }
      });
      return () => unsubscribe();
    } else {
      setStore(null);
    }
  }, [user, services.db, isAuthReady, location.pathname]);

  return (
    <>
      {/* FIX: Position changed to top-center to avoid mobile nav collision */}
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="pricing" element={<PricingPage onOpenUpgradeModal={onOpenUpgradeModal} />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={!user ? <AuthPage services={services} showError={showError} showSuccess={showSuccess} /> : <Navigate to="/dashboard" replace />} />
          <Route path="/signup" element={!user ? <AuthPage services={services} showError={showError} showSuccess={showSuccess} /> : <Navigate to="/dashboard" replace />} />

          {/* Admin Route */}
          <Route path="/admin" element={<AdminRoute user={user} isAdmin={isAdmin} isAuthReady={isAuthReady} />}>
            <Route index element={<Suspense fallback={<FullScreenLoader />}><AdminPage showError={showError} showSuccess={showSuccess} /></Suspense>} />
          </Route>

          {/* Dashboard (Protected & Nested) */}
          <Route path="/dashboard" element={<ProtectedRoute user={user} isAdmin={isAdmin} isAuthReady={isAuthReady} onOpenUpgradeModal={onOpenUpgradeModal} />}>
            <Route element={<DashboardLayout />}>
              <Route index element={<Suspense fallback={<FullScreenLoader />}><DashboardPage /></Suspense>} />
              <Route path="products" element={<Suspense fallback={<FullScreenLoader />}><ProductsPage /></Suspense>} />
              <Route path="marketing" element={<Suspense fallback={<FullScreenLoader />}><MarketingPage /></Suspense>} />
              <Route path="orders" element={<Suspense fallback={<FullScreenLoader />}><OrdersPage /></Suspense>} />
              <Route path="brands" element={<Suspense fallback={<FullScreenLoader />}><BrandsPage /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<FullScreenLoader />}><SettingsPage /></Suspense>}>
                <Route path="general" element={<Suspense fallback={<FullScreenLoader />}><StoreSettingsForm /></Suspense>} />
                <Route path="profile" element={<Suspense fallback={<FullScreenLoader />}><ProfilePage /></Suspense>} />
                <Route index element={<Navigate to="general" replace />} />
              </Route>
              {isAdmin && ( <Route path="admin" element={<Suspense fallback={<FullScreenLoader />}><AdminPage /></Suspense>} /> )}
            </Route>
          </Route>

          {/* Store Slug (LAST) */}
          <Route path="/:storeSlug" element={<StorePageWrapper />} /> 

        </Routes>
      </AnimatePresence>

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        currentPlanId={store?.planId || 'free'}
        storeId={user?.uid}
        db={services.db}
        storage={services.storage}
        showError={showError}
        showSuccess={showSuccess}
        storeEmail={user?.email}
        sendSystemNotification={sendSystemNotification}
      />
    </>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </FirebaseProvider>
  );
}