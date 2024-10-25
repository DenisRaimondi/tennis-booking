import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';

// Utility functions
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDaysInMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getFirstDayOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
};

export const BookingCalendar = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Aggiungi giorni vuoti all'inizio
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', disabled: true });
    }
    
    // Aggiungi i giorni del mese
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 12);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      days.push({
        day,
        date: formatDate(date),
        disabled: date < today
      });
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    const today = new Date();
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1);
    if (newDate.getMonth() >= today.getMonth() || newDate.getFullYear() > today.getFullYear()) {
      setCurrentMonth(newDate);
    }
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Seleziona Data</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {currentMonth.toLocaleString('it-IT', { month: 'long', year: 'numeric' })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map(day => (
          <div key={day} className="text-center text-sm font-medium p-2">
            {day}
          </div>
        ))}
        {generateCalendarDays().map((day, index) => (
          <Button
            key={index}
            variant={selectedDate === day.date ? "default" : "outline"}
            disabled={day.disabled}
            onClick={() => day.date && onDateSelect(day.date)}
            className={`w-full ${!day.day ? 'invisible' : ''} ${
              day.disabled && day.day ? 'opacity-50' : ''
            }`}
          >
            {day.day}
          </Button>
        ))}
      </div>
    </div>
  );
};