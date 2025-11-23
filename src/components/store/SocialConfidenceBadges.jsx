// src/components/store/SocialConfidenceBadges.jsx
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Truck } from 'lucide-react';
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
    const [isDataReady, setIsDataReady] = useState(false);
    
    const isBasicOrPro = currentPlanId === 'basic' || currentPlanId === 'pro';

    useEffect(() => {
        if (!isBasicOrPro || !functions) {
            setIsDataReady(true);
            return;
        }

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
                setIsDataReady(true);
            }
        };

        fetchCount();
    }, [functions, storeId, currentPlanId, isBasicOrPro, storeName]);

    // FIX: If Free Plan, show NOTHING to avoid "Public Shame".
    // Alternatively, show a generic static "Secure Shopping" badge so it doesn't look empty.
    if (currentPlanId === 'free') {
        return (
            <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
               <ShieldCheck className="w-4 h-4 text-gray-400" />
               <span>Secure Shopping</span>
            </div>
        );
    }
    
    if (!isDataReady) return null;

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