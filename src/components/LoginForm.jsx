import React, { useState } from "react";
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

export const LoginForm = ({ onLogin, onSignUpClick, error }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
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
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Button type="submit" className="w-full">
                Accedi
              </Button>

              <div className="text-center text-sm text-gray-500">
                Non hai ancora un account?
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center gap-2 justify-center"
                onClick={onSignUpClick}
              >
                <UserPlus className="w-4 h-4" />
                Registrati
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
