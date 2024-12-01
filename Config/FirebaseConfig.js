import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getDatabase } from "firebase/database";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'; 

const firebaseConfig = {
  apiKey: "HIDDEN",
  authDomain: "HIDDEN",
  databaseURL: "HIDDEN",
  projectId: "HIDDEN",
  storageBucket: "HIDDEN",
  messagingSenderId: "HIDDEN",
  appId: "HIDDEN",
  measurementId: "HIDDEN"
};

// Initialize Firebase 
const app = initializeApp(firebaseConfig);

// Auth with persistence (using AsyncStorage)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Realtime Database
const db = getDatabase(app);

export { auth, db }; 
