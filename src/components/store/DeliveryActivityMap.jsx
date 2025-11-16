// src/components/store/DeliveryActivityMap.jsx
import React, { useState, useEffect } from 'react';
import { MapPin, Truck, Clock, Loader2 } from 'lucide-react';
import { useFirebaseServices } from '../../contexts/FirebaseContext';
import { httpsCallable } from 'firebase/functions';

function timeSince(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes";
    return Math.floor(seconds) + " seconds";
}

export function DeliveryActivityMap({ storeId, storeName, currentPlanId }) {
    const { services } = useFirebaseServices();
    const functions = services?.functions;
    
    const [events, setEvents] = useState([]);
    const [isDataReady, setIsDataReady] = useState(false); // Tracks whether fetch attempt is complete

    const isPro = currentPlanId === 'pro';

    useEffect(() => {
        if (!isPro || !functions) return; 

        const fetchEvents = async () => {
            try {
                const getEvents = httpsCallable(functions, 'getStoreEvents');
                const result = await getEvents({ 
                    planId: currentPlanId, 
                    storeName: storeName 
                });
                
                if (result.data && result.data.events) {
                    const purchaseEvents = result.data.events
                        .filter(e => e.type === 'PURCHASE')
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    setEvents(purchaseEvents.slice(0, 5)); // Show top 5 recent sales
                }
            } catch (error) {
                console.error("Error fetching delivery activity:", error);
            } finally {
                setIsDataReady(true); // Mark ready
            }
        };

        fetchEvents();
    }, [functions, storeId, currentPlanId, isPro, storeName]);

    // Final check to prevent rendering or show loader
    if (!isPro) return null; // Locked for Free/Basic
    if (!isDataReady) return null; // Hide until data is ready
    
    // Get unique locations and the last purchase time
    const recentActivity = events.reduce((acc, event) => {
        const existing = acc.find(item => item.location === event.location);
        if (!existing) {
            acc.push({ location: event.location, timestamp: new Date(event.timestamp) });
        }
        return acc;
    }, []).slice(0, 3); // Show top 3 locations

    return (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-orange-600" />
                Recent Delivery Activity
            </h3>
            <div className="space-y-2">
                {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-gray-700 font-medium">
                            <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                            Order delivered in {activity.location}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {timeSince(activity.timestamp)} ago
                        </span>
                    </div>
                ))}
            </div>
            {recentActivity.length === 0 && (
                <p className="text-sm text-gray-500">No recent delivery activity to display.</p>
            )}
        </div>
    );
}