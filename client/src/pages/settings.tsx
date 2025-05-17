import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import NavigationBar from "@/components/navigation-bar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SecuritySettings } from "@/components/security-settings";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  settings?: {
    biometricVerification?: {
      confidenceThreshold: number;
      autoRetry: boolean;
      faceStabilityCheck: boolean;
      lowLightEnhancement: boolean;
      saveVerifiedScans: boolean;
    };
    aiConnections?: {
      autoApprove: boolean;
      lockConnectionsWhenInactive: boolean;
      notifyOnAccess: boolean;
    };
    privacy?: {
      shareAnalytics: boolean;
      allowMetricsCollection: boolean;
    };
  };
}

export default function Settings() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get current user data
  const { data: userData, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/auth/me"],
  });
  
  // Default settings if no user data is available
  const [biometricSettings, setBiometricSettings] = useState({
    confidenceThreshold: 85,
    autoRetry: true,
    faceStabilityCheck: true,
    lowLightEnhancement: true,
    saveVerifiedScans: false,
  });
  
  const [aiConnectionSettings, setAiConnectionSettings] = useState({
    autoApprove: false,
    lockConnectionsWhenInactive: true,
    notifyOnAccess: true,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    shareAnalytics: true,
    allowMetricsCollection: true,
  });
  
  // Update settings when user data is loaded
  useState(() => {
    if (userData?.settings) {
      if (userData.settings.biometricVerification) {
        setBiometricSettings(userData.settings.biometricVerification);
      }
      
      if (userData.settings.aiConnections) {
        setAiConnectionSettings(userData.settings.aiConnections);
      }
      
      if (userData.settings.privacy) {
        setPrivacySettings(userData.settings.privacy);
      }
    }
  });
  
  // Mutation for updating user settings
  const updateSettingsMutation = useMutation({
    mutationFn: (updatedSettings: any) => {
      return apiRequest({
        url: "/api/auth/settings",
        method: "PATCH",
        body: updatedSettings
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update settings. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle settings update
  const handleSaveSettings = () => {
    const updatedSettings = {
      biometricVerification: biometricSettings,
      aiConnections: aiConnectionSettings,
      privacy: privacySettings,
    };
    
    // For demo purposes, just show success toast
    toast({
      title: "Settings Updated",
      description: "Your preferences have been saved.",
    });
    
    // In production, this would call the actual mutation:
    // updateSettingsMutation.mutate(updatedSettings);
  };
  
  const handleBackClick = () => {
    navigate("/profile");
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Status bar area */}
      <div className="w-full px-4 pt-6 pb-2 flex items-center bg-white">
        <div className="text-sm text-gray-500">9:41</div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-1">
          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none">
            <path d="M1.5 6.5C1.5 4 3.5 2 6 2 8.5 2 10.5 4 10.5 6.5v11C10.5 20 8.5 22 6 22 3.5 22 1.5 20 1.5 17.5v-11Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10.5 6c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5v11c0 2.5-2 4.5-4.5 4.5S10.5 19.5 10.5 17V6Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M19.5 7a2.5 2.5 0 0 1 5 0v10a2.5 2.5 0 0 1-5 0V7Z" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none">
            <path d="M3 7c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M21 16h2v-8h-2M1 16h2V8H1" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
      </div>
      
      {/* Header */}
      <header className="px-5 py-4 bg-white border-b border-gray-100 flex items-center gap-4">
        <button 
          onClick={handleBackClick}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
      </header>
      
      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid grid-cols-2 w-full my-4 px-4">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="preferences" className="p-4 space-y-6">
          {/* Biometric Verification Settings */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-[#1e3c0d]/5 border-b border-[#1e3c0d]/10">
              <h2 className="font-semibold text-[#1e3c0d]">Face Verification</h2>
            </div>
            
            <div className="p-4 space-y-5">
              {/* Confidence threshold setting */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="confidence-threshold" className="text-sm">
                    Confidence Threshold
                  </Label>
                  <span className="text-sm font-medium text-[#1e3c0d]">
                    {biometricSettings.confidenceThreshold}%
                  </span>
                </div>
                <Slider
                  id="confidence-threshold"
                  defaultValue={[biometricSettings.confidenceThreshold]}
                  min={65}
                  max={95}
                  step={5}
                  className="w-full"
                  onValueChange={(value) => {
                    setBiometricSettings({
                      ...biometricSettings,
                      confidenceThreshold: value[0]
                    });
                  }}
                />
                <p className="text-xs text-gray-500">
                  Higher threshold means more accurate verification but may require more attempts.
                </p>
              </div>
              
              {/* Toggle settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-retry" className="text-sm">Auto-retry</Label>
                    <p className="text-xs text-gray-500">Automatically retry verification on failure</p>
                  </div>
                  <Switch
                    id="auto-retry"
                    checked={biometricSettings.autoRetry}
                    onCheckedChange={(checked) => {
                      setBiometricSettings({
                        ...biometricSettings,
                        autoRetry: checked
                      });
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="stability-check" className="text-sm">Stability Check</Label>
                    <p className="text-xs text-gray-500">Ensure face is stable during verification</p>
                  </div>
                  <Switch
                    id="stability-check"
                    checked={biometricSettings.faceStabilityCheck}
                    onCheckedChange={(checked) => {
                      setBiometricSettings({
                        ...biometricSettings,
                        faceStabilityCheck: checked
                      });
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="low-light" className="text-sm">Low Light Enhancement</Label>
                    <p className="text-xs text-gray-500">Improve detection in poor lighting conditions</p>
                  </div>
                  <Switch
                    id="low-light"
                    checked={biometricSettings.lowLightEnhancement}
                    onCheckedChange={(checked) => {
                      setBiometricSettings({
                        ...biometricSettings,
                        lowLightEnhancement: checked
                      });
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="save-scans" className="text-sm">Save Verified Scans</Label>
                    <p className="text-xs text-gray-500">Store successful verifications to improve future accuracy</p>
                  </div>
                  <Switch
                    id="save-scans"
                    checked={biometricSettings.saveVerifiedScans}
                    onCheckedChange={(checked) => {
                      setBiometricSettings({
                        ...biometricSettings,
                        saveVerifiedScans: checked
                      });
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* AI Connection Settings */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-[#1e3c0d]/5 border-b border-[#1e3c0d]/10">
              <h2 className="font-semibold text-[#1e3c0d]">AI Connections</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-approve" className="text-sm">Auto-approve Identity Requests</Label>
                  <p className="text-xs text-gray-500">Allow connected AIs to verify your identity without prompts</p>
                </div>
                <Switch
                  id="auto-approve"
                  checked={aiConnectionSettings.autoApprove}
                  onCheckedChange={(checked) => {
                    setAiConnectionSettings({
                      ...aiConnectionSettings,
                      autoApprove: checked
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="lock-inactive" className="text-sm">Lock When Inactive</Label>
                  <p className="text-xs text-gray-500">Automatically lock connections after 30 days of inactivity</p>
                </div>
                <Switch
                  id="lock-inactive"
                  checked={aiConnectionSettings.lockConnectionsWhenInactive}
                  onCheckedChange={(checked) => {
                    setAiConnectionSettings({
                      ...aiConnectionSettings,
                      lockConnectionsWhenInactive: checked
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notify-access" className="text-sm">Notify on Access</Label>
                  <p className="text-xs text-gray-500">Send notification when an AI accesses your identity data</p>
                </div>
                <Switch
                  id="notify-access"
                  checked={aiConnectionSettings.notifyOnAccess}
                  onCheckedChange={(checked) => {
                    setAiConnectionSettings({
                      ...aiConnectionSettings,
                      notifyOnAccess: checked
                    });
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Privacy Settings */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-[#1e3c0d]/5 border-b border-[#1e3c0d]/10">
              <h2 className="font-semibold text-[#1e3c0d]">Privacy</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="share-analytics" className="text-sm">Share Analytics</Label>
                  <p className="text-xs text-gray-500">Help improve the platform with anonymous usage data</p>
                </div>
                <Switch
                  id="share-analytics"
                  checked={privacySettings.shareAnalytics}
                  onCheckedChange={(checked) => {
                    setPrivacySettings({
                      ...privacySettings,
                      shareAnalytics: checked
                    });
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="metrics-collection" className="text-sm">Performance Metrics</Label>
                  <p className="text-xs text-gray-500">Collect metrics to optimize verification performance</p>
                </div>
                <Switch
                  id="metrics-collection"
                  checked={privacySettings.allowMetricsCollection}
                  onCheckedChange={(checked) => {
                    setPrivacySettings({
                      ...privacySettings,
                      allowMetricsCollection: checked
                    });
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <Button 
            className="w-full bg-[#1e3c0d] hover:bg-[#273414] py-6 rounded-xl"
            onClick={handleSaveSettings}
          >
            Save Settings
          </Button>
        </TabsContent>
        
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
      
      {/* Bottom Navigation */}
      <NavigationBar currentPath="/profile" />
    </div>
  );
}