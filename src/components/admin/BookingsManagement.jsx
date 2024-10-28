import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import bookingService from "../../services/bookingService";

export const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Carica le prenotazioni all'avvio del componente
  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const fetchedBookings = await bookingService.getBookings();
      setBookings(fetchedBookings);
    } catch (error) {
      setError("Errore nel caricamento delle prenotazioni");
    } finally {
      setLoading(false);
    }
  };

  // Gestisce l'eliminazione di una prenotazione
  const handleDelete = async (bookingId) => {
    try {
      setDeletingId(bookingId);
      await bookingService.deleteBooking(bookingId);
      
      setSuccess("Prenotazione cancellata con successo");
      // Rimuove la prenotazione dalla lista locale
      setBookings(prev => prev.filter(booking => booking.id !== bookingId));
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Errore nella cancellazione della prenotazione");
    } finally {
      setDeletingId(null);
    }
  };

  // Calcola l'indice iniziale e finale per la paginazione
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = bookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(bookings.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        Caricamento prenotazioni...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messaggi di errore e successo */}
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

      {/* Tabella prenotazioni */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Orario</TableHead>
              <TableHead>Utente</TableHead>
              <TableHead>Illuminazione</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  {new Date(booking.date).toLocaleDateString("it-IT", {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                  })}
                </TableCell>
                <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                <TableCell>{booking.userName}</TableCell>
                <TableCell>{booking.needsLight ? "Sì" : "No"}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === booking.id}
                    onClick={() => handleDelete(booking.id)}
                  >
                    {deletingId === booking.id ? "Cancellazione..." : "Cancella"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginazione */}
      {bookings.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-gray-500">
            Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, bookings.length)} di {bookings.length} prenotazioni
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Pagina {currentPage} di {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};