import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Zap, Plus, BarChart3 } from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { ProductAnalyzer } from '../ProductAnalyzer.jsx';
import { VisualProductPicker } from '../../shared/VisualProductPicker.jsx';

export function ProductAnalyzerSection() {
    const { store, services, showError, onOpenUpgradeModal } = useOutletContext();
    const { db } = services;

    // Product State for Analyzer
    const [products, setProducts] = useState([]);
    const [selectedProductId, setSelectedProductId] = useState('');
    const [loadingProducts, setLoadingProducts] = useState(true);

    // Ref to store runAnalysis function from ProductAnalyzer
    const runAnalysisRef = useRef(null);

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
    }, [store?.id, db, selectedProductId]);

    const selectedProduct = products.find(p => p.id === selectedProductId);

    // Handle Re-Scan button click
    const handleRescan = () => {
        if (runAnalysisRef.current) {
            runAnalysisRef.current();
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col gap-4 mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">Analyze Product Performance</h3>
                        <p className="text-sm text-gray-600">Get AI-driven insights on why your product might not be selling.</p>
                    </div>
                    <div className="w-full">
                        <label className="label mb-2">Select Product</label>
                        <VisualProductPicker
                            products={products}
                            selectedProductId={selectedProductId}
                            onChange={setSelectedProductId}
                        />
                    </div>
                </div>

                {/* Enhanced Empty State with Loading */}
                {loadingProducts ? (
                    <div className="flex justify-center items-center p-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-6">
                            <BarChart3 className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Find Your Sales Leaks
                        </h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm leading-relaxed">
                            Add a product to get AI-powered insights on why it's not converting and actionable steps to fix it.
                        </p>

                        {/* Ghost Card for Visual Interest */}
                        <div className="w-full max-w-sm opacity-50 pointer-events-none select-none blur-[1px] mb-8">
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-50 rounded-lg"></div>
                                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                                </div>
                                <div className="h-2 w-full bg-gray-100 rounded"></div>
                                <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                            </div>
                        </div>

                        <Link to="/products" className="btn-primary inline-flex items-center px-6 py-2.5">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Product
                        </Link>
                    </div>
                ) : selectedProduct ? (
                    <ProductAnalyzer
                        product={selectedProduct}
                        store={store}
                        services={services}
                        onOpenUpgradeModal={onOpenUpgradeModal}
                        showError={showError}
                        onAnalysisReady={(runFn) => { runAnalysisRef.current = runFn; }}
                    />
                ) : null}
            </div>
        </div>
    );
}
