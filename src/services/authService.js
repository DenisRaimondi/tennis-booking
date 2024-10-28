import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  applyActionCode,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  getDocs,
  where,
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
      await this.sendVerificationEmail(userCredential.user);

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

  async sendVerificationEmail(user = null) {
    try {
      const currentUser = user || auth.currentUser;
      if (!currentUser) {
        throw new Error("Nessun utente autenticato");
      }
      await sendEmailVerification(currentUser);
    } catch (error) {
      console.error("Send verification email error:", error);
      throw this.handleError(error);
    }
  }

  async verifyEmail(oobCode) {
    try {
      if (!oobCode) {
        throw new Error("Codice di verifica mancante");
      }
      await applyActionCode(auth, oobCode);
    } catch (error) {
      console.error("Email verification error:", error);
      throw this.handleError(error);
    }
  }

  async updateUserProfile(userId, userData) {
    try {
      // Aggiorna il profilo utente
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, userData);

      // Se il nome è stato modificato, aggiorna anche le prenotazioni
      if (userData.name) {
        const bookingsRef = collection(db, "bookings");
        const bookingsQuery = query(bookingsRef, where("userId", "==", userId));
        const bookingsSnapshot = await getDocs(bookingsQuery);

        const updatePromises = bookingsSnapshot.docs.map((doc) =>
          updateDoc(doc.ref, {
            userName: userData.name,
          })
        );

        await Promise.all(updatePromises);
      }

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

  hasPermission(user, requiredPermission) {
    if (!user) return false;

    // Se richiediamo SUPER_USER, verifichiamo il ruolo
    if (requiredPermission === "SUPER_USER") {
      return user.role === "SUPER_USER";
    }

    // Per tutte le altre rotte, verifichiamo che l'utente sia attivo
    return user.status === "ACTIVE";
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
      case "auth/invalid-action-code":
        message = "Codice di verifica non valido o scaduto";
        break;
      case "auth/expired-action-code":
        message = "Codice di verifica scaduto";
        break;
      default:
        message = error.message || "Si è verificato un errore";
    }

    return new Error(message);
  }
}

export default new AuthService();
