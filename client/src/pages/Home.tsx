import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheckIcon, FingerprintIcon, KeyIcon } from 'lucide-react';

/**
 * Home page component
 */
const HomePage: React.FC = () => {
  return (
    <div className="container max-w-6xl mx-auto py-12 px-4">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Heirloom Identity Platform</h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          Advanced identity verification with enhanced security through hybrid biometric authentication
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="h-6 w-6 text-primary" />
              Secure Biometric Authentication
            </CardTitle>
            <CardDescription>
              Combining device biometrics with server-side facial verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Our hybrid biometric approach provides multiple layers of security:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Device-based biometrics (Apple Face ID, Touch ID, Windows Hello)</li>
              <li>Server-side facial recognition and matching</li>
              <li>Non-transferable credentials with real-time verification</li>
              <li>Privacy-preserving approach keeps sensitive data on your device</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Link href="/webauthn-test">
              <Button className="w-full">
                <FingerprintIcon className="mr-2 h-4 w-4" />
                Try Biometric Authentication
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyIcon className="h-6 w-6 text-primary" />
              Identity Management
            </CardTitle>
            <CardDescription>
              Secure storage and management of verified identity data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Our platform helps you securely manage your identity data:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Create identity capsules with verified personal information</li>
              <li>Control what information is shared with third parties</li>
              <li>Verify identity across devices and platforms</li>
              <li>Blockchain-based tamper-proof verification records</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Coming Soon
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="bg-muted rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-bold mb-4 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-card rounded p-4 text-center">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-primary font-bold">1</span>
            </div>
            <h3 className="font-medium mb-2">Device Verification</h3>
            <p className="text-sm text-muted-foreground">
              Your device first verifies you using its built-in biometric system
            </p>
          </div>
          <div className="bg-card rounded p-4 text-center">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-primary font-bold">2</span>
            </div>
            <h3 className="font-medium mb-2">Server Authentication</h3>
            <p className="text-sm text-muted-foreground">
              Our server then verifies your identity against stored records
            </p>
          </div>
          <div className="bg-card rounded p-4 text-center">
            <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-primary font-bold">3</span>
            </div>
            <h3 className="font-medium mb-2">Secure Access</h3>
            <p className="text-sm text-muted-foreground">
              Multi-factor biometric verification provides enhanced security
            </p>
          </div>
        </div>
      </div>

      <footer className="text-center text-muted-foreground">
        <p>© 2025 Heirloom Identity Platform</p>
        <p className="text-sm mt-1">Secure, Private, Verifiable</p>
      </footer>
    </div>
  );
};

export default HomePage;