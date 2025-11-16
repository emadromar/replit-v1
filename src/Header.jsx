// src/Header.jsx

import React, { useState } from 'react';
// --- Consolidated Imports ---
import { Store, Menu, X, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
// --- End of Imports ---

export function Header() {

  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  // State to manage mobile menu visibility
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-10 bg-white shadow-sm md:bg-transparent md:shadow-none">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="w-full py-4 flex items-center justify-between">
          
          {/* Logo */}
<Link to="/" className="flex items-center">
            <span className="sr-only">WebJor</span>
            <Store className="h-10 w-auto text-indigo-600" />
            <span className="ml-3 text-2xl font-bold text-gray-900">WebJor</span>
          </Link>

          {/* Mobile Menu Button (Hamburger) */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop Links (Hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-4">

            <button
              onClick={toggleLanguage}
              className="flex items-center text-base font-medium text-gray-700 hover:text-indigo-600"
            >
              <Globe className="w-5 h-5 mr-1" />
              {currentLanguage === 'en' ? 'العربية' : 'English'}
            </button>

            <Link 
  to="/pricing"
              className="text-base font-medium text-gray-700 hover:text-indigo-600"
            >
              {t('header.pricing')} {/* <-- 10000% FIXED */}
            </Link>
            <Link 
              to="/login" 
              className="text-base font-medium text-gray-700 hover:text-indigo-600"
            >
              {t('header.signIn')} {/* <-- 10000% FIXED */}
            </Link>
          </div>
        </div>
      </nav>

      {/* --- MOBILE MENU (Dropdown) --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-white">
          <div className="p-4">
            {/* Mobile Menu Header (Logo & Close Button) */}
            <div className="flex items-center justify-between">
<Link to="/" className="flex items-center">
                <Store className="h-10 w-auto text-indigo-600" />
                <span className="ml-3 text-2xl font-bold text-gray-900">WebJor</span>
              </Link>
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Menu Links */}
            <div className="mt-6 flex flex-col space-y-4">
              <Link 
  to="/pricing" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full p-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('header.pricing')} {/* <-- 10000% FIXED */}
              </Link>
              <Link 
  to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full p-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('header.signIn')} {/* <-- This one was already correct */}
           </Link>
              
              <button
                onClick={() => {
                  toggleLanguage();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full p-3 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
          >
                <Globe className="w-5 h-5 mr-2" />
                {currentLanguage === 'en' ? 'العربية' : 'English'}
              </button>

             </div>
          </div>
        </div>
      )}
    </header>
  );
}