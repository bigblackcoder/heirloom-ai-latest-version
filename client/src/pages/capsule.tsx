import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import CapsuleSetupInfo from "@/components/capsule-setup-info";
import NavigationBar from "@/components/navigation-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function Capsule() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // State for tab selection
  const [activeTab, setActiveTab] = useState<"activity" | "updates" | "tips">("activity");
  const [showSettings, setShowSettings] = useState(false);
  
  const handleTabChange = (tab: "activity" | "updates" | "tips") => {
    setActiveTab(tab);
  };
  
  const handleBackClick = () => {
    navigate("/dashboard");
  };
  
  const handleSettingsClick = () => {
    setShowSettings(true);
  };

  // Settings states
  const [autoVerify, setAutoVerify] = useState(true);
  const [biometricAuth, setBiometricAuth] = useState(true);
  const [aiAccessNotifications, setAiAccessNotifications] = useState(true);
  const [enhancedPrivacy, setEnhancedPrivacy] = useState(false);
  const [blockchainVerification, setBlockchainVerification] = useState(false);
  
  // Demo updates data
  const updates = [
    {
      id: 1,
      date: "2025-04-10",
      title: "Enhanced Security Measures",
      description: "We've upgraded our encryption protocols to provide better protection for your identity data."
    },
    {
      id: 2,
      date: "2025-04-05",
      title: "New AI Integration",
      description: "Google Gemini is now available as an AI assistant option with your identity capsule."
    },
    {
      id: 3,
      date: "2025-04-01",
      title: "Privacy Controls Update",
      description: "You can now set granular permissions for each piece of identity information in your capsule."
    },
    {
      id: 4,
      date: "2025-03-28",
      title: "Face Verification Improvements",
      description: "Our face verification algorithm has been updated for better accuracy and faster processing."
    },
  ];

  // Demo tips data
  const tips = [
    {
      id: 1,
      title: "Regular Verification",
      description: "Perform a face verification check at least once a month to ensure your identity capsule remains secure."
    },
    {
      id: 2,
      title: "Review AI Permissions",
      description: "Regularly audit which AI services have access to your identity information and revoke any unused connections."
    },
    {
      id: 3,
      title: "Data Privacy",
      description: "Enable Enhanced Privacy mode in settings to restrict data sharing to only essential attributes."
    },
    {
      id: 4,
      title: "Backup Verification Method",
      description: "Set up an alternative verification method in case biometric authentication isn't available."
    },
    {
      id: 5,
      title: "Identity Protection",
      description: "Never share your identity verification links directly. Always use the secure connection system."
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-4 sm:px-5 pt-10 sm:pt-12 pb-3 sm:pb-4 flex items-center">
        <button 
          onClick={handleBackClick}
          className="mr-3 sm:mr-4"
        >
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg sm:text-xl font-semibold">Identity Capsule</h1>
        <div className="ml-auto">
          <button onClick={handleSettingsClick}>
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>
      </header>
      
      {/* Tabs */}
      <div className="flex border-b px-2 sm:px-4">
        <button 
          className={`px-3 sm:px-6 py-2 text-sm sm:text-base ${activeTab === "activity" ? "border-b-2 border-[#1e3c0d] text-[#1e3c0d] font-medium" : "text-gray-500"}`}
          onClick={() => handleTabChange("activity")}
        >
          Activity
        </button>
        <button 
          className={`px-3 sm:px-6 py-2 text-sm sm:text-base ${activeTab === "updates" ? "border-b-2 border-[#1e3c0d] text-[#1e3c0d] font-medium" : "text-gray-500"}`}
          onClick={() => handleTabChange("updates")}
        >
          Updates
        </button>
        <button 
          className={`px-3 sm:px-6 py-2 text-sm sm:text-base ${activeTab === "tips" ? "border-b-2 border-[#1e3c0d] text-[#1e3c0d] font-medium" : "text-gray-500"}`}
          onClick={() => handleTabChange("tips")}
        >
          Tips
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="p-4 sm:p-6">
        {activeTab === "activity" && (
          <div>
            <CapsuleSetupInfo />
          </div>
        )}
        
        {activeTab === "updates" && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-[#1e3c0d]">Recent Updates</h2>
            
            <div className="space-y-4">
              {updates.map((update) => (
                <div key={update.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{update.title}</h3>
                    <span className="text-xs text-gray-500">{new Date(update.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-gray-600">{update.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === "tips" && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-[#1e3c0d]">Identity Security Tips</h2>
            
            <div className="space-y-4">
              {tips.map((tip) => (
                <div key={tip.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  <div className="flex items-start mb-2">
                    <div className="bg-[#1e3c0d]/10 p-2 rounded-full mr-3">
                      <svg className="w-4 h-4 text-[#1e3c0d]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{tip.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Identity Capsule Settings</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <h3 className="text-sm font-medium mb-2">Security</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto Verification</Label>
                <p className="text-sm text-muted-foreground">Automatically verify your identity when connecting to services</p>
              </div>
              <Switch 
                checked={autoVerify}
                onCheckedChange={setAutoVerify}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Biometric Authentication</Label>
                <p className="text-sm text-muted-foreground">Use facial recognition for authentication</p>
              </div>
              <Switch 
                checked={biometricAuth}
                onCheckedChange={setBiometricAuth}
              />
            </div>
            
            <Separator className="my-4" />
            
            <h3 className="text-sm font-medium mb-2">Privacy</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">AI Access Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified when AI services access your identity</p>
              </div>
              <Switch 
                checked={aiAccessNotifications}
                onCheckedChange={setAiAccessNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Enhanced Privacy Mode</Label>
                <p className="text-sm text-muted-foreground">Restrict data sharing to essential attributes only</p>
              </div>
              <Switch 
                checked={enhancedPrivacy}
                onCheckedChange={setEnhancedPrivacy}
              />
            </div>
            
            <Separator className="my-4" />
            
            <h3 className="text-sm font-medium mb-2">Advanced</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Blockchain Verification</Label>
                <p className="text-sm text-muted-foreground">Verify identity using blockchain technology</p>
              </div>
              <Switch 
                checked={blockchainVerification}
                onCheckedChange={setBlockchainVerification}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bottom Navigation */}
      <NavigationBar currentPath="/capsule" />
    </div>
  );
}
