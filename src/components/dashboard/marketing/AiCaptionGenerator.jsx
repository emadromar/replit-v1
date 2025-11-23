// src/components/dashboard/marketing/AiCaptionGenerator.jsx
import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Sparkles, Copy, Loader2, Instagram, Heart, MessageCircle, Send, Bookmark, Check, Image as ImageIcon } from 'lucide-react';
import { useFirebaseServices } from '../../../contexts/FirebaseContext.jsx';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LockedFeatureCard } from '../../shared/LockedFeatureCard.jsx';
import { ProductImage } from '../../../ProductImage.jsx';

export function AiCaptionGenerator() {
   const { services, onOpenUpgradeModal } = useOutletContext();
   const { functions, db } = useFirebaseServices();
   const { store } = useOutletContext();

   const [products, setProducts] = useState([]);
   const [selectedProductId, setSelectedProductId] = useState('');
   const [captions, setCaptions] = useState([]);
   const [loading, setLoading] = useState(false);
   const [copiedIndex, setCopiedIndex] = useState(null);

   const planId = store?.planId || 'free';
   const isPro = planId === 'pro';

   // Fetch all products for the dropdown
   useEffect(() => {
      if (!store?.id || !db || !isPro) return;
      const fetchProducts = async () => {
         try {
            const q = query(collection(db, 'stores', store.id, 'products'), orderBy('name'));
            const snap = await getDocs(q);
            setProducts(snap.docs.map(d => ({ id: d.id, name: d.data().name, imageUrl: d.data().imageUrl })));
         } catch (error) {
            console.error("Error fetching products:", error);
            // Fallback if index is missing
            const q = query(collection(db, 'stores', store.id, 'products'));
            const snap = await getDocs(q);
            const allProducts = snap.docs.map(d => ({ id: d.id, name: d.data().name, imageUrl: d.data().imageUrl }));
            setProducts(allProducts.sort((a, b) => a.name.localeCompare(b.name)));
         }
      };
      fetchProducts();
   }, [store?.id, db, isPro]);

   const selectedProduct = products.find(p => p.id === selectedProductId);

   const handleGenerate = async () => {
      if (!selectedProduct) return;
      setLoading(true);
      setCaptions([]);
      try {
         const generate = httpsCallable(functions, 'generateInstagramCaptions');
         const result = await generate({
            productName: selectedProduct.name,
            storeName: store.name
         });
         setCaptions(result.data.captions || []);
      } catch (error) {
         console.error("AI Error:", error);
         setCaptions(["Error generating captions. Please try again."]);
      } finally {
         setLoading(false);
      }
   };

   const copyToClipboard = (text, index) => {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
   };

   if (!isPro) {
      return (
         <div className="p-4">
            <LockedFeatureCard
               title="Unlock Viral Social Content"
               description="Let AI generate engaging Instagram captions for your products automatically."
               icon={Instagram}
               planName="Pro"
               onUpgrade={onOpenUpgradeModal}
            />
         </div>
      );
   }

   return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Left Column: Controls */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-6">
               <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-pink-500/20">
                     <Instagram className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Viral Caption Generator</h3>
                  <p className="text-sm text-gray-500 mt-2">Select a product, and let AI write engaging captions for your next post.</p>
               </div>

               <div className="space-y-4">
                  <div>
                     <label className="label">Select Product</label>
                     <div className="relative">
                        <select
                           className="input w-full appearance-none"
                           value={selectedProductId}
                           onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                           <option value="">-- Choose a Product --</option>
                           {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                           <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                     </div>
                  </div>

                  <button
                     onClick={handleGenerate}
                     disabled={loading || !selectedProductId}
                     className="btn-primary w-full py-3 flex justify-center items-center shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02]"
                  >
                     {loading ? (
                        <>
                           <Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating...
                        </>
                     ) : (
                        <>
                           <Sparkles className="w-5 h-5 mr-2" /> Generate Captions
                        </>
                     )}
                  </button>
               </div>
            </div>
         </div>

         {/* Right Column: Results */}
         <div className="lg:col-span-8">
            {captions.length === 0 && !loading ? (
               <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                  <Instagram className="w-12 h-12 mb-3 opacity-20" />
                  <p className="font-medium">Select a product to generate captions</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence>
                     {captions.map((cap, i) => (
                        <motion.div
                           key={i}
                           initial={{ opacity: 0, y: 20 }}
                           animate={{ opacity: 1, y: 0 }}
                           transition={{ delay: i * 0.1 }}
                           className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                           {/* Mock Instagram Header */}
                           <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                              <div className="flex items-center space-x-2">
                                 <div className="w-8 h-8 bg-gray-100 rounded-full overflow-hidden">
                                    {/* Store Logo Placeholder */}
                                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                                 </div>
                                 <span className="text-sm font-semibold text-gray-900">{store?.name || 'Your Store'}</span>
                              </div>
                              <button onClick={() => copyToClipboard(cap, i)} className="text-primary-600 hover:text-primary-700 text-xs font-semibold">
                                 {copiedIndex === i ? 'Copied!' : 'Copy'}
                              </button>
                           </div>

                           {/* Product Image */}
                           <div className="aspect-square bg-gray-100 flex items-center justify-center text-gray-300 overflow-hidden relative">
                              {selectedProduct?.imageUrl ? (
                                 <ProductImage
                                    src={selectedProduct.imageUrl}
                                    alt={selectedProduct.name}
                                    className="w-full h-full object-cover"
                                 />
                              ) : (
                                 <div className="flex flex-col items-center">
                                    <ImageIcon className="w-12 h-12 opacity-20 mb-2" />
                                    <span className="text-xs text-gray-400">No product image</span>
                                 </div>
                              )}
                           </div>

                           {/* Actions */}
                           <div className="px-4 py-3 flex justify-between items-center">
                              <div className="flex space-x-4">
                                 <Heart className="w-6 h-6 text-gray-800 hover:text-red-500 cursor-pointer transition-colors" />
                                 <MessageCircle className="w-6 h-6 text-gray-800 cursor-pointer" />
                                 <Send className="w-6 h-6 text-gray-800 cursor-pointer" />
                              </div>
                              <Bookmark className="w-6 h-6 text-gray-800 cursor-pointer" />
                           </div>

                           {/* Caption Content */}
                           <div className="px-4 pb-4">
                              <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                 <span className="font-semibold mr-2">{store?.name || 'store'}</span>
                                 {cap}
                              </div>
                              <p className="text-xs text-gray-400 mt-2 uppercase tracking-wide">2 HOURS AGO</p>
                           </div>
                        </motion.div>
                     ))}
                  </AnimatePresence>
               </div>
            )}
         </div>
      </div>
   );
}