// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "animuizu",
  "appId": "1:1065309147190:web:5de5a9fac677f39432c897",
  "storageBucket": "animuizu.firebasestorage.app",
  "apiKey": "AIzaSyDAUqHe3LjqVV2YTkq0YuX8H_KUc_WjGnk",
  "authDomain": "animuizu.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1065309147190"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
