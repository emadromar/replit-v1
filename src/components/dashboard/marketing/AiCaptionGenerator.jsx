// src/components/dashboard/marketing/AiCaptionGenerator.jsx
import React, { useState, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { Sparkles, Copy, Loader2, Instagram } from 'lucide-react';
import { useFirebaseServices } from '../../../contexts/FirebaseContext.jsx';
import { useOutletContext } from 'react-router-dom';

export function AiCaptionGenerator() {
  const { services } = useOutletContext(); // Access services from layout context if available, or use hook
  const { functions, db } = useFirebaseServices(); 
  const { store } = useOutletContext();
  
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [captions, setCaptions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch a few products to populate the dropdown
  useEffect(() => {
    if (!store?.id || !db) return;
    const fetchProducts = async () => {
        const q = query(collection(db, 'stores', store.id, 'products'), limit(10));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
    };
    fetchProducts();
  }, [store?.id, db]);

  const handleGenerate = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    setCaptions([]);
    try {
        const generate = httpsCallable(functions, 'generateInstagramCaptions');
        const result = await generate({ 
            productName: selectedProduct, 
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

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200">
       <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg">
             <Instagram className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Viral Caption Generator</h3>
          <p className="text-sm text-gray-500">Select a product, and let AI write your post.</p>
       </div>

       <div className="flex gap-2 mb-6">
          <select 
            className="input flex-1" 
            value={selectedProduct} 
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
             <option value="">-- Select Product --</option>
             {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <button 
            onClick={handleGenerate} 
            disabled={loading || !selectedProduct}
            className="btn-primary w-auto"
          >
             {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          </button>
       </div>

       <div className="space-y-3">
          {captions.map((cap, i) => (
             <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 group relative hover:bg-gray-100 transition-colors">
                <p className="text-sm text-gray-700 leading-relaxed pr-8">{cap}</p>
                <button 
                    onClick={() => navigator.clipboard.writeText(cap)} 
                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-primary-600 bg-white rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    title="Copy"
                >
                    <Copy className="w-4 h-4" />
                </button>
             </div>
          ))}
       </div>
    </div>
  );
}