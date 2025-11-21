// src/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi) // 1. Loads translations from /public/locales
  .use(LanguageDetector) // 2. Detects user language
  .use(initReactI18next) // 3. Binds to React
  .init({
    // IMPORTANT: 'en' is fallback, but 'lng' will be loaded by detector
    fallbackLng: 'en', 
    
    // Config for LanguageDetector
    detection: {
      // 1. Check localStorage first (this is the 10000% fix)
      // 2. Then check browser
      // 3. Then check HTML tag
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Tell it to SAVE the user's choice to localStorage
      caches: ['localStorage'],
    },
    
    // Config for HttpApi
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Default settings
    ns: ['common'],
    defaultNS: 'common',
    supportedLngs: ['en', 'ar'],
    
    // This tells i18next to wait for language files
    // This works with the <Suspense> wrapper in main.jsx
    react: {
      useSuspense: true, 
    },
  });

export default i18n;