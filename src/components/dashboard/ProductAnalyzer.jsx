// src/components/dashboard/ProductAnalyzer.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, CheckCircle, ArrowRight, Lock, Loader2, MessageSquare, ChevronRight, Search, BarChart3, ShieldAlert, Timer } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { Link, useNavigate } from 'react-router-dom';
import { LockedFeatureCard } from '../shared/LockedFeatureCard.jsx';

export function ProductAnalyzer({ product, store, onOpenUpgradeModal, services, showError }) {
    const { functions } = services;
    const [analysisResult, setAnalysisResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [scanStep, setScanStep] = useState(0);

    const currentPlanId = store?.planId || 'free';
    const isPro = currentPlanId === 'pro';

    const SCAN_STEPS = [
        { text: "Analyzing product imagery...", icon: Search },
        { text: "Checking description copy...", icon: MessageSquare },
        { text: "Verifying pricing strategy...", icon: BarChart3 },
        { text: "Detecting trust signals...", icon: ShieldAlert },
    ];

    // Simulate scanning steps
    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setScanStep(prev => (prev + 1) % SCAN_STEPS.length);
            }, 800);
            return () => clearInterval(interval);
        } else {
            setScanStep(0);
        }
    }, [isLoading]);

    const runAnalysis = async () => {
        if (!product) return;
        setIsLoading(true);
        setAnalysisResult(null);

        try {
            // Artificial delay to show off the scanning animation (UX psychology: perceived value)
            await new Promise(resolve => setTimeout(resolve, 2500));

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

    const score = analysisResult ? Math.max(0, 100 - (analysisResult.length * 15)) : 100;
    const getScoreColor = (s) => {
        if (s >= 90) return 'text-green-600 bg-green-50 border-green-200';
        if (s >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <div className="p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl mr-3 shadow-sm">
                            <Zap className="w-6 h-6 text-amber-600" />
                        </div>
                        Conversion Audit
                    </h2>
                    <p className="text-gray-500 mt-2 ml-14 max-w-xl text-sm">
                        AI-powered inspection of <span className="font-semibold text-gray-900">{product.name}</span> to find sales leaks.
                    </p>
                </div>
                {!isLoading && (
                    <button
                        onClick={runAnalysis}
                        className="btn-secondary text-sm px-5 py-2.5 flex items-center shadow-sm hover:shadow-md transition-all bg-white border border-gray-200 text-gray-700 font-medium rounded-xl"
                    >
                        <Zap className="w-4 h-4 mr-2 text-amber-500" /> Re-Scan Page
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-25"></div>
                            <div className="relative bg-white p-4 rounded-full border-2 border-primary-100 shadow-lg">
                                <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-900 text-xl mt-6 mb-2">Scanning Product Page...</h3>
                        <div className="h-6 overflow-hidden relative w-64 text-center">
                            <AnimatePresence mode="wait">
                                <motion.p
                                    key={scanStep}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="text-gray-500 text-sm flex items-center justify-center gap-2 absolute w-full"
                                >
                                    {React.createElement(SCAN_STEPS[scanStep].icon, { className: "w-4 h-4" })}
                                    {SCAN_STEPS[scanStep].text}
                                </motion.p>
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ) : analysisResult ? (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* Scorecard */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row items-center gap-8">
                            <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 ${getScoreColor(score)}`}>
                                <span className="text-3xl font-black">{score}</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">Score</span>
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {score === 100 ? "Perfect Optimization!" :
                                        score >= 80 ? "Good, but room for improvement." :
                                            "Critical Issues Detected"}
                                </h3>
                                <p className="text-gray-500 max-w-lg">
                                    {score === 100
                                        ? "Your product page is primed for sales. No major leaks detected."
                                        : `We found ${analysisResult.length} issues that might be hurting your conversion rate. Fix them to boost sales.`}
                                </p>
                            </div>
                        </div>

                        {/* Issues List */}
                        {analysisResult.length > 0 && (
                            <div className="grid gap-4">
                                {analysisResult.map((issue, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white p-5 rounded-xl border border-gray-200 hover:border-primary-200 hover:shadow-md transition-all group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-red-50 rounded-lg text-red-600 flex-shrink-0">
                                                <AlertTriangle className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-gray-900 text-base mb-1.5">
                                                    {issue.text}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                                                        Action Required
                                                    </span>
                                                    {issue.fixLink ? (
                                                        <Link to={issue.fixLink} className="text-sm font-semibold text-gray-600 hover:text-primary-600 flex items-center transition-colors">
                                                            Fix this now <ChevronRight className="w-4 h-4 ml-0.5" />
                                                        </Link>
                                                    ) : (
                                                        <span className="text-sm text-gray-500">{issue.fix}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Pro Feature Teaser */}
                        {!isPro && analysisResult.length > 0 && (
                            <div className="mt-8">
                                <LockedFeatureCard
                                    title="AI Sales Coach (Pro)"
                                    description="Get a personalized step-by-step plan to fix these issues and double your conversion rate."
                                    icon={MessageSquare}
                                    planName="Pro"
                                    onUpgrade={onOpenUpgradeModal}
                                />
                            </div>
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}