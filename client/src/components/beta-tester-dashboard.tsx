import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, CheckCircle2, ChevronRight, ClipboardList, LineChart, MessageSquare } from 'lucide-react';
import BetaFeedbackForm from './beta-feedback-form';
import { trackBetaEvent } from '@/lib/analytics';

interface BetaFeature {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'coming-soon' | 'in-development';
}

const BETA_FEATURES: BetaFeature[] = [
  {
    id: 'face-verification',
    name: 'Facial Verification',
    description: 'Verify your identity using facial recognition.',
    status: 'available'
  },
  {
    id: 'multi-device',
    name: 'Multi-Device Support',
    description: 'Use Heirloom across multiple devices seamlessly.',
    status: 'available'
  },
  {
    id: 'blockchain-proof',
    name: 'Blockchain Proof',
    description: 'Generate and verify cryptographic proofs on the blockchain.',
    status: 'in-development'
  },
  {
    id: 'biometric-backup',
    name: 'Biometric Backup',
    description: 'Add additional biometric data as backup verification.',
    status: 'coming-soon'
  },
  {
    id: 'cross-chain',
    name: 'Cross-Chain Integration',
    description: 'Connect your digital identity across multiple blockchains.',
    status: 'coming-soon'
  },
];

export default function BetaTesterDashboard() {
  const [testedFeatures, setTestedFeatures] = useState<string[]>([]);
  const [activeTasks, setActiveTasks] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<number>(0);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Simulate loading tester data from localStorage
  useEffect(() => {
    const savedTestedFeatures = localStorage.getItem('testedFeatures');
    if (savedTestedFeatures) {
      setTestedFeatures(JSON.parse(savedTestedFeatures));
    }
    
    setActiveTasks(3);
    setCompletedTasks(1);
    
    // Track dashboard view in analytics
    trackBetaEvent('beta_dashboard_view');
  }, []);
  
  const markFeatureTested = (featureId: string) => {
    if (!testedFeatures.includes(featureId)) {
      const newTestedFeatures = [...testedFeatures, featureId];
      setTestedFeatures(newTestedFeatures);
      localStorage.setItem('testedFeatures', JSON.stringify(newTestedFeatures));
      trackBetaEvent('feature_tested', { feature_id: featureId });
    }
  };
  
  const progressPercentage = BETA_FEATURES.filter(f => f.status === 'available').length > 0
    ? (testedFeatures.length / BETA_FEATURES.filter(f => f.status === 'available').length) * 100
    : 0;
  
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Beta Tester Dashboard</CardTitle>
          <div className="text-xs font-medium px-2.5 py-0.5 rounded bg-amber-100 text-amber-800">
            Beta Program
          </div>
        </div>
        <CardDescription>
          Track your progress and help us improve the Heirloom platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="features">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Features Tested</span>
                <span className="font-medium">{testedFeatures.length}/{BETA_FEATURES.filter(f => f.status === 'available').length}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="space-y-2 mt-4">
              {BETA_FEATURES.map(feature => (
                <div 
                  key={feature.id}
                  className="rounded-lg border p-3 flex justify-between items-center"
                >
                  <div>
                    <h3 className="font-medium flex items-center gap-2">
                      {feature.status === 'available' && (
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                      {feature.status === 'in-development' && (
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                      )}
                      {feature.status === 'coming-soon' && (
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                      )}
                      {feature.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                  
                  {feature.status === 'available' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markFeatureTested(feature.id)}
                      disabled={testedFeatures.includes(feature.id)}
                    >
                      {testedFeatures.includes(feature.id) ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Tested
                        </span>
                      ) : (
                        "Test"
                      )}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground font-medium px-2 py-1 rounded-md bg-muted">
                      {feature.status === 'in-development' ? 'In Progress' : 'Coming Soon'}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tasks" className="pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tasks Completed</span>
                <span className="font-medium">{completedTasks}/{activeTasks}</span>
              </div>
              <Progress value={(completedTasks / activeTasks) * 100} className="h-2" />
            </div>
            
            <div className="space-y-3 mt-4">
              <div className="rounded-lg border p-3 flex justify-between items-center bg-muted/50">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Complete Your Profile</h3>
                    <p className="text-sm text-muted-foreground">Add your basic information and profile picture</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" disabled>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </Button>
              </div>
              
              <div className="rounded-lg border p-3 flex justify-between items-center">
                <div className="flex gap-3">
                  <ClipboardList className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Complete Face Verification</h3>
                    <p className="text-sm text-muted-foreground">Verify your identity using facial recognition</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="rounded-lg border p-3 flex justify-between items-center">
                <div className="flex gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Provide Feedback</h3>
                    <p className="text-sm text-muted-foreground">Submit at least one feedback report</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="feedback" className="pt-4">
            <div className="text-center space-y-4 py-4">
              <MessageSquare className="h-12 w-12 mx-auto text-primary/80" />
              <h3 className="text-lg font-medium">We Value Your Feedback</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Your input helps us improve the Heirloom platform. Share your thoughts, report issues, or suggest new features.
              </p>
              <div className="flex justify-center mt-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Submit Feedback
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Beta Feedback</DialogTitle>
                      <DialogDescription>
                        Share your thoughts to help us improve the Heirloom platform.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <BetaFeedbackForm />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-4">
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          <span>Beta Features may change before final release</span>
        </div>
        <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={() => setShowDetailsDialog(true)}>
          Program Details
        </Button>
      </CardFooter>
      
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Beta Program Details</DialogTitle>
            <DialogDescription>
              Information about the Heirloom Beta Program
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="font-medium">Beta Program Duration</h4>
              <p className="text-sm mt-1">May 15, 2025 - July 15, 2025 (8 weeks)</p>
            </div>
            <div>
              <h4 className="font-medium">Participation Guidelines</h4>
              <ul className="text-sm mt-1 space-y-1 list-disc pl-5">
                <li>Test features thoroughly and provide specific feedback</li>
                <li>Report any bugs or issues you encounter</li>
                <li>Suggest improvements for user experience</li>
                <li>Complete all beta tasks to help development process</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Data Privacy</h4>
              <p className="text-sm mt-1">
                All data collected during the beta is used solely for improving the platform.
                Your personal information remains protected according to our privacy policy.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}