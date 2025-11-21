// src/pages/PublicStorePage.jsx

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  collection, doc, getDoc, getDocs, 
  query, where, orderBy, onSnapshot 
} from 'firebase/firestore';
import { 
  ShoppingCart, Search, X, Package, 
  Phone, Clock, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CURRENCY_CODE } from '../config.js';

import { useFirebaseServices } from '../contexts/FirebaseContext.jsx';
import { useCart } from '../contexts/CartContext.jsx';
import { CheckoutDrawer } from '../components/store/CheckoutDrawer.jsx';
import { ProductImage } from '../ProductImage.jsx';
import { FullScreenLoader } from '../components/shared/FullScreenLoader.jsx';
import { NotifyMeModal } from '../NotifyMeModal.jsx';
import { useNotifications } from '../contexts/NotificationContext.jsx';

// Store Components
import { LiveShopperSignals } from '../components/store/LiveShopperSignals.jsx';
import { SocialConfidenceBadges } from '../components/store/SocialConfidenceBadges.jsx';
import { DeliveryActivityMap } from '../components/store/DeliveryActivityMap.jsx';
import { ProductCard } from '../components/store/ProductCard.jsx'; 

// --- INTERNAL COMPONENT: Product Detail Modal ---
function ProductDetailModal({ product, isOpen, onClose, onAddToCart, themeColor }) {
  if (!isOpen || !product) return null;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Image Side */}
        <div className="w-full md:w-1/2 bg-gray-100 relative h-64 md:h-auto">
           <ProductImage src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </div>

        {/* Details Side */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h2>
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X className="w-5 h-5 text-gray-500" />
                </button>
            </div>
            
            <p className="text-2xl font-bold mb-6" style={{ color: themeColor }}>
                {CURRENCY_CODE} {product.price.toFixed(2)}
            </p>

            <div className="prose prose-sm text-gray-600 mb-8 flex-grow overflow-y-auto">
                <p className="whitespace-pre-wrap leading-relaxed">{product.description || "No description available."}</p>
            </div>
            
            {/* Reviews Section */}
            {product.reviews && product.reviews.length > 0 && (
                <div className="mb-8 border-t border-gray-100 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                        <Star className="w-4 h-4 mr-2 text-yellow-400 fill-current"/> Customer Reviews
                    </h3>
                    <div className="space-y-4">
                        {product.reviews.map((review) => (
                            <div key={review.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center mb-2 justify-between">
                                    <span className="font-bold text-sm text-gray-900">{review.author}</span>
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300 fill-current'}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 italic">"{review.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-auto pt-6 border-t border-gray-100">
                <button
                    onClick={() => { onAddToCart(product); onClose(); }}
                    disabled={isOutOfStock}
                    className={`w-full py-4 text-lg font-bold rounded-xl text-white shadow-lg transition-transform active:scale-95 ${isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : ''}`}
                    style={!isOutOfStock ? { backgroundColor: themeColor } : {}}
                >
                    {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
}

// --- SMART URGENCY TEASER ---
const SmartUrgencyTeaser = ({ isPro, onAddToCart, products, onVisibilityChange }) => { 
    const [showTeaser, setShowTeaser] = useState(false);
    const [productTeaser, setProductTeaser] = useState(null);
    const canShow = isPro && products.length > 0;
    const isMobile = window.innerWidth <= 768;

    const triggerTeaser = useCallback(() => { 
        if (!canShow || showTeaser) return;
        const randomProduct = products[Math.floor(Math.random() * products.length)];
        setProductTeaser(randomProduct);
        setShowTeaser(true);
        onVisibilityChange(true);
        
        setTimeout(() => {
            setShowTeaser(false);
            onVisibilityChange(false);
        }, 15000);
    }, [canShow, showTeaser, products, onVisibilityChange]);

    useEffect(() => {
        if (!canShow) return;
        
        let timeTimer;
        let scrollListenerAdded = false;

        const handleDesktopExit = (e) => {
            if (e.clientY < 10) triggerTeaser();
        };
        
        if (!isMobile) {
            window.addEventListener('mouseout', handleDesktopExit);
        }

        if (isMobile) {
            let timePassed = false;
            const scrollThreshold = document.body.scrollHeight * 0.5;

            timeTimer = setTimeout(() => {
                timePassed = true;
                if (window.scrollY > scrollThreshold) triggerTeaser();
            }, 15000); 

            const handleMobileScroll = () => {
                if (timePassed && window.scrollY > scrollThreshold) {
                    triggerTeaser();
                    window.removeEventListener('scroll', handleMobileScroll); 
                }
            };
            
            window.addEventListener('scroll', handleMobileScroll);
            scrollListenerAdded = true;
        }
        
        return () => {
            window.removeEventListener('mouseout', handleDesktopExit);
            if (scrollListenerAdded) window.removeEventListener('scroll', handleMobileScroll);
            clearTimeout(timeTimer);
        };
    }, [canShow, isMobile, triggerTeaser]);

    if (!canShow) return null;

    return (
        <AnimatePresence>
            {showTeaser && productTeaser && (
                <motion.div
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 200, opacity: 0 }}
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
                        className="w-full mt-3 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Buy Now
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};


// --- MAIN PAGE COMPONENT ---
export function PublicStorePage() {
  const { storeSlug } = useParams();
  const { db } = useFirebaseServices();
  const { showError, showSuccess, sendSystemNotification } = useNotifications(); 
  
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyProduct, setNotifyProduct] = useState(null);
  const [isRecoveryBubbleVisible, setIsRecoveryBubbleVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([]); 
  const [isSearchFocused, setIsSearchFocused] = useState(false); 
  const searchContainerRef = useRef(null); 


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
        let q = query(storesRef, where("customPath", "==", storeSlug));
        let storeSnapshot = await getDocs(q);

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

        const productsRef = collection(db, "stores", storeId, "products");
        const qProducts = query(productsRef, orderBy("createdAt", "desc"));
        const unsubProducts = onSnapshot(qProducts, (snapshot) => {
          setProducts(snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(), 
            viewsToday: Math.floor(Math.random() * 25) + 5 
          })));
        }, (err) => {
          console.error("Product snapshot error:", err);
          showError("Failed to load products.");
        });

        let unsubCategories = () => {};
        if (storeData.planId === 'basic' || storeData.planId === 'pro') {
          const categoriesRef = collection(db, "stores", storeId, "categories");
          const qCategories = query(categoriesRef, orderBy("name"));
          unsubCategories = onSnapshot(qCategories, (snapshot) => {
            setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          }, (err) => console.error("Category snapshot error:", err));
        }
        
        setLoading(false);
        return () => { unsubProducts(); unsubCategories(); };

      } catch (error) {
        console.error("Error fetching store:", error);
        setError('Failed to load store.');
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeSlug, db, showError]);

  // --- Search Logic ---
  useEffect(() => {
    if (searchQuery.trim() === '') { setSuggestions([]); } 
    else {
      const lowerSearchTerm = searchQuery.toLowerCase();
      const newSuggestions = products.filter(product => product.name.toLowerCase().startsWith(lowerSearchTerm)).slice(0, 5);
      setSuggestions(newSuggestions);
    }
  }, [searchQuery, products]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || (product.category === selectedCategory); 
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);


  if (loading) return <FullScreenLoader message="Loading Store..." />;
  
  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Package className="w-16 h-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800">Store Not Found</h1>
        <Link to="/" className="mt-6 text-primary-700 font-semibold hover:underline">Back to Home</Link>
      </div>
    );
  }

  const themeColor = store.themeColor || '#6D28D9';
  const currentPlanId = store.planId || 'free';
  const isPro = currentPlanId === 'pro';
  const hasBranding = currentPlanId === 'basic' || currentPlanId === 'pro';

  const handleAddToCart = (product) => {
    addToCart(product);
    showSuccess(`${product.name} added to cart!`);
  };

  const handleNotify = (product) => {
    setNotifyProduct(product);
    setIsNotifyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center gap-3">
                {hasBranding && store.logoUrl ? (
                  <img src={store.logoUrl} alt={`${store.name} logo`} className="h-12 w-auto object-contain" />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{store.name}</h1>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                {store.phone && (
                  <a 
                    href={`tel:${store.phone}`} 
                    className="hidden sm:flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
                  >
                    <Phone className="w-4 h-4" />
                    {store.phone}
                  </a>
                )}
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="relative p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-800"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemCount > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center shadow-sm"
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Trust Signals */}
        <div className="space-y-4">
            <SocialConfidenceBadges storeId={store.id} storeName={store.name} currentPlanId={currentPlanId} />
            <DeliveryActivityMap storeId={store.id} storeName={store.name} currentPlanId={currentPlanId} />
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            {/* Search */}
            <div className="relative w-full md:w-96" ref={searchContainerRef}>
                <input 
                    type="text" 
                    placeholder={`Search ${store.name}...`} 
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setIsSearchFocused(true); }}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-0 rounded-xl transition-all text-sm"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>

            {/* Categories */}
           {/* Categories with Scroll Mask */}
{categories.length > 0 && (
  <div className="relative w-full md:w-auto group">
    <div className="flex items-center space-x-2 overflow-x-auto pb-1 w-full md:w-auto scrollbar-hide mask-linear-fade">
      <button
        onClick={() => setSelectedCategory('All')}
        className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
          selectedCategory === 'All' 
          ? 'text-white shadow-lg scale-105' 
          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
        style={selectedCategory === 'All' ? { backgroundColor: themeColor } : {}}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => setSelectedCategory(cat.name)}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
            selectedCategory === cat.name
            ? 'text-white shadow-lg scale-105' 
            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          style={selectedCategory === cat.name ? { backgroundColor: themeColor } : {}}
        >
          {cat.name}
        </button>
      ))}
    </div>
    {/* Visual cue for scrolling (optional gradient overlay on right) */}
    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none md:hidden" />
  </div>
)}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={handleAddToCart} 
                        onNotify={handleNotify}
                        onOpenProductDetails={setSelectedProduct}
                        themeColor={themeColor}
                        isPro={isPro} 
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">No products found</h3>
                <p className="text-gray-500 mt-2">Try changing your search or category.</p>
                <button 
                    onClick={() => {setSearchQuery(''); setSelectedCategory('All')}} 
                    className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                    Clear Filters
                </button>
            </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Thanks for shopping with us!</p>
            {store.planId === 'free' && (
                <p className="text-xs text-gray-400 mt-8">
                    Powered by <span className="font-bold text-primary-600">WebJor</span>
                </p>
            )}
        </div>
      </footer>

      {/* Drawers & Modals */}
      <LiveShopperSignals 
        storeId={store.id} 
        storeName={store.name} 
        currentPlanId={store.planId} 
        isRecoveryBubbleVisible={isRecoveryBubbleVisible}
      />
      <SmartUrgencyTeaser 
          isPro={isPro} 
          products={products}
          onAddToCart={handleAddToCart} 
          onVisibilityChange={setIsRecoveryBubbleVisible}
      />

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
        onSubmit={async (email) => {
             showSuccess("You'll be notified!");
             setIsNotifyModalOpen(false);
        }}
      />

      <AnimatePresence>
        {selectedProduct && (
            <ProductDetailModal 
                product={selectedProduct} 
                isOpen={!!selectedProduct} 
                onClose={() => setSelectedProduct(null)} 
                onAddToCart={handleAddToCart}
                themeColor={themeColor}
            />
        )}
      </AnimatePresence>
    </div>
  );
}