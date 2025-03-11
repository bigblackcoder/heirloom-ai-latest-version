import React from 'react';
import { HeirloomLogo } from '@/components/heirloom-logo';
import { AnimatedButton } from '@/components/ui/animated-button';
import { AnimatedCard } from '@/components/ui/animated-card';
import { AnimatedInput } from '@/components/ui/animated-input';
import { AnimatedIcon } from '@/components/ui/animated-icon';
import { AnimatedList } from '@/components/ui/animated-list';
import { AnimatedText } from '@/components/ui/animated-text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, CircleUser, Star, Clock, ShieldCheck, 
  Bell, CheckCircle, FileCheck, HandCoins, Leaf 
} from 'lucide-react';

export default function AnimationsDemo() {
  return (
    <div className="container mx-auto p-4 pb-24">
      <div className="flex flex-col items-center justify-center py-8">
        <HeirloomLogo className="w-16 h-16 mb-2" />
        <AnimatedText 
          text="Heirloom Identity Platform" 
          as="h1"
          className="text-3xl font-bold text-center" 
          animationType="letterByLetter"
          staggerChildren={0.05}
        />
        <AnimatedText 
          text="Animations & Micro-Interactions Demo" 
          as="p"
          className="text-lg text-muted-foreground mt-2" 
          animationType="fade"
          delay={1}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {/* Animated Text Section */}
        <AnimatedCard 
          title={<div className="text-xl font-semibold">Animated Text</div>}
          description="Different text animation styles for dynamic content"
          animationType="fade"
          className="h-auto"
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Letter by Letter:</p>
              <AnimatedText
                text="Secure identity verification"
                className="text-lg font-medium"
                animationType="letterByLetter"
                staggerChildren={0.05}
              />
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Word by Word:</p>
              <AnimatedText
                text="Protect your digital identity with confidence"
                className="text-lg font-medium"
                animationType="wordByWord"
              />
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Highlight:</p>
              <AnimatedText
                text="Advanced biometric verification"
                className="text-lg font-medium"
                animationType="highlight"
                highlightColor="rgba(30, 60, 13, 0.2)"
              />
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Typewriter:</p>
              <AnimatedText
                text="Your identity, secured."
                className="text-lg font-medium"
                animationType="typewriter"
              />
            </div>
          </div>
        </AnimatedCard>

        {/* Animated Buttons Section */}
        <AnimatedCard 
          title={<div className="text-xl font-semibold">Animated Buttons</div>}
          description="Interactive button animations for better engagement"
          animationType="fade"
          animationDelay={0.1}
          className="h-auto"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Scale:</p>
              <AnimatedButton animationType="scale">
                Verify Identity
              </AnimatedButton>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Pulse:</p>
              <AnimatedButton animationType="pulse" variant="secondary">
                Connect Wallet
              </AnimatedButton>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Ripple:</p>
              <AnimatedButton animationType="ripple" variant="outline">
                Create Capsule
              </AnimatedButton>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Bounce:</p>
              <AnimatedButton animationType="bounce" variant="destructive">
                Delete Data
              </AnimatedButton>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Shadow:</p>
              <AnimatedButton animationType="shadow">
                Save Changes
              </AnimatedButton>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Loading State:</p>
              <AnimatedButton isLoading={true}>
                Processing...
              </AnimatedButton>
            </div>
          </div>
        </AnimatedCard>

        {/* Animated Icons Section */}
        <AnimatedCard 
          title={<div className="text-xl font-semibold">Animated Icons</div>}
          description="Visual cues and animated icons for better UX"
          animationType="fade"
          animationDelay={0.2}
          className="h-auto"
        >
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center">
              <AnimatedIcon 
                icon={<User />} 
                animationType="pulse" 
                size="lg" 
                color="#1e3c0d"
              />
              <p className="text-sm mt-2">Pulse</p>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <AnimatedIcon 
                icon={<Star />} 
                animationType="rotate" 
                size="lg" 
                color="#1e3c0d"
              />
              <p className="text-sm mt-2">Rotate</p>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <AnimatedIcon 
                icon={<Bell />} 
                animationType="shake" 
                size="lg" 
                color="#1e3c0d"
              />
              <p className="text-sm mt-2">Shake</p>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <AnimatedIcon 
                icon={<CheckCircle />} 
                animationType="bounce" 
                size="lg" 
                color="#1e3c0d"
              />
              <p className="text-sm mt-2">Bounce</p>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <AnimatedIcon 
                icon={<Clock />} 
                animationType="blink" 
                size="lg" 
                color="#1e3c0d"
              />
              <p className="text-sm mt-2">Blink</p>
            </div>
            
            <div className="flex flex-col items-center justify-center">
              <AnimatedIcon 
                icon={<ShieldCheck />} 
                animationType="wiggle" 
                size="lg" 
                color="#1e3c0d"
                onClick={() => alert('Icon clicked!')}
              />
              <p className="text-sm mt-2">Wiggle</p>
            </div>
          </div>
        </AnimatedCard>

        {/* Animated Inputs Section */}
        <AnimatedCard 
          title={<div className="text-xl font-semibold">Animated Inputs</div>}
          description="Interactive form elements with validation states"
          animationType="fade"
          animationDelay={0.3}
          className="h-auto"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Default Input:</p>
              <AnimatedInput 
                placeholder="Username" 
                animateOnFocus={true}
              />
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Floating Label:</p>
              <AnimatedInput 
                id="email"
                placeholder="Email Address" 
                floatingLabel={true}
              />
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Error State:</p>
              <AnimatedInput 
                placeholder="Password" 
                type="password"
                error={true}
                errorMessage="Password must be at least 8 characters"
              />
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">Success State:</p>
              <AnimatedInput 
                placeholder="Verification Code" 
                successState={true}
                defaultValue="123456"
              />
            </div>
          </div>
        </AnimatedCard>
      </div>

      {/* Animated Lists Section */}
      <AnimatedCard 
        title={<div className="text-xl font-semibold">Animated Lists</div>}
        description="Staggered animations for list items"
        animationType="fade"
        animationDelay={0.4}
        className="mt-8 h-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-4">Fade Animation:</p>
            <AnimatedList 
              animationType="fade" 
              className="space-y-2"
              itemClassName="p-3 bg-secondary rounded-md"
            >
              <div className="flex items-center">
                <CircleUser className="mr-2 h-5 w-5 text-primary" />
                <span>Complete identity verification</span>
              </div>
              <div className="flex items-center">
                <FileCheck className="mr-2 h-5 w-5 text-primary" />
                <span>Create your first identity capsule</span>
              </div>
              <div className="flex items-center">
                <HandCoins className="mr-2 h-5 w-5 text-primary" />
                <span>Connect to trusted AI services</span>
              </div>
              <div className="flex items-center">
                <Leaf className="mr-2 h-5 w-5 text-primary" />
                <span>Manage your verified credentials</span>
              </div>
            </AnimatedList>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground mb-4">Slide Animation:</p>
            <AnimatedList 
              animationType="slide" 
              animationDirection="left"
              className="space-y-2"
              itemClassName="p-3 bg-secondary rounded-md"
            >
              <div className="flex justify-between items-center">
                <span>Face Verification</span>
                <span className="text-primary">Complete</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Identity Capsule</span>
                <span className="text-primary">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span>AI Service Connections</span>
                <span className="text-muted-foreground">3 Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Blockchain Integration</span>
                <span className="text-yellow-500">Pending</span>
              </div>
            </AnimatedList>
          </div>
        </div>
      </AnimatedCard>

      {/* Animated Cards Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-6">Animated Cards</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <AnimatedCard
            title="Face Verification"
            description="Secure biometric verification with confidence scoring"
            footer={
              <div className="w-full flex justify-end">
                <AnimatedButton size="sm" animationType="scale">Verify</AnimatedButton>
              </div>
            }
            animationType="fade"
            className="h-full"
          >
            <div className="flex items-center justify-center py-6">
              <AnimatedIcon 
                icon={<CircleUser />} 
                size="xl" 
                animationType="pulse" 
                color="#1e3c0d" 
              />
            </div>
          </AnimatedCard>
          
          <AnimatedCard
            title="Identity Capsule"
            description="Store and manage your verified identity data"
            footer={
              <div className="w-full flex justify-end">
                <AnimatedButton size="sm" variant="outline" animationType="scale">Create</AnimatedButton>
              </div>
            }
            animationType="slide"
            animationDirection="up"
            animationDelay={0.1}
            className="h-full"
          >
            <div className="flex items-center justify-center py-6">
              <AnimatedIcon 
                icon={<ShieldCheck />} 
                size="xl" 
                animationType="hover" 
                color="#1e3c0d" 
              />
            </div>
          </AnimatedCard>
          
          <AnimatedCard
            title="AI Connections"
            description="Connect to trusted AI services securely"
            footer={
              <div className="w-full flex justify-end">
                <AnimatedButton size="sm" variant="secondary" animationType="scale">Connect</AnimatedButton>
              </div>
            }
            animationType="scale"
            animationDelay={0.2}
            className="h-full"
          >
            <div className="flex items-center justify-center py-6">
              <AnimatedIcon 
                icon={<Star />} 
                size="xl" 
                animationType="rotate" 
                color="#1e3c0d" 
              />
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}