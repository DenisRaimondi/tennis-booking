import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import AuthService from "../services/authService";
import { Mail, CheckCircle, XCircle, Loader } from "lucide-react";

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("waiting"); // waiting, verifying, success, error
  const [error, setError] = useState("");

  useEffect(() => {
    const oobCode = searchParams.get("oobCode");

    // Se non c'è un codice, significa che siamo appena arrivati dalla registrazione
    if (!oobCode) {
      setStatus("waiting");
      return;
    }

    // Se c'è un codice, procedi con la verifica
    const verifyEmail = async () => {
      setStatus("verifying");
      try {
        await AuthService.verifyEmail(oobCode);
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setError(error.message);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResendEmail = async () => {
    try {
      await AuthService.sendVerificationEmail();
      setError("");
      setStatus("waiting");
    } catch (error) {
      setError("Errore nell'invio dell'email di verifica. Riprova più tardi.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-6 h-6" />
            Verifica Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader className="w-8 h-8 animate-spin text-blue-500" />
              <p>Verifica dell'email in corso...</p>
            </div>
          )}

          {status === "waiting" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-8">
                <Mail className="w-16 h-16 text-blue-500" />
                <h3 className="text-xl font-bold text-blue-700">
                  Controlla la tua email
                </h3>
                <p className="text-center text-gray-600">
                  Ti abbiamo inviato un'email con un link di verifica. Clicca
                  sul link nell'email per verificare il tuo account.
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  className="w-full"
                >
                  Invia nuovamente l'email
                </Button>
                <Button onClick={() => navigate("/login")} className="w-full">
                  Torna al Login
                </Button>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-8">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h3 className="text-xl font-bold text-green-700">
                  Email Verificata con Successo!
                </h3>
              </div>
              <Alert>
                <AlertDescription>
                  La tua email è stata verificata. Il tuo account è ora in
                  attesa di approvazione da parte dell'amministratore. Riceverai
                  una notifica quando il tuo account sarà attivato.
                </AlertDescription>
              </Alert>
              <Button onClick={() => navigate("/login")} className="w-full">
                Torna al Login
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-4 py-8">
                <XCircle className="w-16 h-16 text-red-500" />
                <h3 className="text-xl font-bold text-red-700">
                  Errore di Verifica
                </h3>
              </div>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Button onClick={() => navigate("/login")} className="w-full">
                  Torna al Login
                </Button>
                <Button
                  variant="outline"
                  onClick={handleResendEmail}
                  className="w-full"
                >
                  Richiedi nuova email di verifica
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
