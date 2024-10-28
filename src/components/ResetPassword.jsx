import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import AuthService from "../services/authService";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await AuthService.resetPassword(email);
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-6 h-6" />
              Email Inviata
            </CardTitle>
            <CardDescription>
              Abbiamo inviato le istruzioni per il reset della password alla tua
              email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Segui le istruzioni contenute nell'email per reimpostare la tua
              password. Se non ricevi l'email entro qualche minuto, controlla la
              cartella spam.
            </p>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Torna al Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-6 h-6" />
            Reset Password
          </CardTitle>
          <CardDescription>
            Inserisci la tua email per ricevere le istruzioni per il reset della
            password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
              required
            />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Invio in corso..." : "Invia Email di Reset"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2 justify-center"
                onClick={() => navigate("/login")}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4" />
                Torna al Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
