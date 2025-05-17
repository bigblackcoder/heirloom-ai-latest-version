import React, { useState } from 'react';
import WebAuthnVerifier from '../components/WebAuthnVerifier';
import { WebAuthnAuthenticationResponse } from '../../../shared/webauthn';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ShieldCheckIcon, LockIcon, Scan, FingerprintIcon } from 'lucide-react';

// Using Scan icon instead of FaceIcon
const FaceIcon = Scan;

/**
 * Test page for WebAuthn and hybrid biometric authentication
 */
const FaceIDTest: React.FC = () => {
  // For testing, we'll use a dummy user
  const [testUserId] = useState('test-user-123');
  const [testUsername] = useState('testuser');
  
  // States for showing verification results
  const [verificationResult, setVerificationResult] = useState<WebAuthnAuthenticationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Handle successful authentication
  const handleSuccess = (result: WebAuthnAuthenticationResponse) => {
    setVerificationResult(result);
    setError(null);
    console.log('Authentication succeeded:', result);
  };
  
  // Handle authentication error
  const handleError = (error: Error) => {
    setError(error.message);
    setVerificationResult(null);
    console.error('Authentication failed:', error);
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 flex items-center">
        <ShieldCheckIcon className="mr-2 h-8 w-8" />
        Biometric Authentication Test
      </h1>
      
      <p className="text-muted-foreground mb-8">
        This page demonstrates different modes of biometric authentication, including device-based
        verification (like Face ID or Windows Hello) and hybrid approaches that combine device and server verification.
      </p>
      
      <Tabs defaultValue="register" className="mb-8">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="register">
            <FingerprintIcon className="mr-2 h-4 w-4" />
            Register
          </TabsTrigger>
          <TabsTrigger value="verify">
            <LockIcon className="mr-2 h-4 w-4" />
            Verify
          </TabsTrigger>
          <TabsTrigger value="hybrid">
            <FaceIcon className="mr-2 h-4 w-4" />
            Hybrid
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="register" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Biometric Registration</CardTitle>
              <CardDescription>
                Register your device biometrics (like Face ID, Touch ID, or Windows Hello) for secure authentication.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebAuthnVerifier
                userId={testUserId}
                username={testUsername}
                mode="register"
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="verify" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Device Biometric Verification</CardTitle>
              <CardDescription>
                Verify your identity using just your device biometrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebAuthnVerifier
                userId={testUserId}
                username={testUsername}
                mode="verify"
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="hybrid" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Hybrid Biometric Verification</CardTitle>
              <CardDescription>
                Enhanced security with both device biometrics and server-side facial verification.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WebAuthnVerifier
                userId={testUserId}
                username={testUsername}
                mode="hybrid"
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Display verification results */}
      {verificationResult && (
        <Alert className="mb-6">
          <AlertTitle className="flex items-center">
            <ShieldCheckIcon className="mr-2 h-4 w-4" />
            Authentication Successful
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2">
              <div><strong>User ID:</strong> {verificationResult.user?.id}</div>
              <div><strong>Username:</strong> {verificationResult.user?.username}</div>
              <div><strong>Verified:</strong> {verificationResult.user?.isVerified ? 'Yes' : 'No'}</div>
              
              {verificationResult.faceDetails && (
                <div className="mt-2">
                  <div><strong>Face Confidence:</strong> {verificationResult.faceDetails.confidence}%</div>
                  {verificationResult.faceDetails.results && (
                    <>
                      {verificationResult.faceDetails.results.age && (
                        <div><strong>Age Estimate:</strong> {verificationResult.faceDetails.results.age}</div>
                      )}
                      {verificationResult.faceDetails.results.dominant_emotion && (
                        <div><strong>Expression:</strong> {verificationResult.faceDetails.results.dominant_emotion}</div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Display error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>How Hybrid Authentication Works</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Your device verifies you are a real person using its built-in biometric system (Face ID, fingerprint, etc.)</li>
            <li>The system captures a facial image that is sent to the server</li>
            <li>Server-side facial recognition confirms your identity by matching against stored identity records</li>
            <li>This provides superior security by combining device validation with server identity verification</li>
            <li>Your actual biometric data never leaves your device - only the verification result is transmitted</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default FaceIDTest;