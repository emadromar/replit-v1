// src/components/store/SocialConfidenceBadges.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Users, Truck, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useFirebaseServices } from '../../contexts/FirebaseContext';
import { httpsCallable } from 'firebase/functions';

// Data for the badges
const badgeDetails = {
    'verified': { icon: ShieldCheck, color: 'text-green-600', text: 'Verified Merchant' },
    'trusted': { icon: Users, color: 'text-indigo-600', text: 'Trusted by {count} Shoppers' },
    'delivery': { icon: Truck, color: 'text-orange-600', text: 'Fast Delivery in Jordan' },
};

export function SocialConfidenceBadges({ storeId, storeName, currentPlanId }) {
    const { services } = useFirebaseServices();
    const functions = services?.functions;
    
    const [trustedCount, setTrustedCount] = useState(0);
    const [isDataReady, setIsDataReady] = useState(false); // Tracks whether fetch attempt is complete
    
    const isBasicOrPro = currentPlanId === 'basic' || currentPlanId === 'pro';

    useEffect(() => {
        if (!isBasicOrPro || !functions) return;

        const fetchCount = async () => {
            try {
                const getEvents = httpsCallable(functions, 'getStoreEvents');
                const result = await getEvents({ 
                    planId: currentPlanId, 
                    storeName: storeName 
                });
                
                if (result.data && result.data.trustedByCount) {
                    setTrustedCount(result.data.trustedByCount);
                }
            } catch (error) {
                console.error("Error fetching trusted count:", error);
            } finally {
                setIsDataReady(true); // Mark ready, even if count is 0
            }
        };

        fetchCount();
    }, [functions, storeId, currentPlanId, isBasicOrPro, storeName]);

    // --- LOCKED STATE (Free Plan Pain on Public Page) ---
    if (currentPlanId === 'free') {
        return (
            <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center border border-gray-200 mt-4">
                <div className="flex items-center text-sm text-gray-600">
                    <Lock className="w-4 h-4 mr-2" />
                    <span className="font-semibold">People don't buy from strangers. Fix that.</span>
                </div>
                <Link to="/pricing" className="text-xs font-semibold text-primary-700 hover:underline flex items-center">
                    Unlock Trust Signals <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
            </div>
        );
    }
    
    // FIX: If data is not ready, return null (hide the component entirely)
    if (!isDataReady) {
        return null;
    }

    const badges = [
        { key: 'verified', count: 1 },
        { key: 'delivery', count: 1 },
        { key: 'trusted', count: trustedCount },
    ].filter(b => b.count > 0);

    return (
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
            {badges.map((badge) => {
                const detail = badgeDetails[badge.key];
                const text = detail.text.replace('{count}', badge.count);
                const Icon = detail.icon;

                return (
                    <div key={badge.key} className="flex items-center space-x-1.5">
                        <Icon className={`w-4 h-4 ${detail.color}`} />
                        <span className="text-sm font-medium text-gray-600">{text}</span>
                    </div>
                );
            })}
        </div>
    );
}