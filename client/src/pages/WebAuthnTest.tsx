import React, { useState } from 'react';
import { WebAuthnVerifier } from '../components/WebAuthnVerifier';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';

export default function WebAuthnTest() {
  const [mode, setMode] = useState<'register' | 'authenticate'>('register');
  const [userId] = useState(() => localStorage.getItem('testUserId') || uuidv4());
  const [username] = useState('test_user');
  const [showComponent, setShowComponent] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Store the user ID in localStorage for persistence between page refreshes
  React.useEffect(() => {
    localStorage.setItem('testUserId', userId);
  }, [userId]);

  // Handle successful operation
  const handleSuccess = (response: any) => {
    console.log('WebAuthn operation successful:', response);
    setResult(response);
  };

  // Handle error
  const handleError = (error: Error) => {
    console.error('WebAuthn operation failed:', error);
    setResult({ error: error.message });
  };

  // Toggle the mode between register and authenticate
  const toggleMode = () => {
    setMode(mode === 'register' ? 'authenticate' : 'register');
    setShowComponent(false);
    setResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">WebAuthn Tester</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>
                Set up your WebAuthn test preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Current Mode:</p>
                <p className="text-lg">{mode === 'register' ? 'Registration' : 'Authentication'}</p>
              </div>
              
              <div>
                <p className="font-medium">Test User ID:</p>
                <p className="text-sm break-all">{userId}</p>
              </div>
              
              <div>
                <p className="font-medium">Username:</p>
                <p>{username}</p>
              </div>
              
              <div className="pt-4 space-x-2 flex">
                <Button onClick={toggleMode}>
                  Switch to {mode === 'register' ? 'Authentication' : 'Registration'}
                </Button>
                
                <Button onClick={() => setShowComponent(true)} variant="outline">
                  Start {mode === 'register' ? 'Registration' : 'Authentication'}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {result && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Result</CardTitle>
                <CardDescription>
                  Response from the WebAuthn operation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div>
          {showComponent && (
            <WebAuthnVerifier
              mode={mode}
              userId={userId}
              username={username}
              displayName="Test User"
              onSuccess={handleSuccess}
              onError={handleError}
            />
          )}
        </div>
      </div>
    </div>
  );
}