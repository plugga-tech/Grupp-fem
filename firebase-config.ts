// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import{getFirestore} from "firebase/firestore"
import{getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const analytics = getAnalytics(app);

//initialize Cloude Firestore and get a reference to the service
export const db = getFirestore(app);
const auth = getAuth(app);