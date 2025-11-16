import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getFunctions } from 'firebase/functions'

// Validate that all required Firebase environment variables are present
function validateFirebaseConfig() {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ]

  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  )

  if (missingVars.length > 0) {
    const errorMessage = `Missing required Firebase environment variables: ${missingVars.join(', ')}. Please check your .env file.`
    console.error('❌ Firebase Configuration Error:', errorMessage)
    throw new Error(errorMessage)
  }

  console.log('✅ All Firebase environment variables are present')
}

// Validate environment variables before initializing
validateFirebaseConfig()

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase with error handling
let app
let auth
let db
let storage
let functions

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  storage = getStorage(app)
  functions = getFunctions(app, 'us-central1')
  console.log('✅ Firebase initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error.message)
  throw new Error(`Firebase initialization failed: ${error.message}. Please check your configuration.`)
}

// If running locally, connect to emulator
if (location.hostname === 'localhost' || location.hostname === '192.168.1.40' || location.hostname === '127.0.0.1') {
  import('firebase/functions').then(({ connectFunctionsEmulator }) => {
    // --- FIX: Dynamically set the host based on the browser's current address ---
    // This resolves CORS errors by ensuring the emulator URL matches the app's URL.
    const emulatorHost = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') 
        ? '127.0.0.1' 
        : '192.168.1.40';
    connectFunctionsEmulator(functions, emulatorHost, 5001)
  })
}

export { auth, db, storage, functions }
export default app
