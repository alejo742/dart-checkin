// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD12F423dlaWX6v54th5ck952HgNeFMcuo",
  authDomain: "dart-checkin.firebaseapp.com",
  projectId: "dart-checkin",
  storageBucket: "dart-checkin.firebasestorage.app",
  messagingSenderId: "740770799500",
  appId: "1:740770799500:web:4e22e9e9d5b322578cc0a9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);