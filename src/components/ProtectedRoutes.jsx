import React from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/authService";

export const ProtectedRoute = ({ children, requiredPermission, user }) => {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (
    requiredPermission &&
    !AuthService.hasPermission(user, requiredPermission)
  ) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

// Uso:
// <ProtectedRoute
//   requiredPermission={Permissions.MANAGE_USERS}
//   user={currentUser}
// >
//   <AdminDashboard />
// </ProtectedRoute>
