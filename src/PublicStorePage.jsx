// src/PublicStorePage.jsx

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'; // <-- FIX 1: ADDED useCallback
import { useParams, Link } from 'react-router-dom';
import { 
  collection, doc, getDoc, getDocs, 
  query, where, orderBy, onSnapshot 
} from 'firebase/firestore';
import { 
  ShoppingCart, Search, X, Package, 
  ChevronDown, Phone, Loader2, Info, Star, Clock // <-- ADDED Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useFirebaseServices } from './contexts/FirebaseContext.jsx';
import { useCart } from './contexts/CartContext.jsx';
import { CheckoutDrawer } from './components/store/CheckoutDrawer.jsx';
import { ProductImage } from './ProductImage.jsx';
import { FullScreenLoader } from './components/shared/FullScreenLoader.jsx';
import { NotifyMeModal } from './NotifyMeModal.jsx';
import { useNotifications } from './contexts/NotificationContext.jsx';
import { LiveShopperSignals } from './components/store/LiveShopperSignals.jsx';
import { SocialConfidenceBadges } from './components/store/SocialConfidenceBadges.jsx';
import { DeliveryActivityMap } from './components/store/DeliveryActivityMap.jsx';




// --- A. SMART URGENCY & EXIT INTENT LOGIC (PRO ONLY) ---
// NOTE: One-time-per-session logic has been removed to fix the desktop trigger bug.
const SmartUrgencyTeaser = ({ isPro, onAddToCart, products, onVisibilityChange }) => { 
    const [showTeaser, setShowTeaser] = useState(false);
    const [productTeaser, setProductTeaser] = useState(null);
    const canShow = isPro && products.length > 0;
    const isMobile = window.innerWidth <= 768;

    // Function to trigger the bubble (Simple, direct function)
    const triggerTeaser = () => { 
        // Stop if the bubble is already shown or not Pro
        if (!canShow || showTeaser) return;

        // Choose product and show the popup
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        setProductTeaser(randomProduct);
        setShowTeaser(true);
        onVisibilityChange(true);
        
        // Auto-close after 10s
        setTimeout(() => {
            setShowTeaser(false);
            onVisibilityChange(false);
        }, 15000);
    };


    // --- UNIFIED LISTENER ATTACHMENT/CLEANUP (The Main Logic) ---
    useEffect(() => {
        if (!canShow) return; // Stop if feature is locked
        
        let timeTimer;
        let scrollListenerAdded = false;

        // --- 1. DESKTOP LOGIC (Exit Intent) ---
        const handleDesktopExit = (e) => {
            if (e.clientY < 10) {
                triggerTeaser();
            }
        };
        
        if (!isMobile) {
            // Attach desktop listener
            window.addEventListener('mouseout', handleDesktopExit);
        }

        // --- 2. MOBILE LOGIC (Time and Scroll Depth) ---
        if (isMobile) {
            let timePassed = false;
            const scrollThreshold = document.body.scrollHeight * 0.5;

            // Timer to set the 'time passed' flag
            timeTimer = setTimeout(() => {
                timePassed = true;
                if (window.scrollY > scrollThreshold) {
                    triggerTeaser();
                }
            }, 15000); // 15 seconds

            // Scroll listener checks for threshold after time has passed
            const handleMobileScroll = () => {
                if (timePassed && window.scrollY > scrollThreshold) {
                    triggerTeaser();
                    window.removeEventListener('scroll', handleMobileScroll); // Remove listener after successful trigger
                }
            };
            
            window.addEventListener('scroll', handleMobileScroll);
            scrollListenerAdded = true;
        }
        
        // Final component cleanup (Runs when component unmounts)
        return () => {
            window.removeEventListener('mouseout', handleDesktopExit);
            if (scrollListenerAdded) {
                window.removeEventListener('scroll', handleMobileScroll);
            }
            clearTimeout(timeTimer);
        };
    }, [canShow, isMobile, triggerTeaser]);


    // Final render check: If not Pro, hide.
    if (!canShow) return null;


    return (
        <AnimatePresence>
            {showTeaser && productTeaser && (
                <motion.div
                    key="recovery-bubble"
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 200, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`fixed z-50 m-4 p-4 bg-white rounded-xl shadow-2xl border-t-4 border-red-500 max-w-sm ${isMobile ? 'bottom-0 right-0' : 'top-16 right-4'}`}
                >
                    <div className="flex justify-between items-start">
                        <h4 className="text-lg font-bold text-gray-900 flex items-center">
                            <Clock className="w-5 h-5 text-red-500 mr-2" />
                            Still Thinking?
                        </h4>
                        <button onClick={() => { setShowTeaser(false); onVisibilityChange(false); }} className="text-gray-400 hover:text-gray-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                        Don't miss out on **{productTeaser.name}**. It's our top seller!
                        <strong className="text-red-600 ml-1">Only {productTeaser.stock > 0 ? productTeaser.stock : 'a few'} left!</strong>
                    </p>
                    <button
                        onClick={() => { 
                            onAddToCart(productTeaser); 
                            setShowTeaser(false); 
                            onVisibilityChange(false); 
                        }}
                        className="btn-primary w-full mt-3 bg-red-600 hover:bg-red-700"
                    >
                        Buy {productTeaser.name.split(' ').slice(0, 2).join(' ')} Now
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- Reusable Product Card Component (MODIFIED) ---
const ProductCard = ({ product, onNotify, onAddToCart, themeColor, isPro }) => { // <-- ADD isPro prop

    // --- NEW: Urgency Logic (PRO ONLY) ---
    // The Smart Urgency System: checks for high simulated views OR low stock
    const showUrgencyTag = isPro && (product.viewsToday > 20 || product.stock <= 5);
    const urgencyText = product.stock <= 5 && product.stock > 0 ? 
        `Only ${product.stock} left!` : 
        product.viewsToday > 20 ? 
        'Selling Fast Today' : 
        null;
    
    // --- Calculate average rating (unchanged) ---
    const averageRating = useMemo(() => {
        if (!product.reviews || product.reviews.length === 0) {
          return 0;
        }
        const total = product.reviews.reduce((acc, review) => acc + review.rating, 0);
        return Math.round(total / product.reviews.length);
    }, [product.reviews]);
    
    const reviewCount = product.reviews?.length || 0;

    return (
      <div className="card card-hover overflow-hidden flex flex-col group">
        <div className="relative">
          <ProductImage 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-56 object-cover bg-gray-100"
          />
          {product.stock === 0 && (
            <span className="absolute top-3 left-3 px-2 py-0.5 bg-gray-900 text-white text-xs font-semibold rounded-full">
              Sold Out
            </span>
          )}
          
          {/* --- NEW URGENCY TAG (Smart Urgency System) --- */}
          {showUrgencyTag && (
              <span className="absolute top-3 right-3 px-2 py-0.5 bg-red-600 text-white text-xs font-semibold rounded-full animate-pulse">
                  {urgencyText}
              </span>
          )}
          {/* --- END URGENCY TAG --- */}
          
        </div>
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-semibold text-gray-800 truncate" title={product.name}>
            {product.name}
          </h3>
          
          {/* --- ADDED THIS NEW REVIEW/RATING BLOCK (UNCHANGED) --- */}
          {reviewCount > 0 ? (
            <div className="flex items-center mt-1.5" title={`${averageRating} stars out of ${reviewCount} reviews`}>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < averageRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="ml-2 text-xs text-gray-500">
                ({reviewCount})
              </span>
            </div>
          ) : (
            <div className="flex items-center mt-1.5 h-5"> 
            </div>
          )}
          {/* --- END OF NEW BLOCK --- */}

          <p className="text-lg font-bold text-gray-900 mt-1">
            JOD {product.price?.toFixed(2) || '0.00'}
          </p>
          
          <div className="pt-4 mt-auto">
            {product.stock > 0 ? (
              <button 
                onClick={() => onAddToCart(product)}
                className="btn-primary w-full"
                style={{ backgroundColor: themeColor }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </button>
            ) : (
              <button 
                onClick={() => onNotify(product)}
                className="btn-secondary w-full"
              >
                <Info className="w-4 h-4 mr-2" />
                Notify Me When Available
              </button>
            )}
          </div>
        </div>
      </div>
    );
};

// --- Main Public Store Page ---
export function PublicStorePage() {
  const { storeSlug } = useParams();
  const { db } = useFirebaseServices();
  const { sendSystemNotification, showError, showSuccess } = useNotifications();
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyProduct, setNotifyProduct] = useState(null);
  
  // --- NEW STATE FOR MUTUAL EXCLUSION (Visibility) ---
  const [isRecoveryBubbleVisible, setIsRecoveryBubbleVisible] = useState(false);


  // --- FIX: Add a guard to prevent calling useCart with null ---
  const { addToCart, getItemCount } = useCart(store ? store.id : null);
  const cartItemCount = store ? getItemCount() : 0;
  
  // --- Data Fetching ---
  useEffect(() => {
    if (!storeSlug || !db) return;

    const fetchStoreData = async () => {
      setLoading(true);
      setStore(null); 
      try {
        const storesRef = collection(db, "stores");
        // Try to find by customPath first
        let q = query(storesRef, where("customPath", "==", storeSlug));
        let storeSnapshot = await getDocs(q);

        // If not found, try to find by name_slug
        if (storeSnapshot.empty) {
          q = query(storesRef, where("name_slug", "==", storeSlug));
          storeSnapshot = await getDocs(q);
        }
        
        if (storeSnapshot.empty) {
          console.log("Store not found.");
          setLoading(false); 
          return;
        }

        const storeDoc = storeSnapshot.docs[0];
        const storeData = { id: storeDoc.id, ...storeDoc.data() };
        setStore(storeData);

        const storeId = storeDoc.id;

        // Fetch Products (Snapshot Listener)
        const productsRef = collection(db, "stores", storeId, "products");
        const qProducts = query(productsRef, orderBy("createdAt", "desc"));
        const unsubProducts = onSnapshot(qProducts, (snapshot) => {
          // --- ADD SIMULATED VIEWS FOR SMART URGENCY SYSTEM ---
          setProducts(snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(), 
            viewsToday: Math.floor(Math.random() * 25) + 5 // Simulating 5-30 views
          })));
        }, (err) => {
          console.error("Product snapshot error:", err);
          showError("Failed to load products.");
        });

        // Fetch Categories (if Basic or Pro plan)
        let unsubCategories = () => {};
        if (storeData.planId === 'basic' || storeData.planId === 'pro') {
          const categoriesRef = collection(db, "stores", storeId, "categories");
          const qCategories = query(categoriesRef, orderBy("name"));
          unsubCategories = onSnapshot(qCategories, (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }, (err) => console.error("Category snapshot error:", err));
        }
        
        setLoading(false);
        return () => {
          unsubProducts();
          unsubCategories();
        };

      } catch (error) {
        console.error("Error fetching store:", error);
        showError("Error loading store.");
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeSlug, db, showError]);


  // (Suggestion logic unchanged)
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
    } else {
      const lowerSearchTerm = searchTerm.toLowerCase();
      const newSuggestions = products.filter(product => 
        product.name.toLowerCase().startsWith(lowerSearchTerm)
      ).slice(0, 5);
      setSuggestions(newSuggestions);
    }
  }, [searchTerm, products]);

  // (Click outside logic unchanged)
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  // (Filtering logic unchanged)
  const filteredProducts = useMemo(() => {
    let tempProducts = [...products];
    if (selectedCategory !== 'all') {
      const categoryDoc = categories.find(cat => cat.id === selectedCategory);
      if (categoryDoc) {
        tempProducts = tempProducts.filter(p => (p.category || '').toLowerCase() === (categoryDoc.name || '').toLowerCase());
      }
    }
    if (searchTerm) {
      tempProducts = tempProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return tempProducts;
  }, [products, selectedCategory, searchTerm, categories]);

  // (Event handlers unchanged)
  const handleAddToCart = (product) => {
    addToCart(product);
    showSuccess(`${product.name} added to cart!`);
  };
  const handleNotify = (product) => {
    setNotifyProduct(product);
    setIsNotifyModalOpen(true);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsSearchFocused(true);
  };
  const handleSuggestionClick = (suggestionName) => {
    setSearchTerm(suggestionName);
    setSuggestions([]);
    setIsSearchFocused(false);
  };

  // --- Main Render Logic ---
  if (loading) {
    return <FullScreenLoader message="Loading Store..." />;
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Store Not Found</h1>
        <p className="text-gray-600 mt-2">The store you're looking for doesn't exist or may be inactive.</p>
        <Link to="/" className="mt-6 text-primary-700 font-semibold hover:underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const themeColor = store.themeColor || '#6D28D9';
  const currentPlanId = store.planId || 'free';
  const hasBranding = currentPlanId === 'basic' || currentPlanId === 'pro';
  const isPro = currentPlanId === 'pro'; // <-- Define isPro here

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* --- Store Header (Unchanged) --- */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <Link to="#" className="flex items-center gap-3">
                {hasBranding && store.logoUrl ? (
                  <img src={store.logoUrl} alt={`${store.name} logo`} className="h-10 w-auto object-contain" />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                )}
              </Link>
              <div className="flex items-center gap-4">
                {store.phone && (
                  <a 
                    href={`tel:${store.phone}`} 
                    className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary-700"
                    style={{ '--tw-text-opacity': 1, color: themeColor }}
                  >
                    <Phone className="w-4 h-4" />
                    {store.phone}
                  </a>
                )}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                      style={{ backgroundColor: themeColor }}
                    >
                      {cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </nav>
        </header>

        {/* --- Main Content --- */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* --- ADDED SOCIAL PROOF/ACTIVITY COMPONENTS HERE --- */}
          <SocialConfidenceBadges 
              storeId={store.id} 
              storeName={store.name} 
              currentPlanId={currentPlanId}
          />
          <DeliveryActivityMap
              storeId={store.id} 
              storeName={store.name} 
              currentPlanId={currentPlanId}
          />
          {/* --- END ACTIVITY COMPONENTS --- */}

          {/* --- Filters (Search & Categories) (Unchanged) --- */}
          <div className="mb-6">
            {/* ... (Search bar content unchanged) ... */}
            <div 
              className="relative" 
              ref={searchContainerRef}
            >
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2"
                style={{ borderColor: themeColor, focusRingColor: themeColor }}
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <AnimatePresence>
                {isSearchFocused && suggestions.length > 0 && (
                  <motion.div
                    className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <ul className="divide-y divide-gray-100">
                      {suggestions.map(product => (
                        <li 
                          key={product.id}
                          className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleSuggestionClick(product.name)}
                        >
                          <ProductImage 
                            src={product.imageUrl} 
                            alt={product.name} 
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{product.name}</p>
                            <p className="text-sm font-bold text-gray-900" style={{ color: themeColor }}>
                              JOD {product.price?.toFixed(2)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {hasBranding && categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-full border-2 transition-colors ${
                    selectedCategory === 'all' 
                    ? 'text-white' 
                    : 'text-gray-700 bg-white hover:bg-gray-100'
                  }`}
                  style={selectedCategory === 'all' ? { backgroundColor: themeColor, borderColor: themeColor } : { borderColor: themeColor }}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full border-2 transition-colors ${
                      selectedCategory === cat.id 
                      ? 'text-white' 
                      : 'text-gray-700 bg-white hover:bg-gray-100'
                    }`}
                    style={selectedCategory === cat.id ? { backgroundColor: themeColor, borderColor: themeColor } : { borderColor: themeColor }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* --- Product Grid --- */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onNotify={handleNotify}
                  onAddToCart={handleAddToCart}
                  themeColor={themeColor}
                  isPro={isPro} // <-- PASS ISPRO HERE
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <Package className="w-12 h-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">No Products Found</h3>
              <p className="text-gray-500 text-sm mt-1">
                {searchTerm ? 'Try adjusting your search.' : "This store hasn't added any products yet."}
              </p>
            </div>
          )}
        </main>
        
        {/* --- Footer (Unchanged) --- */}
        <footer className="text-center py-6 mt-12 border-t border-gray-200">
          {hasBranding ? (
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} {store.name}
            </p>
          ) : (
            <a 
              href="https://webjor.live" // <-- This is your link
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-primary-700 font-medium"
            >
              Powered by <strong>WebJor</strong>
            </a>
          )}
        </footer>
      </div>

      <LiveShopperSignals 
        storeId={store.id} 
        storeName={store.name} 
        currentPlanId={store.planId} 
        isRecoveryBubbleVisible={isRecoveryBubbleVisible} // <-- FIX: ADD THIS PROP
      />
      {/* --- ADD VISITOR RECOVERY BUBBLE HERE --- */}
      <SmartUrgencyTeaser 
          isPro={isPro} 
          products={products}
          onAddToCart={handleAddToCart} 
          onVisibilityChange={setIsRecoveryBubbleVisible} // <-- FIX: ADD THIS PROP
      />
      {/* --- END VISITOR RECOVERY BUBBLE --- */}

      {/* --- Modals & Drawers (Unchanged) --- */}
      <CheckoutDrawer
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        store={store}
        products={products}
        db={db}
        showError={showError}
        showSuccess={showSuccess}
        sendSystemNotification={sendSystemNotification}
      />
      <NotifyMeModal
        isOpen={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
        product={notifyProduct}
        storeId={store.id}
        db={db}
        showSuccess={showSuccess}
        showError={showError}
      />
    </>
  );
}