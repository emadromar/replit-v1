// src/components/dashboard/DashboardNav.jsx

import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAuth, signOut } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { 
  LayoutDashboard, LogOut, Bell, User, Globe, Settings, Package, ShoppingBag, BarChart3, TrendingUp, Shield, Percent
} from 'lucide-react';
import { ProductImage } from '../../ProductImage.jsx';
import { PLAN_DETAILS } from '../../config.js';

// --- NavLink Helper ---
const AppNavLink = ({ to, children }) => {
  const activeClass = "bg-primary-50 text-primary-700 border-b-2 border-primary-700";
  const inactiveClass = "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300";

  return (
    <NavLink
      to={to}
      end 
      className={({ isActive }) =>
        `flex items-center px-4 py-2 mx-1 rounded-t-lg text-sm font-semibold transition-all ${
          isActive ? activeClass : inactiveClass
        }`
      }
    >
      {children}
    </NavLink>
  );
};

// --- MobileNavLink Helper ---
const MobileNavLink = ({ to, children }) => {
  const activeClass = "text-primary-700"; 
  const inactiveClass = "text-gray-500 hover:text-gray-800";

  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
          isActive ? activeClass : inactiveClass
        }`
      }
    >
      {children}
    </NavLink>
  );
};


export function DashboardNav({ store, user, db, showError, showSuccess, isAdmin }) {

  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const currentPlan = store?.planId || 'free';
  const planDetails = PLAN_DETAILS[currentPlan];

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const [notifications, setNotifications] = useState([]);
  // FIX: Use a single state variable to enforce "One menu at a time"
  const [activeDropdown, setActiveDropdown] = useState(null); // 'notifications' | 'profile' | null
  
  const auth = getAuth(); 

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
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
      showError("Failed to load notifications.");
    });

    return () => unsubscribe();
  }, [user, db, showError]);
  
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
      console.error("Mark read failed:", error);
      showError("Could not mark notifications as read.");
    }
  };

  const toggleDropdown = (name, e) => {
    e.stopPropagation(); // Prevent the document listener from closing it immediately
    setActiveDropdown(activeDropdown === name ? null : name);
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
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-[100]">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Left Side: Store Name & Plan */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <ProductImage 
                src={store?.logoUrl} 
                alt={store?.name || 'Store'} 
                className="h-9 w-9 rounded-lg object-contain bg-gray-100 p-1 border border-gray-200"
              />
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                {store?.name || 'WebJor Store'}
              </span>
            </Link>
            
            <span className={`hidden md:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase ${planBgClass} ${planColorClass} border border-current`}>
              {planDetails.name}
            </span>
          </div>

          {/* Center: Main Navigation Tabs */}
          <div className="hidden md:flex items-center">
            <AppNavLink to="/dashboard">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </AppNavLink>
            <AppNavLink to="/dashboard/orders">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Orders
            </AppNavLink>
            <AppNavLink to="/dashboard/products">
              <Package className="w-4 h-4 mr-2" />
              Products
            </AppNavLink>

            <AppNavLink to="/dashboard/marketing">
              <Percent className="w-4 h-4 mr-2" />
              Marketing
            </AppNavLink>

            <AppNavLink to="/dashboard/brands">
              <TrendingUp className="w-4 h-4 mr-2" />
              Brands
            </AppNavLink>
            <AppNavLink to="/dashboard/settings/general">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </AppNavLink>
          </div>

          {/* Right Side: Actions & Profile */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            <button
              onClick={toggleLanguage}
              className="flex items-center p-2 rounded-full text-gray-500 hover:bg-gray-100"
              title="Change language"
            >
              <Globe className="w-5 h-5" />
              <span className="ml-1 text-xs font-semibold">
                {currentLanguage === 'en' ? 'AR' : 'EN'}
              </span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={(e) => toggleDropdown('notifications', e)}
                className={`p-2 rounded-full hover:bg-gray-100 relative transition-colors ${activeDropdown === 'notifications' ? 'bg-gray-100 text-primary-600' : 'text-gray-500'}`}
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>
              
              {activeDropdown === 'notifications' && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the menu
                >
                  <div className="p-3 flex justify-between items-center border-b">
                    <h3 className="text-sm font-semibold text-gray-800">Alerts</h3>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs text-primary-600 hover:underline">
                        Mark All Read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-gray-500 text-center">No new alerts.</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-3 border-b text-sm transition-colors ${n.read ? 'bg-white text-gray-600' : 'bg-primary-50 text-gray-900 font-medium'}`}
                        >
                          <p>{n.message}</p>
                          <p className="text-xs mt-1 text-gray-400">{n.createdAt?.toDate ? new Date(n.createdAt.toDate()).toLocaleString() : 'Just now'}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => toggleDropdown('profile', e)}
                className={`p-1.5 rounded-full hover:bg-gray-100 relative transition-colors ${activeDropdown === 'profile' ? 'bg-gray-100 text-primary-600' : 'text-gray-500'}`}
                aria-label="Open profile menu"
              >
                <User className="w-5 h-5" />
              </button>

              {activeDropdown === 'profile' && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                >
                  <div className="p-4 border-b bg-gray-50/50">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate mt-1" title={user.email}>
                      {user.email}
                    </p>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/dashboard/settings/profile"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600"
                    >
                      <User className="w-4 h-4 mr-3 text-gray-400" />
                      Profile
                    </Link>
                    <Link
                      to="/dashboard/settings/general"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-600"
                    >
                      <Settings className="w-4 h-4 mr-3 text-gray-400" />
                      Store Settings
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin" 
                        onClick={() => setActiveDropdown(null)}
                        className="flex items-center w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <Shield className="w-4 h-4 mr-3 text-red-500" />
                        Admin Panel
                      </Link>
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-100">
                    <button
                      onClick={handleSignOut}
                      className="flex items-center w-full text-left px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] flex justify-around shadow-[0_-2px_8px_rgba(0,0,0,0.05)]">
        <MobileNavLink to="/dashboard">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-xs font-medium">Dashboard</span>
        </MobileNavLink>
        <MobileNavLink to="/dashboard/orders">
          <ShoppingBag className="w-5 h-5" />
          <span className="text-xs font-medium">Orders</span>
        </MobileNavLink>
        <MobileNavLink to="/dashboard/products">
          <Package className="w-5 h-5" />
          <span className="text-xs font-medium">Products</span>
        </MobileNavLink>
        
        <MobileNavLink to="/dashboard/marketing">
          <Percent className="w-5 h-5" />
          <span className="text-xs font-medium">Marketing</span>
        </MobileNavLink>

        <MobileNavLink to="/dashboard/settings/general">
          <Settings className="w-5 h-5" />
          <span className="text-xs font-medium">Settings</span>
        </MobileNavLink>
      </div>
    </nav>
  );
}