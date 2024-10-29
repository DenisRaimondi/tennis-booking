import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthService from "../services/authService";
import { Roles } from "../config/roles";

export const ProtectedRoute = ({ children, requiredPermission, user }) => {
  const location = useLocation();

  // Debug
  console.log('Protected Route Check:', {
    user: user,
    requiredPermission: requiredPermission,
    userRole: user?.role,
    hasPermission: user ? AuthService.hasPermission(user, requiredPermission) : false
  });

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Gestione speciale per la rotta admin
  if (requiredPermission === "SUPER_USER") {
    if (user.role !== Roles.SUPER_USER) {
      return (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">Accesso non autorizzato</h2>
            <p className="text-gray-600">
              Questa sezione è riservata agli amministratori.
            </p>
          </div>
        </div>
      );
    }
    return children;
  }

  // Verifica dello stato dell'utente
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

  // Verifica dei permessi per altre rotte protette
  if (requiredPermission && !AuthService.hasPermission(user, requiredPermission)) {
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