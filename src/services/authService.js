import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";

class AuthService {
  async register(userData) {
    try {
      // Crea l'utente in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Salva i dati addizionali in Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userRef, {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: "USER",
        status: "PENDING",
        createdAt: new Date().toISOString(),
        gdpr: {
          terms: userData.gdprConsents.terms,
          privacy: userData.gdprConsents.privacy,
          acceptedAt: userData.gdprConsents.acceptedAt,
        },
      });

      // Invia email di verifica
      await sendEmailVerification(userCredential.user);

      return userCredential.user;
    } catch (error) {
      console.error("Registration error:", error);
      throw this.handleError(error);
    }
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Ottieni i dati aggiuntivi da Firestore
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (!userDoc.exists()) {
        throw new Error("Dati utente non trovati");
      }

      const userData = userDoc.data();

      // Verifica lo stato dell'utente
      if (userData.status === "PENDING") {
        throw new Error("Account in attesa di approvazione");
      }
      if (userData.status === "DISABLED") {
        throw new Error("Account disabilitato");
      }

      return {
        ...userCredential.user,
        ...userData,
      };
    } catch (error) {
      console.error("Login error:", error);
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
      throw this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) return null;

      return {
        ...user,
        ...userDoc.data(),
      };
    } catch (error) {
      console.error("Get current user error:", error);
      throw this.handleError(error);
    }
  }

  async updateUserProfile(userId, userData) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, userData);
      return userData;
    } catch (error) {
      console.error("Update profile error:", error);
      throw this.handleError(error);
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("Nessun utente autenticato");

      // Riautentica l'utente
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Cambia la password
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error("Change password error:", error);
      throw this.handleError(error);
    }
  }

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Reset password error:", error);
      throw this.handleError(error);
    }
  }

  async verifyEmail(oobCode) {
    try {
      await this.auth.applyActionCode(oobCode);
    } catch (error) {
      console.error("Email verification error:", error);
      throw this.handleError(error);
    }
  }

  // Metodi Admin
  async getAllUsers() {
    try {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(query(usersRef));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Get all users error:", error);
      throw this.handleError(error);
    }
  }

  async approveUser(userId) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        status: "ACTIVE",
      });
    } catch (error) {
      console.error("Approve user error:", error);
      throw this.handleError(error);
    }
  }

  async disableUser(userId) {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        status: "DISABLED",
      });
    } catch (error) {
      console.error("Disable user error:", error);
      throw this.handleError(error);
    }
  }

  handleError(error) {
    let message = "Si è verificato un errore";

    switch (error.code) {
      case "auth/email-already-in-use":
        message = "Email già registrata";
        break;
      case "auth/invalid-email":
        message = "Email non valida";
        break;
      case "auth/operation-not-allowed":
        message = "Operazione non consentita";
        break;
      case "auth/weak-password":
        message = "Password troppo debole";
        break;
      case "auth/user-disabled":
        message = "Account disabilitato";
        break;
      case "auth/user-not-found":
        message = "Utente non trovato";
        break;
      case "auth/wrong-password":
        message = "Password non corretta";
        break;
      default:
        message = error.message || "Si è verificato un errore";
    }

    return new Error(message);
  }
}

export default new AuthService();
