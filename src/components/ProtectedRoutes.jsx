import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthService from "../services/authService";

export const ProtectedRoute = ({ children, requiredPermission, user }) => {
  const location = useLocation();

  if (!user) {
    // Reindirizza al login se non autenticato
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica il permesso richiesto se specificato
  if (requiredPermission && !AuthService.hasPermission(user, requiredPermission)) {
    // Se l'utente è in attesa di approvazione
    if (user.status === "PENDING") {
      return (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-yellow-600 mb-4">Account in attesa di approvazione</h2>
            <p className="text-gray-600">
              Il tuo account è in attesa di approvazione da parte dell'amministratore. 
              Riceverai una notifica via email quando il tuo account sarà attivato.
            </p>
          </div>
        </div>
      );
    }

    // Se l'utente è disabilitato
    if (user.status === "DISABLED") {
      return (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">Account disabilitato</h2>
            <p className="text-gray-600">
              Il tuo account è stato disabilitato. Per maggiori informazioni, 
              contatta l'amministratore del sistema.
            </p>
          </div>
        </div>
      );
    }

    // Per accessi non autorizzati (es. tentativo di accesso alla sezione admin)
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">Accesso non autorizzato</h2>
          <p className="text-gray-600">
            Non hai i permessi necessari per accedere a questa sezione.
          </p>
        </div>
      </div>
    );
  }

  return children;
};