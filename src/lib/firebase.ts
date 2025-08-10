import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your Firebase configuration
// You'll need to replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

// Check if we have valid Firebase configuration
const hasValidConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN && 
                      import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Initialize Firebase only if we have valid config
let app;
let auth;
let googleProvider;

try {
  if (hasValidConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
  } else {
    console.warn('Firebase configuration not found. Authentication will be disabled.');
    // Create mock objects for development
    auth = null;
    googleProvider = null;
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  auth = null;
  googleProvider = null;
}

export { auth, googleProvider };
export default app;
