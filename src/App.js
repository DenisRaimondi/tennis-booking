import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
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
import { sendEmailVerification } from "firebase/auth";

// Componente separato per la gestione del login
const LoginRoute = ({ currentUser, onLogin, error }) => {
  const navigate = useNavigate();

  if (currentUser) {
    return <Navigate to="/" />;
  }

  return (
    <LoginForm
      onLogin={onLogin}
      onSignUpClick={() => navigate("/signup")}
      error={error}
    />
  );
};

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);

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

  const handleLogin = async (email, password) => {
    try {
      const user = await AuthService.login(email, password);
      if (!user.emailVerified) {
        await sendEmailVerification(user);

        throw new Error(
          "Email non verificata. Controlla l'email e continua con la procedura di verifica"
        );
      }
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
    setCurrentUser((prevUser) => ({
      ...prevUser,
      ...updatedUser,
    }));
  };

  const handleSignUp = async (userData) => {
    try {
      setError("");
      await AuthService.register(userData);
      setShowSignUp(false);
      setError(
        "Registrazione completata! Verifica la tua email per procedere."
      );
    } catch (error) {
      // Non propaghiamo l'errore, lasciamo che sia il SignUpForm a gestirlo
      throw error; // Rilanciamo l'errore per farlo gestire al SignUpForm
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      {currentUser && <Navbar user={currentUser} onLogout={handleLogout} />}

      <Routes>
        <Route
          path="/login"
          element={
            <LoginRoute currentUser={currentUser} onLogin={handleLogin} />
          }
        />

        <Route
          path="/signup"
          element={
            currentUser ? (
              <Navigate to="/" />
            ) : (
              <SignUpForm
                onSignUp={handleSignUp}
                onBackToLogin={() => Navigate("/login")}
              />
            )
          }
        />

        <Route path="/verify-email" element={<EmailVerification />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute user={currentUser}>
              <UserProfile
                currentUser={currentUser}
                onUserUpdate={handleUserUpdate}
                onLogout={handleLogout}
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

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
