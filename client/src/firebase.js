import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY?.trim(),
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET?.trim(),
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID?.trim(),
  appId: process.env.REACT_APP_ID?.trim(),
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
