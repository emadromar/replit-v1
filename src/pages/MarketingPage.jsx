// src/pages/MarketingPage.jsx

import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { Percent, Instagram, Mail, Megaphone, Lock, Zap, ChevronDown, Sparkles } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import { DiscountCodesManager } from '../components/dashboard/marketing/DiscountCodesManager.jsx';
import { AiCaptionGenerator } from '../components/dashboard/marketing/AiCaptionGenerator.jsx';
import { ProductAnalyzer } from '../components/dashboard/ProductAnalyzer.jsx';

export function MarketingPage() {
  const { store, services, showError, onOpenUpgradeModal } = useOutletContext();
  const { db } = services;

  // Product State for Analyzer
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch Products
  useEffect(() => {
    if (!store?.id || !db) return;

    const productsRef = collection(db, 'stores', store.id, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedProducts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(fetchedProducts);
      if (fetchedProducts.length > 0 && !selectedProductId) {
        setSelectedProductId(fetchedProducts[0].id);
      }
      setLoadingProducts(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoadingProducts(false);
    });

    return () => unsubscribe();
  }, [store?.id, db]);

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const tools = [
    {
      name: 'Product Analyzer',
      icon: Zap,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50',
      component: (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Analyze Product Performance</h3>
                <p className="text-sm text-gray-500">Get AI-driven insights on why your product might not be selling.</p>
              </div>
              <div className="relative min-w-[250px]">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  disabled={loadingProducts || products.length === 0}
                >
                  {products.length === 0 ? (
                    <option>No products found</option>
                  ) : (
                    products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {products.length === 0 && !loadingProducts && (
              <div className="text-center p-6 bg-amber-50 rounded-xl border border-amber-100 text-amber-800">
                <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p className="font-medium">You need to add products before using the analyzer.</p>
              </div>
            )}

            {selectedProduct && (
              <ProductAnalyzer
                product={selectedProduct}
                store={store}
                services={services}
                onOpenUpgradeModal={onOpenUpgradeModal}
                showError={showError}
              />
            )}
          </div>
        </div>
      )
    },
    { name: 'Discount Codes', icon: Percent, color: 'text-green-500', bgColor: 'bg-green-50', component: <DiscountCodesManager /> },
    { name: 'Social AI', icon: Instagram, color: 'text-pink-500', bgColor: 'bg-pink-50', component: <AiCaptionGenerator /> },
    { name: 'Email Campaigns', icon: Mail, locked: true },
    { name: 'Ad Creatives', icon: Megaphone, locked: true },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-24">
      {/* Header Section */}
      <div className="relative mb-10 p-8 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-500 opacity-10 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">Marketing Hub</h1>
          <p className="text-gray-400 text-lg max-w-2xl">
            Supercharge your sales with AI-powered marketing tools. Create content, analyze performance, and optimize your strategy.
          </p>
        </div>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          {tools.map((tool) => (
            <Tab
              key={tool.name}
              disabled={tool.locked}
              className={({ selected }) =>
                `group relative flex items-center px-6 py-3.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap outline-none focus:ring-0 ${selected
                  ? 'text-white shadow-lg shadow-primary-500/20'
                  : tool.locked
                    ? 'text-gray-400 cursor-not-allowed opacity-60 bg-gray-50 border border-gray-100'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white bg-gray-50 border border-gray-200 hover:border-gray-300'
                }`
              }
            >
              {({ selected }) => (
                <>
                  {selected && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gray-900 rounded-2xl"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <tool.icon className={`w-4 h-4 ${selected ? 'text-primary-400' : tool.color}`} />
                    {tool.name}
                    {tool.locked && <Lock className="w-3 h-3 opacity-50 ml-1" />}
                  </span>
                </>
              )}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels>
          <AnimatePresence mode="wait">
            {tools.map((tool, idx) => (
              <Tab.Panel
                key={idx}
                className="focus:outline-none"
                as={motion.div}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tool.locked ? (
                  <div className="h-80 flex flex-col items-center justify-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 text-gray-400">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <tool.icon className="w-8 h-8 opacity-20" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-500">Coming Soon</h3>
                    <p className="text-sm text-gray-400 mt-1">This powerful tool is under development.</p>
                  </div>
                ) : (
                  tool.component
                )}
              </Tab.Panel>
            ))}
          </AnimatePresence>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}