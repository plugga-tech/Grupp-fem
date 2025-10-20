// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0aZCs8LFREGXp8AAiApoAzuFjcCQeWpY",
  authDomain: "gruppfem-cf51c.firebaseapp.com",
  projectId: "gruppfem-cf51c",
  storageBucket: "gruppfem-cf51c.firebasestorage.app",
  messagingSenderId: "225077930671",
  appId: "1:225077930671:web:c5b46809b15c292c01825a",
  measurementId: "G-MDYSNZGZHR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics (only for web)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };
