import React from 'react';
import WebAuthnVerifier from '../components/WebAuthnVerifier';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export function FaceIDTest() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Device Biometrics Test
          </CardTitle>
          <CardDescription>
            This page tests the integration with your device's native biometric system (Face ID/Touch ID)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your device's biometric system will be used as the primary authentication method, 
            followed by an optional server-side face verification as a second factor.
          </p>
          <div className="bg-amber-50 border border-amber-100 rounded-md p-3 mb-4">
            <p className="text-amber-800 text-sm font-medium">How it works:</p>
            <ol className="text-amber-700 text-sm mt-2 list-decimal ml-4 space-y-1">
              <li>When you click register, your device will prompt you to use Face ID/Touch ID</li>
              <li>Your biometric data never leaves your device</li>
              <li>If you enable hybrid mode, your camera will capture a photo for server verification as a second factor</li>
            </ol>
          </div>
        </CardContent>
      </Card>
      
      <WebAuthnVerifier />
    </div>
  );
}

export default FaceIDTest;