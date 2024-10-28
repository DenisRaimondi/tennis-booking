import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import authService from "../services/authService";
import { Mail, CheckCircle, XCircle, Loader } from "lucide-react";

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const oobCode = searchParams.get("oobCode");

      if (!oobCode) {
        setStatus("error");
        setError("Codice di verifica mancante");
        return;
      }

      try {
        await authService.verifyEmail(oobCode);
        setStatus("success");
      } catch (error) {
        setStatus("error");
        setError(error.message);
      }
    };

    verifyEmail();
  }, [searchParams]);

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
                  onClick={() => authService.sendVerificationEmail()}
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
