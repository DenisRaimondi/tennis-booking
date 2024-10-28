import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { UserProfile } from "./components/UserProfile";
import TennisBookingSystem from "./components/TennisBookingSystem";
import { LoginForm } from "./components/LoginForm";
import { SignUpForm } from "./components/SignUpForm";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { EmailVerification } from "./components/EmailVerification";
import { ProtectedRoute } from "./components/ProtectedRoutes";
import AuthService from "./services/authService";
import { ResetPassword } from "./components/ResetPassword";

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await AuthService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error initializing auth:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleSignUp = async (userData) => {
    try {
      await AuthService.register(userData);
      // Dopo la registrazione, reindirizza alla pagina di verifica email
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  };

  const handleLogin = async (email, password) => {
    try {
      const user = await AuthService.login(email, password);
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const handleUserUpdate = (updatedUser) => {
    console.log("Updating user state:", updatedUser);
    setCurrentUser((prev) => ({
      ...prev,
      ...updatedUser,
    }));
  };

  if (loading) {
    return <div>Caricamento...</div>;
  }

  return (
    <Router>
      {currentUser && <Navbar user={currentUser} onLogout={handleLogout} />}

      <Routes>
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/" />
            ) : (
              <LoginForm onLogin={handleLogin} error={error} />
            )
          }
        />

        <Route
          path="/signup"
          element={
            currentUser ? (
              <Navigate to="/" />
            ) : (
              <SignUpForm onSignUp={handleSignUp} />
            )
          }
        />
        <Route
          path="/reset-password"
          element={currentUser ? <Navigate to="/" /> : <ResetPassword />}
        />
        <Route path="/verify-email" element={<EmailVerification />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={currentUser}>
              <UserProfile
                currentUser={currentUser}
                onUserUpdate={handleUserUpdate}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute user={currentUser} requiredPermission="SUPER_USER">
              <AdminDashboard currentUser={currentUser} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/"
          element={
            <ProtectedRoute user={currentUser}>
              <TennisBookingSystem currentUser={currentUser} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
