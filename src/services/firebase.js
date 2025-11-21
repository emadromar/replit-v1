import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// 1. Validate Environment Variables
function validateFirebaseConfig() {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    const errorMessage = `Missing required Firebase environment variables: ${missingVars.join(', ')}. Please check your .env file.`;
    console.error('❌ Firebase Configuration Error:', errorMessage);
    throw new Error(errorMessage);
  }
}

validateFirebaseConfig();

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// 2. Initialize Firebase
let app;
let auth;
let db;
let storage;
let functions;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app, 'us-central1');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message);
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

// 3. Connect to Emulators (Only on localhost)
// We check for 'localhost' or '127.0.0.1' to enable emulators.
// We explicitly EXCLUDE Replit environment if relevant, to ensure Replit uses live DB if desired.
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isReplit = !!import.meta.env.REPL_ID;

// Only use emulators if we are purely local (not on Replit)
if (isLocalhost && !isReplit) {
  console.log('🔧 Localhost detected: Connecting to Firebase Emulators');
  
  // Auth Emulator
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  
  // Firestore Emulator
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  
  // Storage Emulator
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  
  // Functions Emulator
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
} else {
  console.log('☁️ Production Mode: Using live Firebase services');
}

export { auth, db, storage, functions };
export default app;