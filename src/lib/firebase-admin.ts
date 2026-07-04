import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
  try {
    if (firebaseConfig.projectId && firebaseConfig.privateKey) {
      initializeApp({
        credential: cert(firebaseConfig as any),
      });
    } else {
      // Fallback for Vercel build time when secrets might not be loaded
      initializeApp({ projectId: 'demo-project' });
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
    // Ensure an app always exists to prevent getFirestore() from throwing
    if (!getApps().length) {
      initializeApp({ projectId: 'demo-project' });
    }
  }
}

export const db = getFirestore();
export const auth = getAuth();
