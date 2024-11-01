import { firebaseConfig as testConfig } from "./firebase.test";
import { firebaseConfig as prodConfig } from "./firebase.prod";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig =
  process.env.REACT_APP_ENV === "production" ? prodConfig : testConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
