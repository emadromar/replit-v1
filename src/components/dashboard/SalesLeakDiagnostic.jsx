// src/components/dashboard/SalesLeakDiagnostic.jsx
import React from 'react';
import { AlertTriangle, Lock, ArrowRight, XCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- This is the new "Problem" component ---
const LeakItem = ({ text }) => (
  <div className="flex items-center">
    <XCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
    <span className="text-gray-800">{text}</span>
  </div>
);

export function SalesLeakDiagnostic({ onUpgrade, orders, products }) {
  const navigate = useNavigate();
  const hasTraffic = orders && orders.length > 0;
  const productCount = products ? products.length : 0;

  // --- 1. Smart "Diagnostic" Logic ---
  let title, subtext, leaks = [];
  
  if (hasTraffic) {
    // --- FOR STORES WITH TRAFFIC (They are leaking sales) ---
    title = "You Are Leaking Sales. We Found Why.";
    subtext = "Your store has visitors, but they're leaving. These are the leaks we detected that are stopping sales.";
    leaks = [
      { id: 'l1', text: "No 'Social Proof' (e.g., 'Someone in Amman just bought this')." },
      { id: 'l2', text: "No 'Urgency' (e.g., 'Selling Fast Today' tag)." },
      { id: 'l3', text: "Checkout hesitation (No 'AI Confidence Reviewer')." },
    ];
  } else {
    // --- FOR NEW STORES (They are not trusted) ---
    title = "The Real Reason No One Buys: They Don’t Trust You Yet.";
    subtext = "Online shoppers decide in seconds if a store feels safe. Right now, yours has 'red flags' that stop a sale.";
    leaks = [
      { id: 'l1', text: `Only ${productCount} products (Looks like a demo).` },
      { id: 'l2', text: "No Categories (Store looks messy)." },
      { id: 'l3', text: "No signs of activity (e.g., '2 people viewed this today')." },
    ];
  }

  const handleUpgrade = () => {
    if (onUpgrade) onUpgrade();
    else navigate('/dashboard/settings/plans');
  };

  // --- 2. New, Aggressive, Diagnostic-Style UI ---
  return (
    <div className="bg-white border-2 border-red-500 rounded-xl shadow-2xl overflow-hidden">
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="ml-4">
            <h3 className="text-xl font-semibold text-gray-900">
              {title}
            </h3>
            <p className="text-sm text-gray-500">
              This is stopping your store from growing.
            </p>
          </div>
        </div>
        
        <p className="text-gray-700 my-4">
          {subtext}
        </p>

        <div className="space-y-3 p-4 bg-red-50/50 rounded-lg">
          {leaks.map(leak => (
            <LeakItem key={leak.id} text={leak.text} />
          ))}
        </div>
      </div>

      <div className="p-6 bg-gray-50 border-t border-gray-100">
        <button
          onClick={handleUpgrade}
          className="btn-primary w-full text-base" // Bigger button
        >
          <Zap className="w-5 h-5 mr-2" />
          Upgrade to Fix All Leaks Instantly
        </button>
        <p className="text-xs text-gray-500 text-center mt-3">
          Activates all NCL features (Social Proof, Urgency, AI Reviews) in 1-click.
        </p>
      </div>
    </div>
  );
}