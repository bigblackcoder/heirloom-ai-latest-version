import React, { useState } from 'react';
import { WebAuthnVerifier } from '../components/WebAuthnVerifier';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { v4 as uuidv4 } from 'uuid';

const WebAuthnTest: React.FC = () => {
  const [userId, setUserId] = useState<number>(1); // Default user ID
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showVerifier, setShowVerifier] = useState(false);

  // Generate a test user ID (for demo only)
  const generateTestUser = () => {
    // In a real app, this would be an actual user ID from your database
    setUserId(Math.floor(Math.random() * 10000) + 1);
    setShowVerifier(false);
    setResult(null);
    setError(null);
  };

  // Handle successful WebAuthn operation
  const handleSuccess = (data: any) => {
    setResult(data);
    setError(null);
  };

  // Handle WebAuthn error
  const handleError = (err: any) => {
    console.error('WebAuthn error:', err);
    setError(err.message || 'An error occurred during biometric verification');
    setResult(null);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">WebAuthn Identity Verification Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Control panel */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
            <CardDescription>
              Configure and test WebAuthn biometric authentication
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Current User ID: <span className="font-mono bg-muted p-1 rounded">{userId}</span>
                </p>
                
                <Button onClick={generateTestUser} className="w-full">
                  Generate Test User ID
                </Button>
              </div>
              
              <div>
                <Button 
                  onClick={() => setShowVerifier(true)} 
                  className="w-full"
                  disabled={showVerifier}
                >
                  Start Verification
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Verification Result:</h3>
                  <pre className="text-xs overflow-auto p-2 bg-background rounded">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Verifier */}
        <div>
          {showVerifier ? (
            <WebAuthnVerifier
              userId={userId}
              onSuccess={handleSuccess}
              onError={handleError}
              includeRegistration={true}
            />
          ) : (
            <Card className="w-full h-full flex flex-col justify-center items-center p-8">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">Click "Start Verification" to test WebAuthn</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-8 bg-muted p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">How WebAuthn Works:</h2>
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          <li><span className="font-medium text-foreground">Registration</span>: Your device creates a unique credential tied to this application</li>
          <li><span className="font-medium text-foreground">Biometric Check</span>: Your device verifies you're present using biometrics (FaceID, TouchID, Windows Hello, etc.)</li>
          <li><span className="font-medium text-foreground">Cryptographic Challenge</span>: Your device signs a unique challenge with your private key</li>
          <li><span className="font-medium text-foreground">No Biometric Data Sharing</span>: Your biometric data never leaves your device</li>
          <li><span className="font-medium text-foreground">Server Verification</span>: The server validates the signature using your public key</li>
        </ol>
      </div>
    </div>
  );
};

export default WebAuthnTest;