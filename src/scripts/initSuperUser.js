const { initializeApp } = require("firebase/app");
const {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
} = require("firebase/auth");
const { getFirestore, doc, setDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyDjR0_emsqGEVSCDaI7r9jRpSixIgTcTGI",
  authDomain: "tennis-booking-20676.firebaseapp.com",
  projectId: "tennis-booking-20676",
  storageBucket: "tennis-booking-20676.appspot.com",
  messagingSenderId: "356450184586",
  appId: "1:356450184586:web:f22389da90a5fec7472c73",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const SUPER_USER_CONFIG = {
  email: "admin@tennis.com",
  password: "admin123456",
  name: "Admin Tennis",
  phone: "1234567890",
};

const initializeSuperUser = async () => {
  try {
    console.log("Starting super user initialization...");

    // Check if super user already exists
    console.log("Checking for existing super user...");

    // Create user in Firebase Auth
    console.log("Creating user in Firebase Auth...");
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      SUPER_USER_CONFIG.email,
      SUPER_USER_CONFIG.password
    );

    // Update profile
    console.log("Updating user profile...");
    await updateProfile(userCredential.user, {
      displayName: SUPER_USER_CONFIG.name,
    });

    // Save in Firestore
    console.log("Saving user data in Firestore...");
    await setDoc(doc(db, "users", userCredential.user.uid), {
      name: SUPER_USER_CONFIG.name,
      email: SUPER_USER_CONFIG.email,
      phone: SUPER_USER_CONFIG.phone,
      role: "SUPER_USER",
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    });

    console.log("Super user created successfully!");
    console.log("User ID:", userCredential.user.uid);
    console.log("Email:", SUPER_USER_CONFIG.email);
    console.log("Remember to change the password after first login!");

    // Exit successfully
    process.exit(0);
  } catch (error) {
    console.error("Error creating super user:", error.message);
    process.exit(1);
  }
};

// Run the initialization
console.log("Starting initialization script...");
initializeSuperUser().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
