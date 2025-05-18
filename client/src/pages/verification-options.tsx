import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppleFaceScanner from '@/components/apple-face-scanner';
import { VideoVerification } from '@/components/video-verification';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerificationOptions() {
  const [activeTab, setActiveTab] = useState<string>("image");
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Identity Verification</CardTitle>
          <CardDescription>
            Please select your preferred verification method. 
            Video verification provides higher accuracy and security.
          </CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs 
        defaultValue="image" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="image">Image Verification</TabsTrigger>
          <TabsTrigger value="video">Video Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="image" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Face Scan</CardTitle>
              <CardDescription>
                Verify your identity using a single face scan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AppleFaceScanner 
                onProgress={(progress) => console.log('Verification progress:', progress)}
                onComplete={(imageData) => console.log('Verification complete:', imageData ? 'Image captured' : 'No image')}
                isComplete={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="video" className="space-y-4">
          <VideoVerification />
        </TabsContent>
      </Tabs>
      
      <div className="mt-8">
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800 text-sm">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 text-sm text-amber-700 space-y-2">
              <li>
                <strong>Image Verification:</strong> Captures a single image of your face and analyzes key facial features.
              </li>
              <li>
                <strong>Video Verification:</strong> Records a short 3-second video, which provides multiple frames for analysis,
                making it more robust against spoofing attacks.
              </li>
              <li>
                Your data is securely stored and only used for verification purposes.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}