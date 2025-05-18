import React, { useState } from 'react';
import { WebAuthnVerifier, WebAuthnAuthenticationResponse } from '@/components/WebAuthnVerifier';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * WebAuthn Test Page
 * 
 * This page provides a testing interface for the WebAuthn authentication system.
 * It allows users to test both registration and authentication flows.
 */
const WebAuthnTest: React.FC = () => {
  // User information for testing
  const [userId, setUserId] = useState<number>(1);
  const [username, setUsername] = useState<string>('testuser');
  const [displayName, setDisplayName] = useState<string>('Test User');
  
  // Authentication state
  const [activeTab, setActiveTab] = useState<string>('register');
  const [authResult, setAuthResult] = useState<WebAuthnAuthenticationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle successful authentication
  const handleSuccess = (response: WebAuthnAuthenticationResponse) => {
    setAuthResult(response);
    setError(null);

    // If registration was successful, switch to authenticate tab
    if (activeTab === 'register' && response.verified) {
      setTimeout(() => setActiveTab('authenticate'), 2000);
    }
  };

  // Handle authentication errors
  const handleError = (err: Error) => {
    setError(err.message);
    setAuthResult(null);
  };

  // Reset the test
  const resetTest = () => {
    setAuthResult(null);
    setError(null);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">WebAuthn Biometric Authentication Test</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Enter the user information to test WebAuthn authentication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  type="number"
                  value={userId}
                  onChange={(e) => setUserId(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="register">Register</TabsTrigger>
            <TabsTrigger value="authenticate">Authenticate</TabsTrigger>
          </TabsList>
          
          <TabsContent value="register" className="mb-8">
            <WebAuthnVerifier
              userId={userId}
              username={username}
              displayName={displayName}
              mode="register"
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </TabsContent>
          
          <TabsContent value="authenticate" className="mb-8">
            <WebAuthnVerifier
              userId={userId}
              username={username}
              displayName={displayName}
              mode="authenticate"
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </TabsContent>
        </Tabs>

        {/* Show the authentication result */}
        {authResult && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Authentication Result</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={`font-bold ${authResult.verified ? 'text-green-600' : 'text-red-600'}`}>
                    {authResult.verified ? 'Verified' : 'Failed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">User ID:</span>
                  <span>{authResult.userId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Message:</span>
                  <span>{authResult.message}</span>
                </div>
                {authResult.credentialId && (
                  <div className="flex justify-between">
                    <span className="font-medium">Credential ID:</span>
                    <span className="font-mono text-xs truncate max-w-xs">{authResult.credentialId}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Show any errors */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Reset button */}
        <div className="flex justify-center">
          <Button onClick={resetTest}>Reset Test</Button>
        </div>
      </div>
    </div>
  );
};

export default WebAuthnTest;