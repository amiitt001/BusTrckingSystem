import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyDq1pFuECIZIOYHssmtO0DqWwCiK_mUMvI",
    authDomain: "bustrackingsystem-c7689.firebaseapp.com",
    databaseURL: "https://bustrackingsystem-c7689-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "bustrackingsystem-c7689",
    storageBucket: "bustrackingsystem-c7689.firebasestorage.app",
    messagingSenderId: "481259863828",
    appId: "1:481259863828:web:084e5445da92a67d338c01"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
