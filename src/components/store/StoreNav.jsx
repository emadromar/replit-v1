// src/components/store/StoreNav.jsx

import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, ChevronDown } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { CheckoutDrawer } from './CheckoutDrawer.jsx'; // Import the drawer
import { ProductImage } from '../../ProductImage.jsx'; // Import for suggestions

// --- FIX 1: Added 'services' to the props list ---
export const StoreNav = ({
  storeName,
  storeColor,
  logoUrl,
  planId,
  products,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  showError,
  showSuccess,
  services, // <-- THIS WAS ADDED
}) => {
  const cart = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const navWrapperRef = useRef(null);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // --- Plan checks ---
  const isProPlan = planId === 'pro';
  const isBasicPlan = planId === 'basic';
  const isFreePlan = planId === 'free';
  const canShowLogo = isBasicPlan || isProPlan;
  const canShowSearch = isBasicPlan || isProPlan;

  // --- Theme colors ---
  const textColor = isFreePlan ? 'text-gray-900' : 'text-white';
  const hoverBg = isFreePlan ? 'hover:bg-gray-200' : 'hover:bg-white/20';
  const cartIconColor = isFreePlan ? 'text-gray-700' : 'text-white';
  const navBg = isFreePlan ? 'bg-white' : '';
  const searchInputBg = isFreePlan
    ? 'bg-gray-100 border-gray-300 text-gray-900'
    : 'bg-white/20 border-transparent text-white placeholder-white/70 focus:bg-white focus:text-gray-900 focus:placeholder-gray-500';
  const searchIconColor = isFreePlan ? 'text-gray-400' : 'text-white/70';
  const dropdownBg = isFreePlan
    ? 'bg-gray-100 border-gray-300 text-gray-900'
    : 'bg-white/20 border-transparent text-white';

  const sortOptions = {
    createdAt_desc: 'Sort: Newest',
    name_asc: 'Sort: Name (A-Z)',
    price_asc: 'Sort: Price (Low-High)',
    price_desc: 'Sort: Price (High-Low)',
  };

  // --- Search suggestion logic ---
  const handleSearchChange = (e) => {
    const value = e.target.value;
    onSearchChange(value); // Update parent state

    if (isProPlan && value.length > 1) {
      const lowerValue = value.toLowerCase();
      const matchingProducts = products
        .filter((p) => p.name.toLowerCase().includes(lowerValue))
        .slice(0, 5);
      setSuggestions(matchingProducts);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (productName) => {
    onSearchChange(productName);
    setSuggestions([]);
  };

  // --- Close suggestions when clicking outside ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (navWrapperRef.current && !navWrapperRef.current.contains(event.target)) {
        setSuggestions([]);
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navWrapperRef]);

  const handleSortChange = (value) => {
    onSortChange(value);
    setIsSortOpen(false);
  };

  const sortButtonStyle = {
    backgroundColor: isFreePlan ? 'rgb(243 244 246)' : 'rgba(255, 255, 255, 0.2)',
    borderColor: isFreePlan ? 'rgb(209 213 219)' : 'transparent',
    color: isFreePlan ? 'rgb(17 24 39)' : 'white',
    height: '42px',
  };

  const sortOptionStyle = (value) => {
    let style =
      'block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100';
    if (sortBy === value) {
      style = 'block w-full text-left px-4 py-2 text-sm font-semibold text-white';
    }
    return style;
  };

  const sortOptionInlineStyle = (value) => {
    return sortBy === value ? { backgroundColor: storeColor, color: 'white' } : {};
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-20 shadow-md transition-colors duration-300 ${navBg}`}
      style={!isFreePlan ? { backgroundColor: storeColor || '#4f46e5' } : {}}
      ref={navWrapperRef}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Nav Bar */}
        <div className="flex justify-between h-16 items-center gap-4">
          {/* 1. Store Logo/Name Section */}
          <div className="flex-shrink-0 flex items-center">
            {canShowLogo && logoUrl ? (
              <img
                src={logoUrl}
                alt={`${storeName} logo`}
                className="h-10 w-auto max-w-[150px] object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <>
                <ShoppingCart
                  className={`h-7 w-7 mr-2 ${
                    isFreePlan ? 'text-gray-700' : 'text-white'
                  }`}
                />
                <span className={`text-xl font-bold ${textColor}`}>
                  {storeName || 'Online Store'}
                </span>
              </>
            )}
          </div>

          {/* 2. Filter/Search Section (Basic/Pro) */}
          <div className="flex-grow flex justify-center items-center px-4 hidden md:flex">
            {(isBasicPlan || isProPlan) && (
              <div className="flex gap-2 items-center">
                {/* Basic: Search Bar (with Pro Suggestions) */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={handleSearchChange}
                    className={`pl-10 pr-4 py-2 rounded-md border text-sm w-64 lg:w-96 transition-colors duration-300 focus:outline-none ${searchInputBg}`}
                    style={{ height: '42px' }}
                  />
                  <Search
                    className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${searchIconColor} transition-colors duration-300`}
                  />

                  {/* PRO: Search Suggestions */}
                  {isProPlan && suggestions.length > 0 && (
                    <div className="absolute top-full mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-30">
                      <ul>
                        {suggestions.map((product) => (
                          <li
                            key={product.id}
                            onClick={() => handleSuggestionClick(product.name)}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                          >
                            <ProductImage
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-8 h-8 rounded object-cover flex-shrink-0"
                            />
                            <span className="truncate">{product.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Pro: Custom Sort By Dropdown */}
                {isProPlan && (
                  <div className="relative">
                    <button
                      onClick={() => setIsSortOpen(!isSortOpen)}
                      className={`flex items-center justify-between px-4 py-2 rounded-md border text-sm w-48 transition-colors duration-300 focus:outline-none`}
                      style={sortButtonStyle}
                    >
                      <span>{sortOptions[sortBy]}</span>
                      <ChevronDown
                        className={`w-4 h-4 ml-2 transition-transform ${
                          isSortOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isSortOpen && (
                      <div className="absolute top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-30">
                        {Object.entries(sortOptions).map(([value, label]) => (
                          <button
                            key={value}
                            onClick={() => handleSortChange(value)}
                            className={sortOptionStyle(value)}
                            style={sortOptionInlineStyle(value)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Cart Button Section */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={() => setIsCartOpen(true)}
              className={`p-2 relative rounded-full ${cartIconColor} ${hoverBg} transition-colors`}
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar for Mobile (Basic/Pro) */}
      {(isBasicPlan || isProPlan) && (
        <div
          className={`flex md:hidden gap-2 p-2 ${
            isFreePlan ? 'bg-gray-100 border-t border-gray-200' : ''
          }`}
          style={!isFreePlan ? { backgroundColor: 'rgba(0,0,0,0.1)' } : {}}
        >
          {/* Basic: Search Bar */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearchChange}
              className={`pl-10 pr-4 py-2 rounded-md border text-sm w-full ${searchInputBg} transition-colors duration-300 focus:outline-none`}
              style={{ height: '42px' }}
            />
            <Search
              className={`w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 ${searchIconColor} transition-colors duration-300`}
            />
            {/* PRO: Search Suggestions (Mobile) */}
            {isProPlan && suggestions.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-30">
                <ul>
                  {suggestions.map((product) => (
                    <li
                      key={product.id}
                      onClick={() => handleSuggestionClick(product.name)}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                    >
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                      />
                      <span className="truncate">{product.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* Pro: Sort By (Mobile) */}
          {isProPlan && (
            <div className="flex-shrink-0 relative">
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className={`flex items-center px-3 py-2 rounded-md border ${dropdownBg} transition-colors duration-300 focus:outline-none text-sm`}
                style={sortButtonStyle}
              >
                <span>Sort</span>
                <ChevronDown
                  className={`w-4 h-4 ml-1 transition-transform ${
                    isSortOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {/* Custom Dropdown Menu (Mobile) */}
              {isSortOpen && (
                <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden z-30">
                  {Object.entries(sortOptions).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => handleSortChange(value)}
                      className={sortOptionStyle(value)}
                      style={sortOptionInlineStyle(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* --- FIX 2: Pass 'services' prop to the drawer --- */}
      <CheckoutDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        storeColor={storeColor}
        planId={planId}
        showError={showError}
        showSuccess={showSuccess}
        services={services} // <-- THIS WAS ADDED
      />
    </nav>
  );
};

export default StoreNav;