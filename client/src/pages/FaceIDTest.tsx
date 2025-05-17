import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import WebAuthnVerifier from '../components/WebAuthnVerifier';

const FaceIDTest: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Biometric Authentication Test</h1>
          <p className="text-muted-foreground">
            Securely authenticate using your device's built-in biometric sensors
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-8">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>About Device Biometrics</CardTitle>
              <CardDescription>
                Understanding how biometric authentication works
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The Heirloom Identity Platform uses a hybrid authentication approach that combines:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>
                  <strong>Device biometrics</strong> (Face ID, Touch ID, Fingerprint sensors) - 
                  These verify that the user is physically present and authorized to use the device
                </li>
                <li>
                  <strong>Server-side facial recognition</strong> - 
                  This ensures the verified person matches the identity on record in our system
                </li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4">
                This approach offers enhanced security while maintaining privacy, as your actual 
                biometric data never leaves your device. Only cryptographic credentials are sent 
                to our servers.
              </p>
            </CardContent>
          </Card>
          
          <WebAuthnVerifier />
          
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Privacy and Security</CardTitle>
              <CardDescription>
                How we protect your biometric information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Your biometric data stays on your device</h3>
                <p className="text-sm">
                  When using Face ID, Touch ID, or other biometric methods, your actual biometric 
                  data (facial features, fingerprints) never leaves your device. The WebAuthn 
                  standard creates a secure credential that proves you've been verified without 
                  transmitting sensitive data.
                </p>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold">Server-side security</h3>
                <p className="text-sm">
                  Our server-side facial recognition component only processes images with your 
                  explicit permission and stores only the minimal data needed for verification. 
                  All data is encrypted and protected according to industry best practices.
                </p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <p className="text-xs text-muted-foreground">
                For more information about our security practices, please refer to our Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FaceIDTest;