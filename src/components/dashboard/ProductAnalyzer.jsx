// src/components/dashboard/ProductAnalyzer.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, CheckCircle, ArrowRight, Lock, Loader2, MessageSquare } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { Link, useNavigate } from 'react-router-dom';
import { LockedFeatureCard } from '../shared/LockedFeatureCard.jsx';

export function ProductAnalyzer({ product, store, onOpenUpgradeModal, services, showError }) {
    const { functions } = services;
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const currentPlanId = store?.planId || 'free';
    const isPro = currentPlanId === 'pro';

    // The key handler: runs the analysis
    const runAnalysis = async () => {
        if (!product) return;
        setIsLoading(true);
        setAnalysisResult(null);

        try {
            const analyze = httpsCallable(functions, 'analyzeProduct');
            const result = await analyze({ 
                product: product,
                planId: currentPlanId,
                store: { id: store.id, name: store.name }
            });
            
            if (result.data && result.data.issues) {
                setAnalysisResult(result.data.issues);
            } else {
                throw new Error("Analysis failed to return results.");
            }
        } catch (error) {
            showError(`Analyzer Error: ${error.message}`);
            console.error("Analyzer Error:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Auto-run analysis when component mounts or product changes
    useEffect(() => {
        runAnalysis();
    }, [product?.id]); 

    if (!product) return null;

    // UI for a single issue/leak
    const LeakItem = ({ issue }) => (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <h4 className="flex items-start font-semibold text-red-800">
                <AlertTriangle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                {issue.text}
            </h4>
            <p className="mt-1 text-sm text-gray-700 ml-7">
                Fix: {issue.fixLink ? (
                    <Link to={issue.fixLink} className="font-semibold underline text-primary-700 hover:text-primary-600">
                        {issue.fix}
                    </Link>
                ) : (
                    issue.fix
                )}
            </p>
        </div>
    );
    
    // UI for Pro-exclusive AI Coach (Placeholder for conversational analysis)
    const AiCoachTeaser = () => (
        <LockedFeatureCard
            title="AI Sales Coach (Pro)"
            description="Get conversational advice and personalized marketing strategies based on your sales data."
            icon={MessageSquare}
            planName="Pro"
            onUpgrade={onOpenUpgradeModal}
        />
    );


    return (
        <div className="card p-6 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Zap className="w-6 h-6 mr-3 text-red-600" />
                "Why No One Buys" Analyzer
            </h2>
            <p className="text-gray-600">
                This report inspects {product.name} and identifies critical errors that are stopping your customers from buying.
            </p>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                        <span className="ml-3 font-medium text-gray-700">Running diagnostic...</span>
                    </div>
                ) : analysisResult && analysisResult.length > 0 ? (
                    // --- Leaks Found UI ---
                    <motion.div 
                        key="leaks-found"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <h3 className="text-xl font-semibold text-red-700">
                            🚨 {analysisResult.length} Critical Sales Leaks Found:
                        </h3>
                        {analysisResult.map((issue) => (
                            <LeakItem key={issue.id} issue={issue} />
                        ))}
                        
                        {/* --- Pro-Only Feature --- */}
                        {analysisResult.length > 0 && !isPro && (
                            <div className="mt-6">
                                <AiCoachTeaser />
                            </div>
                        )}

                        <button onClick={runAnalysis} className="btn-secondary mt-4">
                            Re-Run Analysis
                        </button>

                    </motion.div>
                ) : (
                    // --- No Leaks Found UI ---
                    <motion.div 
                        key="no-leaks"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-10 bg-green-50 rounded-xl"
                    >
                        <CheckCircle className="w-10 h-10 mx-auto text-green-600" />
                        <h3 className="mt-3 text-xl font-semibold text-green-800">
                            Perfect Score! No Sales Leaks Detected.
                        </h3>
                        <p className="text-gray-600 mt-1">
                            Your product page is optimized for conversion.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
            
        </div>
    );
}