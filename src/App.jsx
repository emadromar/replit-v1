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
import { AuthPage } from './components/auth/AuthPage.jsx';
import { LandingPage } from './LandingPage.jsx';
import { PricingPage } from './PricingPage.jsx';
import { FullScreenLoader } from './components/shared/FullScreenLoader.jsx';
import { PublicStorePage } from './PublicStorePage.jsx'; 
import { useFirebaseServices } from './contexts/FirebaseContext.jsx';
import { useNotifications } from './contexts/NotificationContext.jsx';
import { onSnapshot, doc } from 'firebase/firestore';
import { StoreSettingsForm } from './StoreSettingsForm.jsx';
import { MarketingPage } from './components/dashboard/MarketingPage.jsx';
// --- 1. IMPORT THE REAL UPGRADE MODAL ---
import { UpgradeModal } from './common/UpgradeModal.jsx';
import { ensureStoreExists } from './services/storeInitializer.js';

// --- LAZY LOADED DASHBOARD PAGES ---
const DashboardPage = lazy(() => import('./components/dashboard/DashboardPage.jsx').then(module => ({ default: module.DashboardPage })));
const ProductsPage = lazy(() => import('./ProductsPage.jsx').then(module => ({ default: module.ProductsPage })));
const OrdersPage = lazy(() => import('./OrdersPage.jsx').then(module => ({ default: module.OrdersPage })));
const SettingsPage = lazy(() => import('./SettingsPage.jsx').then(module => ({ default: module.SettingsPage })));
const ProfilePage = lazy(() => import('./ProfilePage.jsx').then(module => ({ default: module.ProfilePage })));
const BrandsPage = lazy(() => import('./BrandsPage.jsx').then(module => ({ default: module.BrandsPage })));
const AdminPage = lazy(() => import('./AdminPage.jsx').then(module => ({ default: module.AdminPage })));
const DashboardNav = lazy(() => import('./components/dashboard/DashboardNav.jsx').then(module => ({ default: module.DashboardNav })));


// --- A. PROTECTED ROUTE (NOW THE "PROP PROVIDER") ---
// --- 2. FIX: This component now accepts the REAL onOpenUpgradeModal function ---
function ProtectedRoute({ user, isAdmin, isAuthReady, onOpenUpgradeModal }) { 
  // Get all contexts
  const services = useFirebaseServices();
  const { showError, showSuccess, sendSystemNotification } = useNotifications();

  // Get store data
  const [store, setStore] = useState(null);
  const [loadingStore, setLoadingStore] = useState(true);

  // --- 3. DELETE THE BROKEN PLACEHOLDER ---
  // const onOpenUpgradeModal = () => { ... }; // <-- DELETED

  useEffect(() => {
    if (user && services.db) {
      setLoadingStore(true);
      const storeRef = doc(services.db, "stores", user.uid);
      const unsubscribe = onSnapshot(storeRef, async (docSnapshot) => {
        try {
          if (docSnapshot.exists()) {
            setStore({ id: docSnapshot.id, ...docSnapshot.data() });
          } else {
            // Store doesn't exist, create it
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

  // --- AUTH CHECKS ---
  if (!isAuthReady || loadingStore) {
    return <FullScreenLoader message="Loading..." />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // --- 4. PASS THE REAL onOpenUpgradeModal from props INTO the context ---
  return <Outlet context={{ 
    user, 
    isAdmin, 
    isAuthReady, 
    store, 
    services, 
    showError, 
    showSuccess, 
    sendSystemNotification, 
    onOpenUpgradeModal // <-- This is now the REAL function
  }} />; 
}

// --- B. ADMIN ROUTE (for Admin Panel) ---
function AdminRoute({ user, isAdmin, isAuthReady }) {
  if (!isAuthReady) {
    return <FullScreenLoader message="Loading..." />;
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

// --- C. PUBLIC STORE ROUTE ---
function StorePageWrapper() {
  return <PublicStorePage />;
}


// --- D. DASHBOARD LAYOUT (THE GATEKEEPER) ---
function DashboardLayout() { 

  // --- 1. GET ALL PROPS FROM THE PARENT ROUTE'S CONTEXT ---
  const { 
    user, store, services, showError, showSuccess, 
    sendSystemNotification, onOpenUpgradeModal, isAdmin 
  } = useOutletContext(); // <-- This now receives the REAL function

  // --- 2. THE CRITICAL FIX ---
  if (!store) {
    return <FullScreenLoader message="Loading Your Store..." />;
  }
  // --- END FIX ---

  // 3. RENDER THE LAYOUT + PASS CONTEXT TO CHILDREN
  return (
    // We must use a fragment <>...</> to render the Modal as a sibling
    <>
      <Suspense fallback={<FullScreenLoader message="Loading Page..." />}>
        <DashboardNav 
          store={store} 
          user={user} 
          db={services.db} 
          showError={showError} 
          showSuccess={showSuccess} 
          isAdmin={isAdmin}
          onOpenUpgradeModal={onOpenUpgradeModal} // Pass the real function to the nav
        />
        <main className="pb-24 md:pb-0">
          {/* This passes all props to the child route (OrdersPage, ProductsPage, etc.) */}
          <Outlet context={{ 
            user, store, services, showError, showSuccess, 
            sendSystemNotification, onOpenUpgradeModal, isAdmin 
          }} /> 
        </main>
      </Suspense>

      {/* This is where the modal should have been.
        But to get it to work, we must lift the state to AppContent.
        So we will REMOVE it from here.
      */}
    </>
  );
}



// --- E. MAIN APP CONTENT ---
// This is the TOP-LEVEL component that controls the modal
function AppContent() {
  // --- 1. Get props from their correct contexts ---
  const { user, isAdmin, isAuthReady } = useAuth();
  const services = useFirebaseServices();
  const { showError, showSuccess, sendSystemNotification } = useNotifications();
  const location = useLocation();
  const [store, setStore] = useState(null);

  // --- 2. DEFINE THE *REAL* MODAL STATE HERE ---
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const onOpenUpgradeModal = () => setIsUpgradeModalOpen(true);

  // --- 3. DELETE THE BROKEN PLACEHOLDER ---
  // const onOpenUpgradeModal = () => { ... }; // <-- DELETED

  useEffect(() => {
    if (user && services.db) {
      const storeRef = doc(services.db, "stores", user.uid);
      const unsubscribe = onSnapshot(storeRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          setStore({ id: docSnapshot.id, ...docSnapshot.data() });
        } else if (isAuthReady && !docSnapshot.exists() && location.pathname !== '/welcome' && location.pathname !== '/signup') {
          console.log("User logged in but no store document found.");
          setStore(null);
        }
      });
      return () => unsubscribe();
    } else {
      setStore(null); // Clear store if user logs out
    }
  }, [user, services.db, isAuthReady, location.pathname]);


  return (
    <>
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* --- Public Routes --- */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            {/* --- 4. PASS THE REAL FUNCTION to the pricing page --- */}
            <Route path="pricing" element={<PricingPage onOpenUpgradeModal={onOpenUpgradeModal} />} />
          </Route>

          {/* --- Auth Routes --- */}
          <Route 
            path="/login" 
            element={!user ? <AuthPage services={services} showError={showError} showSuccess={showSuccess} /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/signup" 
            element={!user ? <AuthPage services={services} showError={showError} showSuccess={showSuccess} /> : <Navigate to="/dashboard" replace />} 
          />

          {/* --- Admin Route --- */}
          <Route 
            path="/admin" 
            element={<AdminRoute user={user} isAdmin={isAdmin} isAuthReady={isAuthReady} />}
          >
            <Route 
              index 
              element={
                <Suspense fallback={<FullScreenLoader />}>
                  <AdminPage showError={showError} showSuccess={showSuccess} />
                </Suspense>
              } 
            />
          </Route>

          {/* --- Dashboard (Protected & Nested) --- */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute 
                user={user} 
                isAdmin={isAdmin} 
                isAuthReady={isAuthReady} 
                onOpenUpgradeModal={onOpenUpgradeModal} // <-- 5. PASS THE REAL FUNCTION
              />
            }
          >
            <Route element={<DashboardLayout />}>
              <Route index element={<Suspense fallback={<FullScreenLoader />}><DashboardPage /></Suspense>} />
              <Route path="products" element={<Suspense fallback={<FullScreenLoader />}><ProductsPage /></Suspense>} />
              <Route path="marketing" element={<Suspense fallback={<FullScreenLoader />}><MarketingPage /></Suspense>} />
              <Route path="orders" element={<Suspense fallback={<FullScreenLoader />}><OrdersPage /></Suspense>} />
              <Route path="brands" element={<Suspense fallback={<FullScreenLoader />}><BrandsPage /></Suspense>} />
              <Route path="settings" element={<Suspense fallback={<FullScreenLoader />}><SettingsPage /></Suspense>}>
                <Route path="general" element={<StoreSettingsForm />} />
                <Route path="profile" element={<Suspense fallback={<FullScreenLoader />}><ProfilePage /></Suspense>} />
                <Route index element={<Navigate to="general" replace />} />
              </Route>
              {isAdmin && ( <Route path="admin" element={<Suspense fallback={<FullScreenLoader />}><AdminPage /></Suspense>} /> )}
            </Route>
          </Route>

          {/* --- Store Slug (LAST) --- */}
          <Route path="/:storeSlug" element={<StorePageWrapper />} /> 

        </Routes>
      </AnimatePresence>

      {/* --- 6. RENDER THE REAL MODAL HERE (at the top level) --- */}
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

// --- F. PROVIDER WRAPPER ---
export default function App() {
  return (
    <FirebaseProvider>
      <NotificationProvider>
        <AuthProvider>
          <CartProvider>
            {/* The real Router is in main.jsx */}
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </NotificationProvider>
    </FirebaseProvider>
  );
}