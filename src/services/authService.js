import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

class AuthService {
  constructor() {
    this.usersCollection = "users";
  }

  // Login
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userDoc = await getDoc(
        doc(db, this.usersCollection, userCredential.user.uid)
      );

      if (!userDoc.exists()) {
        throw new Error("Utente non trovato");
      }

      const userData = userDoc.data();

      if (userData.status === "PENDING") {
        throw new Error("Account in attesa di approvazione");
      }

      if (userData.status === "DISABLED") {
        throw new Error("Account disabilitato");
      }

      await updateDoc(doc(db, this.usersCollection, userCredential.user.uid), {
        lastLogin: serverTimestamp(),
      });

      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: userData.name,
        role: userData.role,
        status: userData.status,
        phone: userData.phone,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Registrazione
  async register(userData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      await updateProfile(userCredential.user, {
        displayName: userData.name,
      });

      await sendEmailVerification(userCredential.user);

      await setDoc(doc(db, this.usersCollection, userCredential.user.uid), {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: "USER",
        status: "PENDING",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        uid: userCredential.user.uid,
        email: userData.email,
        name: userData.name,
        status: "PENDING",
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      localStorage.removeItem("tennis-user");
    } catch (error) {
      console.error("Logout error:", error);
      throw new Error("Errore durante il logout");
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Recupera tutti gli utenti (solo per admin)
  async getAllUsers() {
    try {
      const usersRef = collection(db, this.usersCollection);
      const querySnapshot = await getDocs(usersRef);

      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return users;
    } catch (error) {
      console.error("Error getting users:", error);
      throw new Error("Errore nel recupero degli utenti");
    }
  }

  // Recupera gli utenti in attesa di approvazione
  async getPendingUsers() {
    try {
      const q = query(
        collection(db, this.usersCollection),
        where("status", "==", "PENDING")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting pending users:", error);
      throw new Error("Errore nel recupero degli utenti in attesa");
    }
  }

  // Approva un utente
  async approveUser(userId) {
    try {
      await updateDoc(doc(db, this.usersCollection, userId), {
        status: "ACTIVE",
        updatedAt: serverTimestamp(),
        approvedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error approving user:", error);
      throw new Error("Errore durante l'approvazione dell'utente");
    }
  }

  // Disabilita un utente
  async disableUser(userId) {
    try {
      await updateDoc(doc(db, this.usersCollection, userId), {
        status: "DISABLED",
        updatedAt: serverTimestamp(),
        disabledAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error disabling user:", error);
      throw new Error("Errore durante la disabilitazione dell'utente");
    }
  }

  // Riattiva un utente
  async reactivateUser(userId) {
    try {
      await updateDoc(doc(db, this.usersCollection, userId), {
        status: "ACTIVE",
        updatedAt: serverTimestamp(),
        reactivatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error reactivating user:", error);
      throw new Error("Errore durante la riattivazione dell'utente");
    }
  }

  // Aggiorna profilo utente
  async updateUserProfile(userId, updateData) {
    try {
      const userRef = doc(db, this.usersCollection, userId);

      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });

      if (updateData.name) {
        const user = auth.currentUser;
        if (user) {
          await updateProfile(user, {
            displayName: updateData.name,
          });
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw new Error("Errore durante l'aggiornamento del profilo");
    }
  }

  // Gestione messaggi di errore
  getAuthErrorMessage(errorCode) {
    const errorMessages = {
      "auth/email-already-in-use": "Questa email è già registrata",
      "auth/invalid-email": "Email non valida",
      "auth/operation-not-allowed": "Operazione non consentita",
      "auth/weak-password": "Password troppo debole",
      "auth/user-disabled": "Account disabilitato",
      "auth/user-not-found": "Utente non trovato",
      "auth/wrong-password": "Password non corretta",
      "auth/too-many-requests": "Troppi tentativi. Riprova più tardi",
      "auth/requires-recent-login":
        "Effettua nuovamente il login per continuare",
      default: "Errore di autenticazione",
    };

    return errorMessages[errorCode] || errorMessages.default;
  }
}

const authService = new AuthService();
export default authService;
