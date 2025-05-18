import React, { useState } from 'react';
import { useLocation } from 'wouter';

// Import UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const WebAuthnTest: React.FC = () => {
  // State
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [credentialId, setCredentialId] = useState<string | null>(null);
  
  // Navigation
  const [, setLocation] = useLocation();

  // Handle WebAuthn registration
  const handleRegister = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(null);

      // Generate random user ID for testing
      const userId = Math.floor(Math.random() * 10000);
      const username = `user_${userId}`;

      // Create challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Create credential creation options
      const publicKeyCredentialCreationOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            name: 'Heirloom Identity Platform',
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(userId.toString()),
            name: username,
            displayName: `Test User ${userId}`,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },  // ES256
            { type: 'public-key', alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred'
          },
          timeout: 60000,
          attestation: 'none'
        }
      };

      // Create WebAuthn credential
      const credential = await navigator.credentials.create(publicKeyCredentialCreationOptions);
      
      if (credential) {
        setCredentialId((credential as PublicKeyCredential).id);
        setSuccess('Registration successful! Your device is now registered for biometric authentication.');
      }
    } catch (err: any) {
      console.error('WebAuthn registration error:', err);
      setError(`Registration failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle WebAuthn authentication
  const handleAuthenticate = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setSuccess(null);

      // Create challenge
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // Create credential request options
      const publicKeyCredentialRequestOptions: CredentialRequestOptions = {
        publicKey: {
          challenge,
          rpId: window.location.hostname,
          allowCredentials: credentialId ? [{
            id: Uint8Array.from(
              atob(credentialId.replace(/-/g, '+').replace(/_/g, '/')), 
              c => c.charCodeAt(0)
            ),
            type: 'public-key',
            transports: ['internal']
          }] : undefined,
          userVerification: 'required',
          timeout: 60000
        }
      };

      // Get credentials
      const assertion = await navigator.credentials.get(publicKeyCredentialRequestOptions);
      
      if (assertion) {
        setSuccess('Authentication successful! Your identity has been verified by your device.');
        
        // In a real app, we would store an auth token
        localStorage.setItem('userToken', 'mock-auth-token-' + Date.now());
      }
    } catch (err: any) {
      console.error('WebAuthn authentication error:', err);
      setError(`Authentication failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="webauthn-test-page min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-b from-[#273414] to-[#1d2810]">
      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="border-b border-muted pb-4">
          <CardTitle className="text-center text-2xl font-bold text-[#273414]">WebAuthn Biometric Test</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Test your device's biometric authentication capabilities
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4 bg-[#e9f0e6] border-[#273414]/20">
              <AlertTitle className="text-[#273414]">Success</AlertTitle>
              <AlertDescription className="text-[#273414]/80">{success}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col gap-4 mt-4">
            <Button
              onClick={handleRegister}
              disabled={isProcessing}
              className="w-full bg-[#273414] hover:bg-[#1d2810] text-white"
            >
              {isProcessing ? 'Processing...' : 'Register Device'}
            </Button>
            
            <Button
              onClick={handleAuthenticate}
              disabled={isProcessing}
              variant={credentialId ? "default" : "outline"}
              className={`w-full ${credentialId ? 'bg-[#273414] hover:bg-[#1d2810] text-white' : 'border-[#273414] text-[#273414] hover:bg-[#e9f0e6]'}`}
            >
              {isProcessing ? 'Processing...' : 'Authenticate'}
            </Button>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t border-muted pt-4">
          <Button 
            variant="outline" 
            onClick={() => setLocation('/')}
            className="border-[#273414] text-[#273414] hover:bg-[#e9f0e6]"
          >
            Back to Home
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setLocation('/authenticate')}
            className="border-[#273414] text-[#273414] hover:bg-[#e9f0e6]"
          >
            Full Authentication
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WebAuthnTest;