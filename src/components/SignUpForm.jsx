import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Alert, AlertDescription } from "../components/ui/alert";
import GDPRConsent from "./GDPRConsent";

export const SignUpForm = ({ onSignUp, onBackToLogin, error }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
  });

  const [consents, setConsents] = useState({
    terms: false,
    privacy: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validateForm = () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.phone
    ) {
      setValidationError("Tutti i campi sono obbligatori");
      return false;
    }

    if (!consents.terms || !consents.privacy) {
      setValidationError(
        "È necessario accettare i termini e l'informativa sulla privacy"
      );
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidationError("Email non valida");
      return false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setValidationError("Inserisci un numero di telefono valido (10 cifre)");
      return false;
    }

    if (formData.password.length < 6) {
      setValidationError("La password deve essere di almeno 6 caratteri");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError("Le password non coincidono");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setValidationError(""); // Reset any previous error

    try {
      await onSignUp({
        ...formData,
        gdprConsents: {
          terms: consents.terms,
          privacy: consents.privacy,
          acceptedAt: new Date().toISOString(),
        },
        status: "PENDING",
        role: "USER",
      });
    } catch (error) {
      // Gestione specifica degli errori di Firebase
      if (error.code === "auth/email-already-in-use") {
        setValidationError("Email già registrata");
      } else {
        setValidationError(error.message || "Errore durante la registrazione");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setValidationError("");
  };

  const handleConsentsChange = (newConsents) => {
    setConsents(newConsents);
    setValidationError("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-6 h-6" />
            Registrazione
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                name="name"
                placeholder="Nome e Cognome"
                value={formData.name}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            <div>
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="w-full"
                pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                title="Inserisci un indirizzo email valido, ad esempio: esempio@email.com"
                required
              />
            </div>
            <div>
              <Input
                type="tel"
                name="phone"
                placeholder="Numero di telefono"
                value={formData.phone}
                onChange={handleChange}
                className="w-full"
                pattern="^(\+39)?\s?3\d{2}\s?\d{6,7}$"
                title="Inserisci un numero di telefono valido. Formato: +39 3XX XXX XXXX o 3XX XXX XXXX"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Conferma Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full"
                pattern="^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$" // esempio di pattern
                title="La password deve contenere almeno 8 caratteri, includere almeno una lettera e un numero"
                required
              />
            </div>

            <GDPRConsent
              consents={consents}
              onChange={handleConsentsChange}
              className="mt-6"
            />

            {(validationError || error) && (
              <Alert variant="destructive">
                <AlertDescription>{validationError || error}</AlertDescription>
              </Alert>
            )}

            <div className="text-sm text-gray-500">
              Dopo la registrazione, il tuo account dovrà essere approvato da un
              amministratore prima di poter essere utilizzato.
            </div>

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registrazione in corso..." : "Registrati"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2 justify-center"
                onClick={() => navigate("/login", { error: "" })}
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
