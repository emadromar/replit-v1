// src/pages/LandingPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Store, Zap, Layout, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function LandingPage() {
  return (
    <div className="bg-white font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(#e9dffc_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary-50 text-primary-700 text-sm font-bold mb-6 border border-primary-100">
               🚀 Launch Your Store Today
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
              Sell Online. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                Simply & Beautifully.
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 mb-10">
              The easiest way to build a professional online store. No coding required. Manage inventory, track orders, and grow your brand.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/signup" className="btn-primary text-lg px-8 py-4 shadow-xl hover:shadow-2xl hover:-translate-y-1">
                Start Free Trial
              </Link>
              <Link to="/pricing" className="btn-secondary text-lg px-8 py-4">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <div className="border-y border-gray-100 bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
            Trusted by ambitious entrepreneurs in Jordan
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale">
             <span className="text-xl font-bold text-gray-400 flex items-center gap-2"><Store className="w-5 h-5"/> AmmanFashion</span>
             <span className="text-xl font-bold text-gray-400 flex items-center gap-2"><Zap className="w-5 h-5"/> TechJo</span>
             <span className="text-xl font-bold text-gray-400 flex items-center gap-2"><Layout className="w-5 h-5"/> HomeStyle</span>
             <span className="text-xl font-bold text-gray-400 flex items-center gap-2"><Shield className="w-5 h-5"/> SafeBuy</span>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to scale</h2>
            <p className="mt-4 text-lg text-gray-600">Powerful features wrapped in a simple interface.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Store, title: "Instant Storefront", desc: "Get a professional, mobile-optimized store link to share on social media instantly." },
              { icon: Layout, title: "Easy Management", desc: "Add products, track stock, and manage orders from a simple, clean dashboard." },
              { icon: Zap, title: "AI-Powered Tools", desc: "Generate product descriptions and marketing captions automatically with AI." },
            ].map((feature, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24">
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-primary-900 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Ready to start your journey?</h2>
                <p className="text-primary-100 text-lg mb-10 max-w-2xl mx-auto relative z-10">Join thousands of entrepreneurs who trust WebJor to power their business.</p>
                <Link to="/signup" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-primary-900 bg-white rounded-xl hover:bg-gray-50 transition-colors relative z-10">
                    Create Your Store <ArrowRight className="ml-2 w-5 h-5"/>
                </Link>
            </div>
         </div>
      </section>
    </div>
  );
}