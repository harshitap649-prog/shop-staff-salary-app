import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { initializeFirestore, persistentLocalCache } from "firebase/firestore";
import { getAnalytics, type Analytics } from "firebase/analytics";

// IMPORTANT: Replace these values with your own Firebase project config.
// Get them from Firebase Console > Project Settings > General > Your apps > Config snippet.
export const firebaseConfig = {
  apiKey: "AIzaSyA-upemtfktWdj07ZMuYgbpE2ROirYZh5I",
  authDomain: "shop-staff-salary-app.firebaseapp.com",
  projectId: "shop-staff-salary-app",
  storageBucket: "shop-staff-salary-app.firebasestorage.app",
  messagingSenderId: "1024609313304",
  appId: "1:1024609313304:web:13c24d9ae56413750e596d",
  measurementId: "G-CQHWHPD6LT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Authentication with browser local persistence
export const auth = getAuth(app);

// Set persistence so user stays logged in on the device until clicking Logout
// Called at import time (without top-level await, which this project's TS
// target does not support) so persistence is configured before any auth
// operation runs. Errors are logged below.
setPersistence(auth, browserLocalPersistence).catch((err: unknown) => {
  const e = err as { code?: string };
  if (e.code === "failed-precondition") {
    console.warn("Persistence failed: multiple tabs open at once.");
  } else if (e.code === "unimplemented") {
    console.warn("Persistence is not supported in this browser.");
  } else {
    console.warn("Persistence failed with unexpected error:", err);
  }
});

// Cloud Firestore with offline persistence enabled
// For Firebase v10/v11+, use initializeFirestore with `localCache:
// persistentLocalCache()` (getFirestore() does not accept settings).
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

// Analytics - only in browser environments where supported
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Firebase Analytics not available:", e);
  }
}
export { analytics };
