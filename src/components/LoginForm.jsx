import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export const LoginForm = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await onLogin(email, password);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
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
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
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
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Accesso in corso..." : "Accedi"}
              </Button>

              <div className="text-center text-sm text-gray-500 my-2">
                Non hai ancora un account?
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2 justify-center"
                onClick={() => navigate("/signup")}
                disabled={isLoading}
              >
                <UserPlus className="w-4 h-4" />
                Registrati
              </Button>

              <div className="text-center pt-2">
                <Button
                  variant="link"
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => navigate("/reset-password")}
                >
                  Password dimenticata?
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
