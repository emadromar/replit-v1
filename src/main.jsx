// src/main.jsx

import React, { Suspense } from 'react'; // <-- 1. Import Suspense
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

// --- THIS IS THE KEY ---
// We import the config file *before* anything else
// to make sure it's 100% loaded.
import './i18n.js'; 
// --- END KEY ---

// A simple fallback loader
const FullPageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f9fafb' }}>
    <svg className="animate-spin" style={{ width: '40px', height: '40px', color: '#4f46e5' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }}></path>
    </svg>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  // We removed StrictMode to prevent the double-render bugs
  
  // --- 2. WRAP EVERYTHING IN SUSPENSE ---
  // This tells React to show FullPageLoader until i18n is ready
  <Suspense fallback={<FullPageLoader />}>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </Suspense>
);