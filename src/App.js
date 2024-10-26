import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import authService from "./services/authService";
import TennisBookingSystem from "./components/TennisBookingSystem";
import { LoginForm } from "./components/LoginForm";
import { SignUpForm } from "./components/SignUpForm";
import { Navbar } from "./components/Navbar";
import { UserProfile } from "./components/UserProfile";
import { AdminDashboard } from "./components/admin/AdminDashboard";

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    // Verifica se c'è un utente già loggato
    const savedUser = localStorage.getItem("tennis-user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = async (email, password) => {
    try {
      setError("");
      const user = await authService.login(email, password);
      setCurrentUser(user);
      localStorage.setItem("tennis-user", JSON.stringify(user));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setCurrentUser(null);
      localStorage.removeItem("tennis-user");
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignUp = async (userData) => {
    try {
      setError("");
      await authService.register(userData);
      setShowSignUp(false);
      setError("Registrazione completata! In attesa di approvazione.");
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {currentUser && <Navbar user={currentUser} onLogout={handleLogout} />}

        {error && (
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        <Routes>
          <Route
            path="/login"
            element={
              !currentUser ? (
                showSignUp ? (
                  <SignUpForm
                    onSignUp={handleSignUp}
                    onBackToLogin={() => setShowSignUp(false)}
                    error={error}
                  />
                ) : (
                  <LoginForm
                    onLogin={handleLogin}
                    onSignUpClick={() => setShowSignUp(true)}
                    error={error}
                  />
                )
              ) : (
                <Navigate to="/" />
              )
            }
          />

          <Route
            path="/"
            element={
              currentUser ? (
                <TennisBookingSystem currentUser={currentUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/profile"
            element={
              currentUser ? (
                <UserProfile currentUser={currentUser} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/admin/*"
            element={
              currentUser?.role === "SUPER_USER" ? (
                <AdminDashboard currentUser={currentUser} />
              ) : (
                <Navigate to="/unauthorized" />
              )
            }
          />

          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-red-600 mb-4">
                    Accesso non autorizzato
                  </h1>
                  <p className="text-gray-600">
                    Non hai i permessi necessari per accedere a questa pagina.
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Torna indietro
                  </button>
                </div>
              </div>
            }
          />

          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">
                    Pagina non trovata
                  </h1>
                  <p className="text-gray-600">
                    La pagina che stai cercando non esiste.
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Torna indietro
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
