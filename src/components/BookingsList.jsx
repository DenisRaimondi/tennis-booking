import React from "react";
import { Trash2, Clock, Calendar, User } from "lucide-react";
import { Button } from "../components/ui/button";

export const BookingsList = ({
  bookings,
  currentUser,
  selectedDate,
  onDeleteBooking,
}) => {
  // Filtra le prenotazioni per la data selezionata
  const filteredBookings = selectedDate
    ? bookings.filter((booking) => booking.date === selectedDate)
    : [];

  // Ordina le prenotazioni per orario
  const sortedBookings = [...filteredBookings].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  if (sortedBookings.length === 0) {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-2">
          {selectedDate
            ? "Nessuna prenotazione per questa data"
            : "Seleziona una data per vedere le prenotazioni"}
        </h3>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">
        Prenotazioni del{" "}
        {new Date(selectedDate).toLocaleDateString("it-IT", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </h3>
      <div className="space-y-3">
        {sortedBookings.map((booking) => (
          <div
            key={booking.id}
            className={`p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between
              ${
                booking.userId === currentUser.username
                  ? "bg-blue-50"
                  : "bg-gray-50"
              }`}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <p className="text-sm font-medium">
                  {booking.startTime} - {booking.endTime}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <p className="text-sm">
                  Prenotato da:{" "}
                  <span className="font-medium">{booking.userName}</span>
                </p>
              </div>
            </div>
            {booking.userId === currentUser.username && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeleteBooking(booking.id)}
                className="mt-3 sm:mt-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancella
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
