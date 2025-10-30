// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDuEF3VfocIiX58lCMEjzfY9U1hmYyP-38",
  authDomain: "abdekk-aee3e.firebaseapp.com",
  projectId: "abdekk-aee3e",
  storageBucket: "abdekk-aee3e.appspot.com",
  messagingSenderId: "510387531593",
  appId: "1:510387531593:web:ce55adce44ba07c8d77498",
  measurementId: "G-T9LH2Q2N5Y",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, analytics, auth, provider, db };
