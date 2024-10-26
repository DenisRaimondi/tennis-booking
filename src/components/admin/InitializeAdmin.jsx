import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import authService from '../../services/authService';

export const InitializeAdmin = () => {
  const [secretKey, setSecretKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInitialize = async (e) => {
    e.preventDefault();
    
    // Verifica la chiave segreta (dovresti usare un valore sicuro in produzione)
    if (secretKey !== process.env.REACT_APP_ADMIN_INIT_KEY) {
      setError('Chiave non valida');
      return;
    }

    try {
      setLoading(true);
      await authService.initializeSuperUser();
      setSuccess('Super user inizializzato con successo!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Inizializza Super User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInitialize} className="space-y-4">
            <Input
              type="password"
              placeholder="Chiave di inizializzazione"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required
            />
            
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

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Inizializzazione...' : 'Inizializza'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};