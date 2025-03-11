import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Star, Bell, CheckCircle, Clock, ShieldCheck, CircleUser } from 'lucide-react';

export default function AnimationsDemo() {
  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="flex flex-col items-center justify-center py-8">
        <h1 className="text-3xl font-bold text-center">Heirloom Identity Platform</h1>
        <p className="text-lg text-muted-foreground mt-2">Animations & Micro-Interactions Demo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Text Animation */}
        <Card>
          <CardHeader>
            <CardTitle>Text Animations</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Various text animations will be displayed here once implemented.</p>
          </CardContent>
        </Card>

        {/* Button Animation */}
        <Card>
          <CardHeader>
            <CardTitle>Button Animations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Default:</p>
              <Button>Verify Identity</Button>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Secondary:</p>
              <Button variant="secondary">Connect Wallet</Button>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Outline:</p>
              <Button variant="outline">Create Capsule</Button>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Destructive:</p>
              <Button variant="destructive">Delete Data</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Icon Animation */}
        <Card>
          <CardHeader>
            <CardTitle>Icon Animations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              <div className="flex flex-col items-center justify-center">
                <User className="h-8 w-8 text-primary" />
                <p className="text-sm mt-2">User</p>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <Star className="h-8 w-8 text-primary" />
                <p className="text-sm mt-2">Star</p>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <Bell className="h-8 w-8 text-primary" />
                <p className="text-sm mt-2">Bell</p>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <CheckCircle className="h-8 w-8 text-primary" />
                <p className="text-sm mt-2">Check</p>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <Clock className="h-8 w-8 text-primary" />
                <p className="text-sm mt-2">Clock</p>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <p className="text-sm mt-2">Shield</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Animation */}
        <Card>
          <CardHeader>
            <CardTitle>Input Fields</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Default:</p>
              <input 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Username"
              />
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Email:</p>
              <input 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                type="email"
                placeholder="Email Address"
              />
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Password:</p>
              <input 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                type="password"
                placeholder="Password"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lists Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Lists</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-4">Identity Tasks:</p>
              <div className="space-y-2">
                <div className="flex items-center p-3 bg-secondary rounded-md">
                  <CircleUser className="mr-2 h-5 w-5 text-primary" />
                  <span>Complete identity verification</span>
                </div>
                <div className="flex items-center p-3 bg-secondary rounded-md">
                  <CheckCircle className="mr-2 h-5 w-5 text-primary" />
                  <span>Create your first identity capsule</span>
                </div>
                <div className="flex items-center p-3 bg-secondary rounded-md">
                  <Star className="mr-2 h-5 w-5 text-primary" />
                  <span>Connect to trusted AI services</span>
                </div>
                <div className="flex items-center p-3 bg-secondary rounded-md">
                  <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                  <span>Manage your verified credentials</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-4">Status List:</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-secondary rounded-md">
                  <span>Face Verification</span>
                  <span className="text-primary">Complete</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary rounded-md">
                  <span>Identity Capsule</span>
                  <span className="text-primary">Active</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary rounded-md">
                  <span>AI Service Connections</span>
                  <span className="text-muted-foreground">3 Active</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-secondary rounded-md">
                  <span>Blockchain Integration</span>
                  <span className="text-yellow-500">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">Feature Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Face Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-6">
                <CircleUser className="h-16 w-16 text-primary" />
              </div>
              <p>Secure biometric verification with confidence scoring</p>
            </CardContent>
            <div className="p-4 border-t flex justify-end">
              <Button size="sm">Verify</Button>
            </div>
          </Card>
          
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Identity Capsule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-6">
                <ShieldCheck className="h-16 w-16 text-primary" />
              </div>
              <p>Store and manage your verified identity data</p>
            </CardContent>
            <div className="p-4 border-t flex justify-end">
              <Button size="sm" variant="outline">Create</Button>
            </div>
          </Card>
          
          <Card className="h-full">
            <CardHeader>
              <CardTitle>AI Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-6">
                <Star className="h-16 w-16 text-primary" />
              </div>
              <p>Connect to trusted AI services securely</p>
            </CardContent>
            <div className="p-4 border-t flex justify-end">
              <Button size="sm" variant="secondary">Connect</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}