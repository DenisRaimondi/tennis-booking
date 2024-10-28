import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { User, Phone, Mail, Lock } from "lucide-react";
import AuthService from "../services/authService";

export const UserProfile = ({ currentUser, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
    }));
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
    setSuccess("");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!isEditing) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      let hasChanges = false;
      let updatedUserData = null;

      // Verifica se ci sono modifiche ai dati del profilo
      if (
        formData.name !== currentUser.name ||
        formData.phone !== currentUser.phone
      ) {
        updatedUserData = await AuthService.updateUserProfile(currentUser.uid, {
          name: formData.name,
          phone: formData.phone,
        });
        hasChanges = true;

        // Aggiorna lo stato globale dell'utente
        if (updatedUserData && onUserUpdate) {
          onUserUpdate({
            ...currentUser,
            ...updatedUserData,
          });
        }
      }

      // Verifica se è necessario aggiornare la password
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error("Le password non coincidono");
        }
        if (!formData.currentPassword) {
          throw new Error("Inserisci la password attuale");
        }
        await AuthService.changePassword(
          formData.currentPassword,
          formData.newPassword
        );
        hasChanges = true;
      }

      if (hasChanges) {
        setSuccess("Profilo aggiornato con successo");
        setIsEditing(false);

        // Aggiorna il form con i nuovi dati
        if (updatedUserData) {
          setFormData((prev) => ({
            ...prev,
            name: updatedUserData.name || prev.name,
            phone: updatedUserData.phone || prev.phone,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
        } else {
          // Reset solo dei campi password
          setFormData((prev) => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
        }
      } else {
        setError("Nessuna modifica effettuata");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
    setFormData({
      name: currentUser?.name || "",
      phone: currentUser?.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-6 h-6" />
            Profilo Utente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="w-4 h-4" />
                  Nome e Cognome
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>

              {/* Email (non modificabile) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <Input
                  type="email"
                  value={currentUser?.email}
                  disabled
                  className="w-full bg-gray-50"
                />
              </div>

              {/* Telefono */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Phone className="w-4 h-4" />
                  Telefono
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full"
                />
              </div>

              {/* Cambio Password */}
              {isEditing && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="flex items-center gap-2 text-lg font-medium mb-4">
                    <Lock className="w-5 h-5" />
                    Cambio Password
                  </h3>
                  <div className="space-y-4">
                    <Input
                      type="password"
                      name="currentPassword"
                      placeholder="Password attuale"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <Input
                      type="password"
                      name="newPassword"
                      placeholder="Nuova password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full"
                    />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="Conferma nuova password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={handleStartEditing}
                  className="w-full"
                >
                  Modifica Profilo
                </Button>
              ) : (
                <>
                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Salvataggio..." : "Salva Modifiche"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="w-full"
                  >
                    Annulla
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
