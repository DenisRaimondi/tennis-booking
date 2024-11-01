import { firebaseConfig as testConfig } from "./firebase.test";
import { firebaseConfig as prodConfig } from "./firebase.prod";

export const firebaseConfig =
  process.env.REACT_APP_ENV === "production" ? prodConfig : testConfig;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth and Firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
