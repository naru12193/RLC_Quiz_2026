import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  writeBatch
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAT2r4yWWeAXSAb48Daoa4_KqzZjU07Cho",
  authDomain: "rlcquiz.firebaseapp.com",
  projectId: "rlcquiz",
  storageBucket: "rlcquiz.firebasestorage.app",
  messagingSenderId: "343164931209",
  appId: "1:343164931209:web:f6efbd9c403686afd7ca58",
  measurementId: "G-6Z08D0DDB5"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Auth & Providers
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Firestore Database
export const db = getFirestore(app);

// Firestore Collections & Doc References
export const CONFIG_DOC = 'quiz_settings';
export const QUESTIONS_COLLECTION = 'questions';
export const SUBMISSIONS_COLLECTION = 'submissions';
export const ADMIN_EMAIL = 'naru12193@gmail.com';

export {
  signInWithPopup,
  firebaseSignOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
};

export default app;
