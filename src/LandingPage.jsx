// src/LandingPage.jsx

import React from 'react';
import { Store, Package, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { Header } from './Header.jsx'; // <-- 1. IMPORT HEADER
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function LandingPage() {

    const { t } = useTranslation();

  return (
    <> {/* Use a fragment to hold Header + Page */}
      <Header /> {/* <-- 2. ADD THE HEADER COMPONENT */}

      {/* Main content pushed down with pt-32 */}
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-white to-indigo-100 p-8 pt-32">
        <div className="text-center max-w-2xl">
          <Store className="w-20 h-20 mx-auto text-indigo-600" />
          <h1 className="mt-8 text-5xl font-extrabold text-gray-900 tracking-tight">
            {t('landing.title')}
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-lg mx-auto">
            {t('landing.subtitle')}
          </p>
          {/* --- ADD THIS NEW BUTTON --- */}
          <div className="mt-10">
            <Link
  to="/signup"
  className="inline-flex items-center justify-center px-10 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg"
>
  {t('landing.joinButton')}
</Link>
          </div>

          {/* --- 3. THIS ENTIRE DIV IS NOW DELETED --- */}
          {/*
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
             ... All buttons (Sign In, View Pricing, Get Started) are gone ...
          </div>
          */}

        </div>
        
        <div className="mt-20 pt-10 border-t border-indigo-200 w-full max-w-4xl">
          <h3 className="text-center text-2xl font-bold text-gray-800">
            {t('landing.featuresTitle')}
          </h3>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {/* ... feature boxes ... */}
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <Package className="w-12 h-12 mx-auto text-indigo-600" />
              <h4 className="mt-4 text-lg font-semibold text-gray-900">{t('landing.featureManage')}</h4>
              <p className="mt-2 text-sm text-gray-600">
                {t('landing.featureManageDesc')}
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <ShoppingCart className="w-12 h-12 mx-auto text-indigo-600" />
              <h4 className="mt-4 text-lg font-semibold text-gray-900">{t('landing.featureProcess')}</h4>
              <p className="mt-2 text-sm text-gray-600">
                {t('landing.featureProcessDesc')}
              </p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow-lg">
              <LayoutDashboard className="w-12 h-12 mx-auto text-indigo-600" />
              <h4 className="mt-4 text-lg font-semibold text-gray-900">{t('landing.featureStorefront')}</h4>
              <p className="mt-2 text-sm text-gray-600">
                {t('landing.featureStorefrontDesc')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}