import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  applyActionCode,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { UserRoles, UserStatus } from "../models/User";

class AuthService {
  // Ottiene l'utente corrente con i dati aggiuntivi da Firestore
  async getCurrentUser() {
    try {
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) return null;

      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (!userDoc.exists()) return null;

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        emailVerified: firebaseUser.emailVerified,
        ...userDoc.data(),
      };
    } catch (error) {
      console.error("Error getting current user:", error);
      throw this.handleAuthError(error);
    }
  }

  // Registrazione nuovo utente
  async register(userData) {
    try {
      const { email, password, name, phone, gdprConsents } = userData;

      // Crea l'utente in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Crea il documento utente in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phone,
        role: UserRoles.USER,
        status: UserStatus.PENDING,
        gdprConsents,
        createdAt: new Date().toISOString(),
      });

      // Invia email di verifica
      await sendEmailVerification(user);

      return user;
    } catch (error) {
      console.error("Error in registration:", error);
      throw this.handleAuthError(error);
    }
  }

  sendPasswordResetEmail(email) {
    return sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log("Password reset email sent!");
      })
      .catch((error) => {
        console.error("Error sending password reset email: ", error);
      });
  }
  async signUp({ email, password, name, phone, gdprConsents, status, role }) {
    try {
      // Crea l'utente in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Invia email di verifica
      await sendEmailVerification(user);

      // Crea il documento utente in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        phone,
        gdprConsents,
        status,
        role,
        createdAt: new Date().toISOString(),
      });

      return user;
    } catch (error) {
      console.error("Error in signUp:", error);
      if (error.code === "auth/email-already-in-use") {
        throw new Error("Email già registrata");
      }
      throw new Error("Errore durante la registrazione");
    }
  }
  // Login
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Verifica lo stato dell'utente
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        throw new Error("Utente non trovato");
      }

      const userData = userDoc.data();

      if (userData.status === UserStatus.PENDING) {
        await signOut(auth);
        throw new Error(
          "Il tuo account è in attesa di approvazione. Riceverai una email quando sarà attivato."
        );
      }

      if (userData.status === UserStatus.DISABLED) {
        await signOut(auth);
        throw new Error(
          "Il tuo account è stato disabilitato. Contatta l'amministratore."
        );
      }

      return {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        ...userData,
      };
    } catch (error) {
      console.error("Error in login:", error);
      throw this.handleAuthError(error);
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error in logout:", error);
      throw this.handleAuthError(error);
    }
  }

  // Verifica email
  async verifyEmail(code) {
    try {
      await applyActionCode(auth, code);
    } catch (error) {
      console.error("Error verifying email:", error);
      throw this.handleAuthError(error);
    }
  }

  // Aggiorna profilo utente
  async updateUserProfile(userId, data) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const userRef = doc(db, "users", userId);

      // Verifica se il documento esiste
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error("Utente non trovato");
      }

      await updateDoc(userRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      });

      const updatedDoc = await getDoc(userRef);
      return updatedDoc.data();
    } catch (error) {
      console.error("Error updating profile:", error);
      throw this.handleAuthError(error);
    }
  }

  // Cambio password
  async changePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Nessun utente autenticato");
      }

      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );

      // Riautentica l'utente
      await reauthenticateWithCredential(user, credential);

      // Aggiorna la password
      await updatePassword(user, newPassword);
    } catch (error) {
      console.error("Error changing password:", error);
      throw this.handleAuthError(error);
    }
  }

  // Elimina account
  async deleteAccount(userId, password) {
    try {
      const user = auth.currentUser;
      if (!user || user.uid !== userId) {
        throw new Error("Non autorizzato a eliminare questo account");
      }

      // Se viene fornita la password, riautentica l'utente
      if (password) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      // Ottieni la data e ora corrente
      const now = new Date();
      const currentDate = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().split(" ")[0].slice(0, 5);

      // Elimina solo le prenotazioni future dell'utente
      const bookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", userId),
        where("date", ">=", currentDate)
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const deleteBookingsPromises = bookingsSnapshot.docs
        .filter((doc) => {
          const booking = doc.data();
          // Se la prenotazione è di oggi, controlla anche l'ora
          if (booking.date === currentDate) {
            return booking.startTime > currentTime;
          }
          return true; // Mantieni tutte le prenotazioni future
        })
        .map((doc) => deleteDoc(doc.ref));

      await Promise.all(deleteBookingsPromises);

      // Elimina il documento utente
      await deleteDoc(doc(db, "users", userId));

      // Elimina l'account Firebase
      await deleteUser(user);

      await this.logout();
    } catch (error) {
      console.error("Error deleting account:", error);
      throw this.handleAuthError(error);
    }
  }

  // Ottieni tutti gli utenti (admin)
  async getAllUsers() {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      return usersSnapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Error getting users:", error);
      throw this.handleAuthError(error);
    }
  }

  // Approva utente (admin)
  async approveUser(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const userRef = doc(db, "users", userId);

      // Verifica se l'utente esiste
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error("Utente non trovato");
      }

      await updateDoc(userRef, {
        status: UserStatus.ACTIVE,
        approvedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error approving user:", error);
      throw this.handleAuthError(error);
    }
  }

  // Disabilita utente (admin)
  async disableUser(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const userRef = doc(db, "users", userId);

      // Verifica se l'utente esiste
      const userDoc = await getDoc(userRef);
      if (!userDoc.exists()) {
        throw new Error("Utente non trovato");
      }

      await updateDoc(userRef, {
        status: UserStatus.DISABLED,
        disabledAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error disabling user:", error);
      throw this.handleAuthError(error);
    }
  }

  // Verifica permessi utente
  hasPermission(user, permission) {
    // Debug
    console.log("Checking Permission:", {
      user,
      permission,
      userRole: user?.role,
    });

    // Gestione speciale per SUPER_USER
    if (permission === "SUPER_USER") {
      return user?.role === UserRoles.SUPER_USER;
    }

    if (!user || !user.role) {
      return false;
    }

    // Verifica permesso specifico
    const userPermissions = this.getPermissionsForRole(user.role);
    return userPermissions.includes(permission);
  }

  // Ottieni permessi per ruolo
  getPermissionsForRole(role) {
    // Definizione dei permessi per ruolo
    const rolePermissions = {
      [UserRoles.SUPER_USER]: [
        "MANAGE_USERS",
        "VIEW_REPORTS",
        "MANAGE_BOOKINGS",
        "ACCESS_ADMIN",
        "SUPER_USER",
      ],
      [UserRoles.USER]: ["CREATE_BOOKING", "VIEW_OWN_BOOKINGS"],
    };

    return rolePermissions[role] || [];
  }

  // Gestione errori Firebase Auth
  handleAuthError(error) {
    let message = "Si è verificato un errore. Riprova più tardi.";

    switch (error.code) {
      case "auth/email-already-in-use":
        message = "Questa email è già registrata";
        break;
      case "auth/invalid-email":
        message = "Email non valida";
        break;
      case "auth/operation-not-allowed":
        message = "Operazione non consentita";
        break;
      case "auth/weak-password":
        message = "La password deve essere di almeno 6 caratteri";
        break;
      case "auth/user-disabled":
        message = "Questo account è stato disabilitato";
        break;
      case "auth/user-not-found":
        message = "Utente non trovato";
        break;
      case "auth/wrong-password":
        message = "Password non corretta";
        break;
      case "auth/requires-recent-login":
        message =
          "Per motivi di sicurezza, effettua nuovamente il login prima di questa operazione";
        break;
      case "auth/invalid-credential":
        message = "Credenziali non valide";
        break;
      case "auth/invalid-verification-code":
        message = "Codice di verifica non valido";
        break;
      case "auth/invalid-verification-id":
        message = "ID di verifica non valido";
        break;
      default:
        if (error.message) {
          message = error.message;
        }
    }

    return new Error(message);
  }
}

export default new AuthService();
