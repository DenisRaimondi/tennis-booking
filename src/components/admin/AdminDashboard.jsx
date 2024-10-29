import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { UserManagement } from "./UserManagement";
import { BookingsManagement } from "./BookingsManagement";

export const AdminDashboard = ({ currentUser }) => {
  if (currentUser.role !== "SUPER_USER") {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">
          Accesso non autorizzato
        </h2>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard Amministratore</h1>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Gestione Utenti</TabsTrigger>
          <TabsTrigger value="bookings">Prenotazioni</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="bookings">
          <BookingsManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};