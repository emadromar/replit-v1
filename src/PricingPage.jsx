// src/PricingPage.jsx

import React from 'react';
import { PLAN_DETAILS } from './config.js';
import { Store, Check, X } from 'lucide-react';
import { Header } from './Header.jsx';
import { useTranslation } from 'react-i18next'; // <-- 1. IMPORTED
import { Link } from 'react-router-dom';

// This is the component for a single feature line
function Feature({ children, available }) {
  return (
    <li className="flex items-center space-x-3">
      {available ? (
        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
      ) : (
        <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
      )}
      <span className={available ? "text-gray-800" : "text-gray-500"}>
        {children}
      </span>
    </li>
  );
}

// This is the main pricing page component
export function PricingPage() {
  const { free, basic, pro } = PLAN_DETAILS;
  const { t } = useTranslation(); // <-- 2. ADDED HOOK

  return (
    <>
      <Header />

      <div className="bg-gray-50 min-h-screen pt-32 sm:pt-40 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="text-center">
            <Store className="w-16 h-16 mx-auto text-indigo-600" />
            <h1 className="mt-4 text-4xl font-extrabold text-gray-900 sm:text-5xl">
              {t('pricing.title')} {/* <-- 3. TRANSLATED */}
            </h1>
            <p className="mt-4 text-xl text-gray-600">
              {t('pricing.subtitle')} {/* <-- 3. TRANSLATED */}
            </p>
          </div>

          {/* Pricing Cards Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* --- FREE PLAN CARD --- */}
            <div className="border border-gray-200 bg-white rounded-2xl shadow-lg flex flex-col">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900">{t('pricing.freeName')}</h3>
                <p className="mt-2 text-sm text-gray-500">{t('pricing.freeTagline')}</p>
                <p className="mt-6">
                  <span className="text-5xl font-extrabold text-gray-900">{free.priceValue}</span>
                  {/* Price text is now part of the translation key */}
                  <span className="text-base font-medium text-gray-500"> {t('pricing.pricePerMonth')}</span>
                </p>
                <Link
  to="/signup"
                  className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-3 text-base font-semibold text-white text-center hover:bg-indigo-700"
                >
                  {t('pricing.freeButton')}
                </Link>
              </div>
              <div className="p-8 border-t border-gray-200 bg-gray-50/50 flex-grow">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t('pricing.freeIncludes')}</h4>
                <ul className="mt-6 space-y-4">
                  <Feature available={true}>{t('pricing.features.upTo')} {free.limits.products} {t('pricing.features.products')}</Feature>
                  <Feature available={true}>{t('pricing.features.upTo')} {free.limits.ordersPerMonth}</Feature>
                  <Feature available={free.limits.logo}>{t('pricing.features.logo')}</Feature>
                  <Feature available={free.limits.email}>{t('pricing.features.email')}</Feature>
                  <Feature available={free.limits.bulkImport}>{t('pricing.features.bulkImport')}</Feature>
                  <Feature available={free.limits.customPath}>{t('pricing.features.customPath')}</Feature>
                  <Feature available={false}>{t('pricing.features.analytics')}</Feature>
                </ul>
              </div>
            </div>

            {/* --- BASIC PLAN CARD --- */}
            <div className="border border-gray-200 bg-white rounded-2xl shadow-lg flex flex-col">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900">{t('pricing.basicName')}</h3>
                <p className="mt-2 text-sm text-gray-500">{t('pricing.basicTagline')}</p>
                <p className="mt-6">
                  <span className="text-5xl font-extrabold text-gray-900">{basic.priceValue}</span>
                  <span className="text-base font-medium text-gray-500"> {t('pricing.pricePerMonth')}</span>
                </p>
                <Link
  to="/signup"
                  className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-3 text-base font-semibold text-white text-center hover:bg-indigo-700"
                >
                  {t('pricing.basicButton')}
                </Link>
              </div>
              <div className="p-8 border-t border-gray-200 bg-gray-50/50 flex-grow">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t('pricing.basicIncludes')}</h4>
                <ul className="mt-6 space-y-4">
                  <Feature available={true}>{t('pricing.features.upTo')} {basic.limits.products} {t('pricing.features.products')}</Feature>
                  <Feature available={true}>{t('pricing.features.unlimitedOrders')}</Feature>
                  <Feature available={basic.limits.logo}>{t('pricing.features.logo')}</Feature>
                  <Feature available={basic.limits.email}>{t('pricing.features.email')}</Feature>
                  <Feature available={basic.limits.bulkImport}>{t('pricing.features.bulkImport')}</Feature>
                  <Feature available={basic.limits.customPath}>{t('pricing.features.customPath')}</Feature>
                  <Feature available={false}>{t('pricing.features.analytics')}</Feature>
                </ul>
              </div>
            </div>

            {/* --- PRO PLAN CARD (POPULAR) --- */}
            <div className="border-4 border-indigo-600 bg-white rounded-2xl shadow-2xl flex flex-col relative">
              <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-6 py-2 rounded-full text-base font-semibold bg-indigo-600 text-white shadow-lg">
                    {t('pricing.popular')}
                  </span>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900">{t('pricing.proName')}</h3>
                <p className="mt-2 text-sm text-gray-500">{t('pricing.proTagline')}</p>
                <p className="mt-6">
                  <span className="text-5xl font-extrabold text-gray-900">{pro.priceValue}</span>
                  <span className="text-base font-medium text-gray-500"> {t('pricing.pricePerMonth')}</span>
                </p>
                <Link
  to="/signup"
                  className="mt-8 block w-full bg-indigo-600 border border-transparent rounded-md py-3 text-base font-semibold text-white text-center hover:bg-indigo-700"
                >
                  {t('pricing.proButton')}
                </Link>
              </div>
              <div className="p-8 border-t border-gray-200 bg-gray-50/50 flex-grow">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{t('pricing.proIncludes')}</h4>
                <ul className="mt-6 space-y-4">
                  <Feature available={true}>{t('pricing.features.unlimited')} {t('pricing.features.products')}</Feature>
                  <Feature available={true}>{t('pricing.features.unlimitedOrders')}</Feature>
                  <Feature available={pro.limits.logo}>{t('pricing.features.logo')}</Feature>
                  <Feature available={pro.limits.email}>{t('pricing.features.emailPro')}</Feature>
                  <Feature available={pro.limits.bulkImport}>{t('pricing.features.bulkImport')}</Feature>
                  <Feature available={pro.limits.customPath}>{t('pricing.features.customPath')}</Feature>
                  <Feature available={true}>{t('pricing.features.analytics')}</Feature>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}