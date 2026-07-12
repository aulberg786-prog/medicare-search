import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

// Only initialize if required config is present
export const isFirebaseConfigured = Boolean(apiKey && projectId && appId);

let _db: ReturnType<typeof getFirestore> | null = null;

if (isFirebaseConfigured) {
  const firebaseConfig = {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId,
  };

  const app = getApps().length === 0
    ? initializeApp(firebaseConfig)
    : getApps()[0];

  _db = getFirestore(app);
}

export const db = _db;
