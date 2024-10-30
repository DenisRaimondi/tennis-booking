import { 
    collection, 
    query, 
    where, 
    getDocs, 
    writeBatch
     
  } from 'firebase/firestore';
  import {db} from "../config/firebase";
  
  const deleteFutureBookings = async (userId) => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  
    try {
      // Query per le prenotazioni di oggi
      const todayBookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", userId),
        where("date", "==", currentDate),
        where("endTime", ">", currentTime)
      );
  
      // Query per le prenotazioni future
      const futureBookingsQuery = query(
        collection(db, "bookings"),
        where("userId", "==", userId),
        where("date", ">", currentDate)
      );
  
      // Esegui entrambe le query
      const [todaySnapshot, futureSnapshot] = await Promise.all([
        getDocs(todayBookingsQuery),
        getDocs(futureBookingsQuery)
      ]);
  
      // Usa batch per eliminare tutte le prenotazioni in una singola transazione
      const batch = writeBatch(db);
  
      // Aggiungi le prenotazioni di oggi al batch
      todaySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
  
      // Aggiungi le prenotazioni future al batch
      futureSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
  
      // Esegui il batch
      await batch.commit();
  
      // Restituisci il numero di prenotazioni eliminate
      return todaySnapshot.size + futureSnapshot.size;
  
    } catch (error) {
      console.error('Error deleting future bookings:', error);
      throw error;
    }
  };
  
  export default deleteFutureBookings;