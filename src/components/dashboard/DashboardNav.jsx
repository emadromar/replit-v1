// src/components/dashboard/DashboardNav.jsx

import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAuth, signOut } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import {
  LayoutDashboard, LogOut, Bell, User, Globe, Settings, Package, ShoppingBag,
  TrendingUp, Percent, Plus, X, Shield
} from 'lucide-react';
import { ProductImage } from '../../ProductImage.jsx';
import { PLAN_DETAILS } from '../../config.js';
import { AnimatePresence, motion } from 'framer-motion';

// --- Desktop Nav Link ---
const AppNavLink = ({ to, children }) => {
  return (
    <a
      href={to}
      className="group relative flex items-center px-4 py-2 mx-1 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-all duration-200"
    >
      {children}
    </a>
  );
};

// --- Mobile Nav Link ---
const MobileNavLink = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    end
    className={({ isActive }) =>
      `flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${isActive ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
      }`
    }
  >
    <Icon className="w-6 h-6" />
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </NavLink>
);

export function DashboardNav({ store, user, db, showError, showSuccess, isAdmin }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLanguage = i18n.language;
  const currentPlan = store?.planId || 'free';
  const planDetails = PLAN_DETAILS[currentPlan];

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const [notifications, setNotifications] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const auth = getAuth();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveDropdown(null);
      setIsMobileMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const notificationsRef = collection(db, "stores", user.uid, "notifications");
    const q = query(notificationsRef, orderBy("createdAt", "desc"), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Notification listener error:", error);
    });

    return () => unsubscribe();
  }, [user, db]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleMarkAllRead = async () => {
    if (!db || !user || unreadCount === 0) return;
    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        if (!n.read) {
          const docRef = doc(db, "stores", user.uid, "notifications", n.id);
          batch.update(docRef, { read: true });
        }
      });
      await batch.commit();
      showSuccess("Notifications marked as read.");
    } catch (error) {
      showError("Could not mark notifications as read.");
    }
  };

  const toggleDropdown = (name, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const planColorClass = {
    free: 'text-subscription-free',
    basic: 'text-subscription-basic',
    pro: 'text-subscription-pro',
  }[currentPlan];

  const planBgClass = {
    free: 'bg-subscription-free/10',
    basic: 'bg-subscription-basic/10',
    pro: 'bg-subscription-pro/10',
  }[currentPlan];


  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-nav">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">

            {/* Left Side: Store Name & Plan */}
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0 group">
                <ProductImage
                  src={store?.logoUrl}
                  alt={store?.name || 'Store'}
                  className="h-9 w-9 rounded-lg object-contain bg-gray-50 p-1 border border-gray-200 group-hover:border-primary-300 transition-colors"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-none">{store?.name || 'WebJor Store'}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-0.5">
                    <span className={`px-1.5 py-0.5 rounded ${planBgClass} ${planColorClass}`}>{planDetails.name} Plan</span>
                  </p>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              <AppNavLink to="/dashboard"><LayoutDashboard className="w-4 h-4 mr-2" />Dashboard</AppNavLink>
              <AppNavLink to="/dashboard/orders"><ShoppingBag className="w-4 h-4 mr-2" />Orders</AppNavLink>
              <AppNavLink to="/dashboard/products"><Package className="w-4 h-4 mr-2" />Products</AppNavLink>
              <AppNavLink to="/dashboard/marketing"><Percent className="w-4 h-4 mr-2" />Marketing</AppNavLink>
              <AppNavLink to="/dashboard/brands"><TrendingUp className="w-4 h-4 mr-2" />Brands</AppNavLink>
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button onClick={toggleLanguage} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 transition-colors" title="Change language">
                <Globe className="w-5 h-5" />
              </button>

              {/* Notification Bell */}
              <div className="relative">
                <button onClick={(e) => toggleDropdown('notifications', e)} className={`p-2 rounded-full transition-colors ${activeDropdown === 'notifications' ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}>
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
                </button>

                {activeDropdown === 'notifications' && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="p-3 flex justify-between items-center border-b bg-gray-50/50">
                      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Notifications</h3>
                      {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:underline font-medium">Mark read</button>}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No new alerts</div>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-3 border-b last:border-0 text-sm hover:bg-gray-50 transition-colors ${n.read ? 'opacity-60' : 'bg-primary-50/30'}`}>
                            <p className="text-gray-800 leading-snug">{n.message}</p>
                            <p className="text-xs mt-1 text-gray-400">{n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button onClick={(e) => toggleDropdown('profile', e)} className={`flex items-center justify-center h-9 w-9 rounded-full transition-all border-2 ${activeDropdown === 'profile' ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-gray-100 hover:border-gray-300'}`}>
                  <User className="w-5 h-5 text-gray-600" />
                </button>

                {activeDropdown === 'profile' && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-dropdown" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 border-b bg-gray-50/50">
                      <p className="text-xs font-bold text-gray-500 uppercase">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link to="/dashboard/settings/profile" onClick={() => setActiveDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        <User className="w-4 h-4 mr-3 text-gray-400" /> Profile
                      </Link>
                      <Link to="/dashboard/settings/general" onClick={() => setActiveDropdown(null)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600">
                        <Settings className="w-4 h-4 mr-3 text-gray-400" /> Store Settings
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setActiveDropdown(null)} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                          <Shield className="w-4 h-4 mr-3" /> Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-100 p-1">
                      <button onClick={handleSignOut} className="flex w-full items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-red-600 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4 mr-3" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* --- MOBILE NAVIGATION (Thumb Zone Optimized) --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-nav pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-end h-[60px] pb-1">
          <MobileNavLink to="/dashboard" icon={LayoutDashboard} label="Home" />
          <MobileNavLink to="/dashboard/orders" icon={ShoppingBag} label="Orders" />

          {/* CENTRAL FAB */}
          <div className="relative -top-5">
            <button
              onClick={toggleMobileMenu}
              className={`w-14 h-14 rounded-full shadow-primary flex items-center justify-center transition-transform active:scale-95 ${isMobileMenuOpen ? 'bg-gray-800 rotate-45' : 'bg-primary-600'}`}
            >
              <Plus className="w-7 h-7 text-white" />
            </button>
          </div>

          <MobileNavLink to="/dashboard/products" icon={Package} label="Products" />
          <MobileNavLink to="/dashboard/marketing" icon={Percent} label="Grow" />
        </div>
      </div>

      {/* --- MOBILE FAB MENU OVERLAY --- */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[65] md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 left-4 right-4 z-[70] md:hidden"
            >
              <div className="bg-white rounded-2xl shadow-2xl p-4 space-y-2 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Quick Actions</p>
                <Link to="/dashboard/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-3 bg-gray-50 rounded-xl active:bg-gray-100">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mr-3"><Plus className="w-5 h-5" /></div>
                  <span className="font-semibold text-gray-800">Add Product</span>
                </Link>
                <Link to="/dashboard/settings/general" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center p-3 bg-gray-50 rounded-xl active:bg-gray-100">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mr-3"><Settings className="w-5 h-5" /></div>
                  <span className="font-semibold text-gray-800">Store Settings</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}