import React from "react";
import { Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export const TimeSelector = ({
  selectedDate,
  startTime,
  endTime,
  bookings,
  onStartTimeChange,
  onEndTimeChange,
}) => {
  // Genera gli orari disponibili
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute of ["00", "30"]) {
        slots.push(`${hour.toString().padStart(2, "0")}:${minute}`);
      }
    }
    slots.push("21:00");
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Funzione per verificare sovrapposizioni
  const isTimeOverlapping = (startTime, endTime) => {
    return bookings.some(
      (booking) =>
        booking.date === selectedDate &&
        ((startTime >= booking.startTime && startTime < booking.endTime) ||
          (endTime > booking.startTime && endTime <= booking.endTime) ||
          (startTime <= booking.startTime && endTime >= booking.endTime))
    );
  };

  // Ottieni gli orari disponibili per la fine in base all'ora di inizio
  const getAvailableEndTimes = () => {
    if (!startTime) return [];
    const startIndex = timeSlots.indexOf(startTime);
    return timeSlots.slice(startIndex + 1);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Ora Inizio
        </h3>
        <Select value={startTime} onValueChange={onStartTimeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Seleziona ora inizio" />
          </SelectTrigger>
          <SelectContent className="h-[200px]">
            {" "}
            {/* Altezza fissa per 5 elementi */}
            {timeSlots.slice(0, -1).map((time) => (
              <SelectItem
                key={time}
                value={time}
                disabled={isTimeOverlapping(
                  time,
                  timeSlots[timeSlots.indexOf(time) + 1]
                )}
                className="cursor-pointer hover:bg-gray-100"
              >
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Ora Fine
        </h3>
        <Select
          value={endTime}
          onValueChange={onEndTimeChange}
          disabled={!startTime}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona ora fine" />
          </SelectTrigger>
          <SelectContent className="h-[200px]">
            {" "}
            {/* Altezza fissa per 5 elementi */}
            {getAvailableEndTimes().map((time) => (
              <SelectItem
                key={time}
                value={time}
                disabled={isTimeOverlapping(startTime, time)}
                className="cursor-pointer hover:bg-gray-100"
              >
                {time}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
