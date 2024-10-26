import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";

class BookingService {
  constructor() {
    this.collection = "bookings";
  }

  /**
   * Recupera le prenotazioni per una data specifica
   * @param {string} date - Data in formato YYYY-MM-DD
   * @returns {Promise<Array>} Array di prenotazioni
   */
  async getBookings(date) {
    try {
      const bookingsRef = collection(db, this.collection);
      let q;

      if (date) {
        q = query(
          bookingsRef,
          where("date", "==", date),
          orderBy("startTime", "asc")
        );
      } else {
        q = query(
          bookingsRef,
          orderBy("date", "desc"),
          orderBy("startTime", "asc")
        );
      }

      const querySnapshot = await getDocs(q);
      const bookings = [];

      querySnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return bookings;
    } catch (error) {
      console.error("Error getting bookings:", error);
      throw new Error("Errore nel caricamento delle prenotazioni");
    }
  }

  /**
   * Crea una nuova prenotazione
   * @param {Object} bookingData - Dati della prenotazione
   * @returns {Promise<Object>} Prenotazione creata
   */
  async createBooking(bookingData) {
    try {
      // Verifica che tutti i campi necessari siano presenti
      const requiredFields = [
        "date",
        "startTime",
        "endTime",
        "userId",
        "userName",
      ];
      for (const field of requiredFields) {
        if (!bookingData[field]) {
          throw new Error(`Campo obbligatorio mancante: ${field}`);
        }
      }

      // Verifica sovrapposizioni
      const overlapping = await this.checkOverlap(
        bookingData.date,
        bookingData.startTime,
        bookingData.endTime
      );

      if (overlapping) {
        throw new Error("Questo slot temporale è già prenotato");
      }

      // Aggiunge timestamp e stato
      const bookingToSave = {
        ...bookingData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: "ACTIVE",
        needsLight: bookingData.needsLight || false,
      };

      const docRef = await addDoc(
        collection(db, this.collection),
        bookingToSave
      );

      return {
        id: docRef.id,
        ...bookingToSave,
        createdAt: new Date().toISOString(), // Convertiamo il timestamp per l'utilizzo immediato
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  }

  /**
   * Elimina una prenotazione
   * @param {string} bookingId - ID della prenotazione
   * @returns {Promise<boolean>}
   */
  async deleteBooking(bookingId) {
    try {
      const bookingRef = doc(db, this.collection, bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error("Prenotazione non trovata");
      }

      await deleteDoc(bookingRef);
      return true;
    } catch (error) {
      console.error("Error deleting booking:", error);
      throw new Error("Errore durante la cancellazione della prenotazione");
    }
  }

  /**
   * Verifica la sovrapposizione con altre prenotazioni
   * @param {string} date - Data della prenotazione
   * @param {string} startTime - Ora inizio
   * @param {string} endTime - Ora fine
   * @returns {Promise<boolean>}
   */
  async checkOverlap(date, startTime, endTime) {
    try {
      const bookingsRef = collection(db, this.collection);
      const q = query(
        bookingsRef,
        where("date", "==", date),
        where("status", "==", "ACTIVE")
      );

      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.some((doc) => {
        const booking = doc.data();
        return this.isTimeOverlapping(
          startTime,
          endTime,
          booking.startTime,
          booking.endTime
        );
      });
    } catch (error) {
      console.error("Error checking overlap:", error);
      throw new Error("Errore durante la verifica delle sovrapposizioni");
    }
  }

  /**
   * Verifica se due intervalli di tempo si sovrappongono
   * @param {string} start1 - Ora inizio primo intervallo
   * @param {string} end1 - Ora fine primo intervallo
   * @param {string} start2 - Ora inizio secondo intervallo
   * @param {string} end2 - Ora fine secondo intervallo
   * @returns {boolean}
   */
  isTimeOverlapping(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
  }

  /**
   * Recupera le prenotazioni di un utente specifico
   * @param {string} userId - ID dell'utente
   * @param {Object} options - Opzioni di filtro
   * @returns {Promise<Array>}
   */
  async getUserBookings(userId, options = {}) {
    try {
      const bookingsRef = collection(db, this.collection);
      let queryConstraints = [
        where("userId", "==", userId),
        orderBy("date", "desc"),
        orderBy("startTime", "asc"),
      ];

      if (options.status) {
        queryConstraints.push(where("status", "==", options.status));
      }

      if (options.limit) {
        queryConstraints.push(limit(options.limit));
      }

      const q = query(bookingsRef, ...queryConstraints);
      const querySnapshot = await getDocs(q);

      const bookings = [];
      querySnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return bookings;
    } catch (error) {
      console.error("Error getting user bookings:", error);
      throw new Error("Errore nel caricamento delle prenotazioni utente");
    }
  }

  /**
   * Recupera una prenotazione specifica
   * @param {string} bookingId - ID della prenotazione
   * @returns {Promise<Object>}
   */
  async getBooking(bookingId) {
    try {
      const bookingRef = doc(db, this.collection, bookingId);
      const bookingDoc = await getDoc(bookingRef);

      if (!bookingDoc.exists()) {
        throw new Error("Prenotazione non trovata");
      }

      return {
        id: bookingDoc.id,
        ...bookingDoc.data(),
      };
    } catch (error) {
      console.error("Error getting booking:", error);
      throw new Error("Errore nel caricamento della prenotazione");
    }
  }

  /**
   * Recupera le prenotazioni per un intervallo di date
   * @param {string} startDate - Data inizio (YYYY-MM-DD)
   * @param {string} endDate - Data fine (YYYY-MM-DD)
   * @returns {Promise<Array>}
   */
  async getBookingsByDateRange(startDate, endDate) {
    try {
      const bookingsRef = collection(db, this.collection);
      const q = query(
        bookingsRef,
        where("date", ">=", startDate),
        where("date", "<=", endDate),
        orderBy("date", "asc"),
        orderBy("startTime", "asc")
      );

      const querySnapshot = await getDocs(q);
      const bookings = [];

      querySnapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      return bookings;
    } catch (error) {
      console.error("Error getting bookings by date range:", error);
      throw new Error("Errore nel caricamento delle prenotazioni");
    }
  }
}

// Esporta un'istanza del servizio
const bookingService = new BookingService();
export default bookingService;
