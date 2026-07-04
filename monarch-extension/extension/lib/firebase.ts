import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAEQ-RBHo8HL4t0b9ZyWEf4TH-n6e5LVZw",
  authDomain: "monarch-6e8ae.firebaseapp.com",
  projectId: "monarch-6e8ae",
  storageBucket: "monarch-6e8ae.firebasestorage.app",
  messagingSenderId: "157617031834",
  appId: "1:157617031834:web:1822ec6ab20325017ded23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

/**
 * Utility to save learning telemetry (entropy, video completion, etc) to Firestore directly from extension
 */
export async function submitTelemetryToFirebase(type: "leetcode" | "youtube", data: any, userId: string = "anonymous") {
  try {
    const telemetryRef = collection(db, "telemetry");
    await addDoc(telemetryRef, {
      userId,
      type,
      ...data,
      timestamp: Date.now()
    });
    console.log(`[Monarch] Successfully submitted ${type} telemetry to Firebase`);
  } catch (error) {
    console.error("[Monarch] Failed to submit telemetry to Firebase:", error);
  }
}
