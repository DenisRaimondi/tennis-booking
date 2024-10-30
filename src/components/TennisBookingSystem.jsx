import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BookingCalendar } from './BookingCalendar';
import { TimeSelector } from './TimeSelector';
import { BookingsList } from './BookingsList';
import bookingService from '../services/bookingService';

const TennisBookingSystem = ({ currentUser }) => {
  // Stati per la prenotazione
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [needsLight, setNeedsLight] = useState('');
  const [bookings, setBookings] = useState([]);

  // Stati UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (selectedDate) {
      loadBookings();
    }
  }, [selectedDate]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedBookings = await bookingService.getBookings(selectedDate);
      setBookings(fetchedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      setError('Errore nel caricamento delle prenotazioni. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  const validateBooking = () => {
    if (!selectedDate || !startTime || !endTime) {
      setError('Seleziona data e orari per la prenotazione');
      return false;
    }

    if (needsLight === '') {
      setError('Specifica se necessiti dell\'illuminazione');
      return false;
    }

    // Verifica se è necessaria l'illuminazione per gli orari serali (dopo le 19:00)
    const hour = parseInt(startTime.split(':')[0]);
    if (hour >= 19 && needsLight === 'no') {
      setError('L\'illuminazione è obbligatoria dopo le 19:00');
      return false;
    }

    return true;
  };

  const handleBooking = async () => {
    if (!validateBooking()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const newBooking = await bookingService.createBooking({
        date: selectedDate,
        startTime,
        endTime,
        needsLight: needsLight === 'yes',
        userId: currentUser.uid,
        userName: currentUser.name
      });

      setBookings(prev => [...prev, newBooking]);
      setSuccess('Prenotazione effettuata con successo!');
      
      // Reset form
      setStartTime('');
      setEndTime('');
      setNeedsLight('');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Booking error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    try {
      setLoading(true);
      setError('');
      await bookingService.deleteBooking(bookingId);
      
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      setSuccess('Prenotazione cancellata con successo!');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setError('Errore durante la cancellazione della prenotazione');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>Prenota</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <BookingCalendar
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />

          {selectedDate && (
            <>
              <TimeSelector
                selectedDate={selectedDate}
                startTime={startTime}
                endTime={endTime}
                bookings={bookings}
                onStartTimeChange={setStartTime}
                onEndTimeChange={setEndTime}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Illuminazione campo
                </label>
                <Select
                  value={needsLight}
                  onValueChange={setNeedsLight}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleziona se necessiti dell'illuminazione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Sì</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                {needsLight === '' && startTime && endTime && (
                  <p className="text-sm text-red-500">
                    * Seleziona se necessiti dell'illuminazione
                  </p>
                )}
              </div>

              {startTime && endTime && needsLight !== '' && (
                <Button
                  onClick={handleBooking}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? 'Prenotazione in corso...' : 'Prenota'}
                </Button>
              )}
            </>
          )}

          {loading && (
            <div className="flex justify-center items-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-2">Caricamento...</span>
            </div>
          )}

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

          <BookingsList
            bookings={bookings}
            currentUser={currentUser}
            selectedDate={selectedDate}
            onDeleteBooking={handleDeleteBooking}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TennisBookingSystem;