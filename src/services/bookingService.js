// services/bookingService.js

// Mock data per le prenotazioni esistenti
const mockBookings = [
  {
    id: 1,
    date: "2024-10-26",
    startTime: "10:00",
    endTime: "11:30",
    userId: "marco.bianchi",
    userName: "Marco Bianchi",
    createdAt: "2024-10-24T10:00:00Z",
  },
  {
    id: 2,
    date: "2024-10-26",
    startTime: "14:00",
    endTime: "15:30",
    userId: "laura.rossi",
    userName: "Laura Rossi",
    createdAt: "2024-10-24T11:00:00Z",
  },
  {
    id: 3,
    date: "2024-10-27",
    startTime: "09:00",
    endTime: "10:30",
    userId: "mario.rossi",
    userName: "Mario Rossi",
    createdAt: "2024-10-24T12:00:00Z",
  },
];

export const BookingService = {
  // Simula il fetch delle prenotazioni dal server
  fetchBookings: async () => {
    // Simula una latenza di rete
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockBookings;
  },

  // Simula il salvataggio di una nuova prenotazione
  createBooking: async (bookingData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newBooking = {
      id: Date.now(),
      ...bookingData,
      createdAt: new Date().toISOString(),
    };
    mockBookings.push(newBooking);
    return newBooking;
  },

  // Simula la cancellazione di una prenotazione
  deleteBooking: async (bookingId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockBookings.findIndex((b) => b.id === bookingId);
    if (index !== -1) {
      mockBookings.splice(index, 1);
    }
    return { success: true };
  },
};
