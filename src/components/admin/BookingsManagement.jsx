import React, { useState, useEffect } from "react";
import { Calendar, User, Sun, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import authService from "../../services/authService";
import bookingService from "../../services/bookingService";

export const BookingsManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filtri
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [userFilter, setUserFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Stats
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    lightUsage: 0,
    averageDuration: 0,
  });

  useEffect(() => {
    loadBookings();
  }, [dateRange]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const fetchedBookings = await bookingService.getBookings(
        dateRange.start,
        dateRange.end
      );
      setBookings(fetchedBookings);
      calculateStats(fetchedBookings);
    } catch (error) {
      setError("Errore nel caricamento delle prenotazioni");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookingsList) => {
    const stats = bookingsList.reduce(
      (acc, booking) => {
        // Calcola durata in ore
        const duration = calculateDuration(booking.startTime, booking.endTime);

        // Calcola prezzo
        const price = calculatePrice(booking);

        return {
          totalBookings: acc.totalBookings + 1,
          totalRevenue: acc.totalRevenue + price,
          lightUsage: acc.lightUsage + (booking.needsLight ? 1 : 0),
          totalDuration: acc.totalDuration + duration,
        };
      },
      { totalBookings: 0, totalRevenue: 0, lightUsage: 0, totalDuration: 0 }
    );

    setStats({
      totalBookings: stats.totalBookings,
      totalRevenue: stats.totalRevenue,
      lightUsage: ((stats.lightUsage / stats.totalBookings) * 100).toFixed(1),
      averageDuration: (stats.totalDuration / stats.totalBookings).toFixed(1),
    });
  };

  const calculateDuration = (start, end) => {
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    return endHour - startHour + (endMinute - startMinute) / 60;
  };

  const calculatePrice = (booking) => {
    const duration = calculateDuration(booking.startTime, booking.endTime);
    const basePrice = duration * 20; // 20€ per ora
    const lightSupplement = booking.needsLight ? duration * 5 : 0; // 5€ per ora con luce
    return basePrice + lightSupplement;
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingService.cancelBooking(bookingId);
      setSuccess("Prenotazione cancellata con successo");
      loadBookings();
    } catch (error) {
      setError("Errore durante la cancellazione");
    }
  };

  const filteredBookings = bookings
    .filter((booking) => {
      if (userFilter) {
        return (
          booking.userName.toLowerCase().includes(userFilter.toLowerCase()) ||
          booking.userId.toLowerCase().includes(userFilter.toLowerCase())
        );
      }
      return true;
    })
    .filter((booking) => {
      if (statusFilter === "ALL") return true;
      return booking.status === statusFilter;
    });

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-muted-foreground">Prenotazioni Totali</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">
              €{stats.totalRevenue.toFixed(2)}
            </div>
            <p className="text-muted-foreground">Ricavo Totale</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.lightUsage}%</div>
            <p className="text-muted-foreground">Utilizzo Illuminazione</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.averageDuration}h</div>
            <p className="text-muted-foreground">Durata Media</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtri */}
      <div className="flex flex-wrap gap-4">
        <Input
          type="date"
          value={dateRange.start}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, start: e.target.value }))
          }
          className="w-auto"
        />
        <Input
          type="date"
          value={dateRange.end}
          onChange={(e) =>
            setDateRange((prev) => ({ ...prev, end: e.target.value }))
          }
          className="w-auto"
        />
        <Input
          placeholder="Cerca utente"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="w-auto"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Stato" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tutti gli stati</SelectItem>
            <SelectItem value="ACTIVE">Attive</SelectItem>
            <SelectItem value="CANCELLED">Cancellate</SelectItem>
            <SelectItem value="COMPLETED">Completate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages */}
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

      {/* Bookings Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Orario</TableHead>
            <TableHead>Utente</TableHead>
            <TableHead>Illuminazione</TableHead>
            <TableHead>Prezzo</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                {new Date(booking.date).toLocaleDateString("it-IT", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </TableCell>
              <TableCell>
                {booking.startTime} - {booking.endTime}
              </TableCell>
              <TableCell>{booking.userName}</TableCell>
              <TableCell>
                {booking.needsLight ? (
                  <Sun className="w-4 h-4 text-yellow-500" />
                ) : (
                  "No"
                )}
              </TableCell>
              <TableCell>€{calculatePrice(booking).toFixed(2)}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    booking.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : booking.status === "CANCELLED"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {booking.status}
                </span>
              </TableCell>
              <TableCell>
                {booking.status === "ACTIVE" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancella
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
