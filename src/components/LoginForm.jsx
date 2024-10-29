import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import AuthService from "../services/authService";

export const LoginForm = ({ onLogin, onSignUpClick, error: propError }) => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(propError);
  const [successMessage, setSuccessMessage] = useState(
    location.state?.message || ""
  );

  // Stati per il reset della password
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    setError(propError);
  }, [propError]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      await onLogin(email, password);
    } catch (error) {
      setError(error.message);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");

    try {
      await AuthService.sendPasswordResetEmail(resetEmail);
      setResetSuccess(true);
      setResetEmail("");
      // Chiudi il dialog dopo 3 secondi
      setTimeout(() => {
        setShowResetDialog(false);
        setResetSuccess(false);
      }, 3000);
    } catch (error) {
      setResetError(error.message);
    } finally {
      setResetLoading(false);
    }
  };

  const closeResetDialog = () => {
    setShowResetDialog(false);
    setResetEmail("");
    setResetError("");
    setResetSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="w-6 h-6" />
            Login Sistema Prenotazioni Tennis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowResetDialog(true)}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                Password dimenticata?
              </button>
            </div>

            <div className="space-y-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Accesso in corso...
                  </span>
                ) : (
                  "Accedi"
                )}
              </Button>

              <div className="text-center text-sm text-gray-500 my-2">
                Non hai ancora un account?
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2 justify-center"
                onClick={onSignUpClick}
                disabled={isLoading}
              >
                <UserPlus className="w-4 h-4" />
                Registrati
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={showResetDialog} onOpenChange={closeResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Inserisci la tua email per ricevere le istruzioni per il reset della password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              disabled={resetLoading || resetSuccess}
              required
            />

            {resetError && (
              <Alert variant="destructive">
                <AlertDescription>{resetError}</AlertDescription>
              </Alert>
            )}

            {resetSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  Email di reset inviata! Controlla la tua casella di posta.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeResetDialog}
                disabled={resetLoading}
              >
                Annulla
              </Button>
              <Button
                type="submit"
                disabled={resetLoading || resetSuccess || !resetEmail}
              >
                {resetLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Invio in corso...
                  </span>
                ) : resetSuccess ? (
                  "Inviato!"
                ) : (
                  "Invia email di reset"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};