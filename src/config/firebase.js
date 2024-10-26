import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDjR0_emsqGEVSCDaI7r9jRpSixIgTcTGI",
  authDomain: "tennis-booking-20676.firebaseapp.com",
  projectId: "tennis-booking-20676",
  storageBucket: "tennis-booking-20676.appspot.com",
  messagingSenderId: "356450184586",
  appId: "1:356450184586:web:f22389da90a5fec7472c73",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
