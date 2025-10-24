import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration object uses environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// --- CORE FIX: Check if Firebase is already initialized ---

let app;

// If no apps are initialized, initialize the app
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  // If an app is already running (e.g., from a hot reload or server-side pre-rendering), use it
  app = getApp();
}

// Initialize services from the app instance
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };