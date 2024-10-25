import React, { useState } from "react";
import { UserPlus, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";

export const SignUpForm = ({ onSignUp, onBackToLogin }) => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validazione
    if (
      !formData.username ||
      !formData.password ||
      !formData.name ||
      !formData.email
    ) {
      setError("Tutti i campi sono obbligatori");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Le password non coincidono");
      return;
    }

    if (formData.password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }

    try {
      await onSignUp(formData);
    } catch (err) {
      setError(err.message);
    }
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
              />
            </div>
            <div>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="w-full"
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
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full">
              Registrati
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={onBackToLogin}
            >
              <ArrowLeft className="w-4 h-4" />
              Torna al Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
