import React, { useState, useEffect } from "react";
import { Calendar, LogOut } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { BookingService } from "../services/bookingService";
import { UserService } from "../services/userService";

import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { BookingCalendar } from "./BookingCalendar";
import { TimeSelector } from "./TimeSelector";
import { BookingsList } from "./BookingsList";

const TennisBookingSystem = () => {
  // Stati per l'autenticazione
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showSignUp, setShowSignUp] = useState(false);

  // Stati per la prenotazione
  const [selectedDate, setSelectedDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [bookings, setBookings] = useState([]);

  // Stati per l'UI
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Carica le prenotazioni esistenti e lo stato dell'utente
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Carica lo stato dell'utente dal localStorage
        const savedUser = localStorage.getItem("tennis-user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          setIsLoggedIn(true);
        }

        // Carica le prenotazioni dal servizio
        const fetchedBookings = await BookingService.fetchBookings();
        setBookings(fetchedBookings);
      } catch (error) {
        setError("Errore nel caricamento dei dati. Riprova più tardi.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleLogin = async (username, password) => {
    try {
      const user = await UserService.login(username, password);
      setIsLoggedIn(true);
      setCurrentUser(user);
      localStorage.setItem("tennis-user", JSON.stringify(user));
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignUp = async (userData) => {
    try {
      const newUser = await UserService.register(userData);
      setCurrentUser(newUser);
      setIsLoggedIn(true);
      localStorage.setItem("tennis-user", JSON.stringify(newUser));
      setShowSignUp(false);
      setError("");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedDate("");
    setStartTime("");
    setEndTime("");
    localStorage.removeItem("tennis-user");
  };

  const handleBooking = async () => {
    // Validazione input
    if (!selectedDate || !startTime || !endTime) {
      setError('Seleziona data e orari per la prenotazione');
      return;
    }
  
    if (startTime >= endTime) {
      setError("L'ora di fine deve essere successiva all'ora di inizio");
      return;
    }
  
    // Controllo sovrapposizioni
    const isOverlapping = bookings.some(booking => 
      booking.date === selectedDate &&
      ((startTime >= booking.startTime && startTime < booking.endTime) ||
       (endTime > booking.startTime && endTime <= booking.endTime) ||
       (startTime <= booking.startTime && endTime >= booking.endTime))
    );
  
    if (isOverlapping) {
      setError('Questo slot temporale si sovrappone con una prenotazione esistente');
      return;
    }
  
    try {
      // Creazione nuova prenotazione
      const newBooking = await BookingService.createBooking({
        date: selectedDate,
        startTime,
        endTime,
        userId: currentUser.username,
        userName: currentUser.name
      });
  
      // Aggiorna lo stato delle prenotazioni con il risultato dal servizio
      setBookings(prevBookings => {
        // Verifica che la prenotazione non sia già presente
        const isDuplicate = prevBookings.some(booking => 
          booking.id === newBooking.id ||
          (booking.date === newBooking.date && 
           booking.startTime === newBooking.startTime && 
           booking.endTime === newBooking.endTime)
        );
  
        if (isDuplicate) {
          return prevBookings;
        }
        return [...prevBookings, newBooking];
      });
  
      setSuccess('Prenotazione effettuata con successo!');
      setError('');
      
      // Reset form
      setStartTime('');
      setEndTime('');
  
      // Rimuovi il messaggio di successo dopo 3 secondi
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Errore durante la prenotazione. Riprova più tardi.');
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      await BookingService.deleteBooking(bookingId);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
      setSuccess("Prenotazione cancellata con successo!");

      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Errore durante la cancellazione. Riprova più tardi.");
    }
  };

  // Se l'utente non è loggato, mostra il form di login o registrazione
  if (!isLoggedIn) {
    if (showSignUp) {
      return (
        <SignUpForm
          onSignUp={handleSignUp}
          onBackToLogin={() => setShowSignUp(false)}
        />
      );
    }
    return (
      <LoginForm
        onLogin={handleLogin}
        onSignUpClick={() => setShowSignUp(true)}
        error={error}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Prenotazione Campo Tennis
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Benvenuto, {currentUser.name}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
                <p className="text-gray-600">Caricamento prenotazioni...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Calendario */}
              <BookingCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />

              {/* Selettore orari */}
              {selectedDate && (
                <TimeSelector
                  selectedDate={selectedDate}
                  startTime={startTime}
                  endTime={endTime}
                  bookings={bookings}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                />
              )}

              {/* Pulsante prenota */}
              {selectedDate && startTime && endTime && (
                <Button onClick={handleBooking} className="w-full">
                  Prenota {startTime} - {endTime}
                </Button>
              )}

              {/* Messaggi di feedback */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {/* Lista delle prenotazioni */}
              <BookingsList
                bookings={bookings}
                currentUser={currentUser}
                onDeleteBooking={handleDeleteBooking}
                selectedDate={selectedDate}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TennisBookingSystem;
