import React from "react";
import { Trash2, Clock, Sun, User } from "lucide-react";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export const BookingsList = ({
  bookings,
  currentUser,
  selectedDate,
  onDeleteBooking,
}) => {
  // Se non ci sono prenotazioni per la data selezionata
  if (bookings.length === 0) {
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

  // Ordina le prenotazioni per ora di inizio
  const sortedBookings = [...bookings].sort((a, b) => {
    return a.startTime.localeCompare(b.startTime);
  });

  // Formatta la data in italiano
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Prenotazioni del {formatDate(selectedDate)}
        </h3>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orario</TableHead>
              <TableHead>Utente</TableHead>
              <TableHead>Illuminazione</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedBookings.map((booking) => (
              <TableRow
                key={booking.id}
                className={
                  booking.userId === currentUser.uid ? "bg-blue-50" : ""
                }
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    {booking.startTime} - {booking.endTime}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span>
                      {booking.userName}
                      {booking.userId === currentUser.uid && (
                        <span className="ml-1 text-xs text-blue-600">(Tu)</span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Sun
                      className={`w-4 h-4 ${
                        booking.needsLight ? "text-yellow-500" : "text-gray-400"
                      }`}
                    />
                    {booking.needsLight ? "Sì" : "No"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {booking.userId === currentUser.uid && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteBooking(booking.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="ml-2">Cancella</span>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-gray-500 mt-2">
        * Le prenotazioni evidenziate in blu sono le tue
      </div>
    </div>
  );
};
