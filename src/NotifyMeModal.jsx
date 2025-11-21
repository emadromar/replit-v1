import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Input } from './Forminput.jsx'; // <-- This is the key fix


export function NotifyMeModal({ isOpen, onClose, product, onSubmit }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || !email) return;

    setLoading(true);
    await onSubmit(email);
    setLoading(false);
    setEmail('');
  };

  if (!isOpen || !product) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Get Notified</h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Enter your email to be notified when <strong>{product.name}</strong> is back in stock.
          </p>
          <Input
            id="notify-email"
            type="email"
            label="Your Email Address"
            value={email}
            onChange={setEmail}
            required
            autoComplete="email"
          />

          <div className="pt-4 border-t border-gray-200 flex justify-end">
            <button 
              type="submit" 
              disabled={loading || !email}
              className="w-full flex justify-center items-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Notify Me'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}