import React, { useState } from 'react';
import { Mail, Clock, ArrowRight, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function AbandonedCartRecovery() {
    const [recoveringId, setRecoveringId] = useState(null);
    const [recoveredIds, setRecoveredIds] = useState([]);

    // Mock Data for "Abandoned Carts"
    const abandonedCarts = [
        { id: 'ac_1', customer: 'Sarah J.', items: 3, value: '45.00', time: '2 hours ago', status: 'pending' },
        { id: 'ac_2', customer: 'Mike T.', items: 1, value: '19.00', time: '5 hours ago', status: 'pending' },
        { id: 'ac_3', customer: 'Emma W.', items: 4, value: '120.00', time: '1 day ago', status: 'pending' },
    ];

    const handleRecover = (id) => {
        setRecoveringId(id);
        // Simulate API call
        setTimeout(() => {
            setRecoveringId(null);
            setRecoveredIds(prev => [...prev, id]);
        }, 1500);
    };

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Abandoned Cart Recovery</h2>
                        <p className="text-gray-500 text-sm">Recover lost sales by emailing customers who left.</p>
                    </div>
                </div>

                <div className="flex gap-4 mt-6">
                    <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-semibold text-gray-700">3 Carts at Risk</span>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-semibold text-gray-700">Potential Revenue: $184.00</span>
                    </div>
                </div>
            </div>

            <div className="p-6">
                <div className="space-y-4">
                    {abandonedCarts.map((cart) => {
                        const isRecovered = recoveredIds.includes(cart.id);
                        const isRecovering = recoveringId === cart.id;

                        return (
                            <motion.div
                                key={cart.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isRecovered ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100 hover:border-blue-100 hover:shadow-md'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isRecovered ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        {cart.customer.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${isRecovered ? 'text-green-800' : 'text-gray-900'}`}>{cart.customer}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> {cart.time} • {cart.items} items
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <p className="font-bold text-gray-900">${cart.value}</p>
                                        <p className="text-xs text-gray-400">Cart Value</p>
                                    </div>

                                    <button
                                        onClick={() => !isRecovered && handleRecover(cart.id)}
                                        disabled={isRecovered || isRecovering}
                                        className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all ${isRecovered
                                                ? 'bg-green-100 text-green-700 cursor-default'
                                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-blue-200'
                                            }`}
                                    >
                                        {isRecovering ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : isRecovered ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Sent
                                            </>
                                        ) : (
                                            <>
                                                Recover
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
