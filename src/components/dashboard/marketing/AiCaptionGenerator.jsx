// src/components/dashboard/marketing/AiCaptionGenerator.jsx
import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Sparkles, Copy, Loader2, Instagram, Heart, MessageCircle, Send, Bookmark, Check, Image as ImageIcon, Wand2 } from 'lucide-react';
import { useFirebaseServices } from '../../../contexts/FirebaseContext.jsx';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LockedFeatureCard } from '../../shared/LockedFeatureCard.jsx';
import { ProductImage } from '../../../ProductImage.jsx';
import { VisualProductPicker } from '../../shared/VisualProductPicker.jsx';

export function AiCaptionGenerator() {
   const { services, onOpenUpgradeModal } = useOutletContext();
   const { functions, db } = useFirebaseServices();
   const { store } = useOutletContext();

   const [products, setProducts] = useState([]);
   const [selectedProductId, setSelectedProductId] = useState('');
   const [captions, setCaptions] = useState([]);
   const [loading, setLoading] = useState(false);
   const [copiedIndex, setCopiedIndex] = useState(null);
   const [planLoading, setPlanLoading] = useState(true);

   const planId = store?.planId || 'free';
   const isPro = planId === 'pro';

   // Wait for plan data to load to prevent flash/blur
   useEffect(() => {
      if (store?.planId !== undefined) {
         setPlanLoading(false);
      }
   }, [store?.planId]);

   // Fetch all products
   useEffect(() => {
      if (!store?.id || !db || !isPro) return;
      const fetchProducts = async () => {
         try {
            const q = query(collection(db, 'stores', store.id, 'products'), orderBy('name'));
            const snap = await getDocs(q);
            setProducts(snap.docs.map(d => ({ id: d.id, name: d.data().name, imageUrl: d.data().imageUrl, price: d.data().price })));
         } catch (error) {
            console.error("Error fetching products:", error);
            const q = query(collection(db, 'stores', store.id, 'products'));
            const snap = await getDocs(q);
            const allProducts = snap.docs.map(d => ({ id: d.id, name: d.data().name, imageUrl: d.data().imageUrl, price: d.data().price }));
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

   // Show loading state while checking plan
   if (planLoading) {
      return (
         <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
         </div>
      );
   }

   if (!isPro) {
      return (
         <div className="p-4">
            <LockedFeatureCard
               title="Unlock Viral Social Content"
               description="Let AI generate engaging Instagram captions for your products automatically."
               icon={Sparkles}
               planName="Pro"
               onUpgrade={onOpenUpgradeModal}
            />
         </div>
      );
   }

   return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         {/* Left Column: Controls */}
         <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
               <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-gradient-to-tr from-primary-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/20">
                     <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Viral Caption Generator</h3>
                  <p className="text-sm text-gray-500 mt-2">Select a product, and let AI write engaging captions for your next post.</p>
               </div>

               <div className="space-y-6">
                  <div>
                     <label className="label mb-2 block font-medium text-gray-700">Select Product</label>
                     <VisualProductPicker
                        products={products}
                        selectedProductId={selectedProductId}
                        onChange={setSelectedProductId}
                     />
                  </div>

                  <button
                     onClick={handleGenerate}
                     disabled={loading || !selectedProductId}
                     className="btn-primary w-full py-3.5 flex justify-center items-center shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                     {loading ? (
                        <>
                           <Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating...
                        </>
                     ) : (
                        <>
                           <Wand2 className="w-5 h-5 mr-2" /> Generate Captions
                        </>
                     )}
                  </button>
               </div>
            </div>
         </div>

         {/* Right Column: Results */}
         <div className="lg:col-span-8">
            {captions.length === 0 && !loading ? (
               <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 px-6 py-12">
                  <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                     <Sparkles className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 text-xl">Ready to Create?</h3>
                  <p className="text-gray-500 max-w-md mx-auto text-center text-sm leading-relaxed mb-8">
                     Select a product from the left to generate 3-4 AI-powered captions optimized for engagement, hashtags included.
                  </p>

                  {/* Ghost Cards for Visual Interest */}
                  <div className="w-full max-w-md opacity-40 pointer-events-none select-none blur-[1px]">
                     <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-4">
                        <div className="flex items-center gap-3 mb-3">
                           <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                           <div className="h-3 w-24 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-48 bg-gray-100 rounded-lg mb-3"></div>
                        <div className="space-y-2">
                           <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                           <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                        </div>
                     </div>
                  </div>
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
                           className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                        >
                           {/* Instagram Header */}
                           <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50 bg-white">
                              <div className="flex items-center space-x-2.5">
                                 <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center border border-white shadow-sm">
                                    <span className="text-xs font-bold text-primary-700">{store?.name?.[0]?.toUpperCase() || 'S'}</span>
                                 </div>
                                 <span className="text-sm font-semibold text-gray-900">{store?.name || 'Your Store'}</span>
                              </div>
                              <button
                                 onClick={() => copyToClipboard(cap, i)}
                                 className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${copiedIndex === i
                                    ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                              >
                                 {copiedIndex === i ? (
                                    <>
                                       <Check className="w-3.5 h-3.5" />
                                       <span>Copied</span>
                                    </>
                                 ) : (
                                    <>
                                       <Copy className="w-3.5 h-3.5" />
                                       <span>Copy</span>
                                    </>
                                 )}
                              </button>
                           </div>

                           {/* Product Image */}
                           <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative group-hover:opacity-95 transition-opacity">
                              {selectedProduct?.imageUrl ? (
                                 <ProductImage
                                    src={selectedProduct.imageUrl}
                                    alt={selectedProduct.name}
                                    className="w-full h-full object-cover"
                                 />
                              ) : (
                                 <div className="flex flex-col items-center">
                                    <ImageIcon className="w-12 h-12 opacity-20 mb-2 text-gray-300" />
                                    <span className="text-xs text-gray-400">No product image</span>
                                 </div>
                              )}
                           </div>

                           {/* Actions */}
                           <div className="px-4 py-3 flex justify-between items-center border-b border-gray-50 bg-white">
                              <div className="flex space-x-4">
                                 <Heart className="w-6 h-6 text-gray-700 hover:text-red-500 cursor-pointer transition-colors hover:scale-110 transform duration-200" />
                                 <MessageCircle className="w-6 h-6 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors hover:scale-110 transform duration-200" />
                                 <Send className="w-6 h-6 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors hover:scale-110 transform duration-200" />
                              </div>
                              <Bookmark className="w-6 h-6 text-gray-700 hover:text-gray-900 cursor-pointer transition-colors hover:scale-110 transform duration-200" />
                           </div>

                           {/* Caption Content */}
                           <div className="px-4 py-4 bg-white">
                              <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                                 <span className="font-semibold mr-1.5">{store?.name || 'store'}</span>
                                 {cap}
                              </div>
                              <p className="text-[10px] text-gray-400 mt-3 uppercase tracking-wide font-medium">2 Hours Ago</p>
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