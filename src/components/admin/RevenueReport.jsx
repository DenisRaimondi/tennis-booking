import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import bookingService from "../../services/bookingService";

export const RevenueReport = () => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [dateRange, setDateRange] = useState("month");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [revenueData, setRevenueData] = useState([]);
  const [usageData, setUsageData] = useState([]);

  useEffect(() => {
    loadData();
  }, [dateRange, customRange]);

  const loadData = async () => {
    try {
      setLoading(true);
      const start = getStartDate();
      const end = customRange.end || new Date().toISOString().split("T")[0];

      const fetchedBookings = await bookingService.getBookings(start, end);
      setBookings(fetchedBookings);

      processData(fetchedBookings);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    switch (dateRange) {
      case "week":
        now.setDate(now.getDate() - 7);
        break;
      case "month":
        now.setMonth(now.getMonth() - 1);
        break;
      case "year":
        now.setFullYear(now.getFullYear() - 1);
        break;
      case "custom":
        return customRange.start;
      default:
        now.setMonth(now.getMonth() - 1);
    }
    return now.toISOString().split("T")[0];
  };

  const processData = (bookings) => {
    // Raggruppa i dati per data
    const revenueByDate = bookings.reduce((acc, booking) => {
      const date = booking.date;
      const revenue = calculatePrice(booking);

      if (!acc[date]) {
        acc[date] = { date, revenue: 0, bookings: 0, withLight: 0 };
      }

      acc[date].revenue += revenue;
      acc[date].bookings += 1;
      if (booking.needsLight) acc[date].withLight += 1;

      return acc;
    }, {});

    const processedData = Object.values(revenueByDate).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    setRevenueData(processedData);

    const usage = bookings.reduce((acc, booking) => {
      const hour = parseInt(booking.startTime.split(":")[0]);
      const timeSlot = getTimeSlot(hour);

      if (!acc[timeSlot]) {
        acc[timeSlot] = { timeSlot, count: 0, withLight: 0 };
      }

      acc[timeSlot].count += 1;
      if (booking.needsLight) acc[timeSlot].withLight += 1;

      return acc;
    }, {});

    setUsageData(Object.values(usage));
  };

  const getTimeSlot = (hour) => {
    if (hour < 12) return "Mattina (9-12)";
    if (hour < 15) return "Pranzo (12-15)";
    if (hour < 18) return "Pomeriggio (15-18)";
    return "Sera (18-21)";
  };

  const calculatePrice = (booking) => {
    const [startHour, startMinute] = booking.startTime.split(":").map(Number);
    const [endHour, endMinute] = booking.endTime.split(":").map(Number);
    const duration = endHour - startHour + (endMinute - startMinute) / 60;

    const basePrice = duration * 20;
    const lightSupplement = booking.needsLight ? duration * 5 : 0;

    return basePrice + lightSupplement;
  };

  const getTotalRevenue = () => {
    return revenueData.reduce((total, day) => total + day.revenue, 0);
  };

  const getAverageDailyRevenue = () => {
    return revenueData.length ? getTotalRevenue() / revenueData.length : 0;
  };

  const getMonthlyStats = () => {
    const months = {};

    bookings.forEach((booking) => {
      const monthKey = new Date(booking.date).toLocaleDateString("it-IT", {
        month: "long",
        year: "numeric",
      });

      if (!months[monthKey]) {
        months[monthKey] = {
          bookings: 0,
          revenue: 0,
          withLight: 0,
        };
      }

      months[monthKey].bookings++;
      months[monthKey].revenue += calculatePrice(booking);
      if (booking.needsLight) months[monthKey].withLight++;
    });

    return Object.entries(months)
      .map(([month, stats]) => ({
        month,
        bookings: stats.bookings,
        revenue: stats.revenue,
        lightPercentage: (stats.withLight / stats.bookings) * 100,
      }))
      .sort((a, b) => new Date(b.month) - new Date(a.month));
  };

  if (loading) {
    return <div>Caricamento...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filtri */}
      <div className="flex flex-wrap gap-4">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Ultima settimana</SelectItem>
            <SelectItem value="month">Ultimo mese</SelectItem>
            <SelectItem value="year">Ultimo anno</SelectItem>
            <SelectItem value="custom">Periodo personalizzato</SelectItem>
          </SelectContent>
        </Select>

        {dateRange === "custom" && (
          <div className="flex gap-2">
            <Input
              type="date"
              value={customRange.start}
              onChange={(e) =>
                setCustomRange((prev) => ({ ...prev, start: e.target.value }))
              }
            />
            <Input
              type="date"
              value={customRange.end}
              onChange={(e) =>
                setCustomRange((prev) => ({ ...prev, end: e.target.value }))
              }
            />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ricavo Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{getTotalRevenue().toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Media Giornaliera
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{getAverageDailyRevenue().toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Prenotazioni Totali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Andamento Ricavi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) =>
                    new Date(date).toLocaleDateString("it-IT", {
                      day: "2-digit",
                      month: "short",
                    })
                  }
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => `€${value.toFixed(2)}`}
                  labelFormatter={(date) =>
                    new Date(date).toLocaleDateString("it-IT", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })
                  }
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Ricavi"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Usage Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Utilizzo per Fascia Oraria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeSlot" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  name="Totale Prenotazioni"
                  fill="#8884d8"
                />
                <Bar
                  dataKey="withLight"
                  name="Con Illuminazione"
                  fill="#ffc658"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiche Mensili</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mese
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prenotazioni
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ricavi
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Con Luce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getMonthlyStats().map((stat) => (
                <tr key={stat.month}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stat.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.bookings}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    €{stat.revenue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.lightPercentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
