import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDcdYL3oFUGKHq_sPiUXp_gjU-dXjEdZqM",
  authDomain: "farmmanager-5e139.firebaseapp.com",
  projectId: "farmmanager-5e139",
  storageBucket: "farmmanager-5e139.firebasestorage.app",
  messagingSenderId: "75280082296",
  appId: "1:75280082296:web:d2689948d8b09a039ad48d",
  measurementId: "G-XS2BB7TB7P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
