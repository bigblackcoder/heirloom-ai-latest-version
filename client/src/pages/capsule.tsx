import { useState, useEffect } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";

export default function Capsule() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  
  // State for tab selection
  const [activeTab, setActiveTab] = useState<"activity" | "updates" | "tips">("activity");
  const [showSettings, setShowSettings] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [privacyScore, setPrivacyScore] = useState(65);
  
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
  
  // Privacy Controls
  const [dataSharing, setDataSharing] = useState(60);
  const [locationTracking, setLocationTracking] = useState(20);
  const [thirdPartyAccess, setThirdPartyAccess] = useState(40);
  
  // Calculate privacy score
  useEffect(() => {
    const newScore = calculatePrivacyScore();
    setPrivacyScore(newScore);
  }, [enhancedPrivacy, dataSharing, locationTracking, thirdPartyAccess, aiAccessNotifications]);
  
  const calculatePrivacyScore = () => {
    // Lower values for sliders are more private, so we invert them
    const dataSharingScore = 100 - dataSharing;
    const locationTrackingScore = 100 - locationTracking;
    const thirdPartyScore = 100 - thirdPartyAccess;
    
    // Enhanced privacy gives a bonus
    const enhancedPrivacyBonus = enhancedPrivacy ? 15 : 0;
    
    // AI notifications give a small bonus
    const aiNotificationsBonus = aiAccessNotifications ? 5 : 0;
    
    // Calculate weighted score
    const baseScore = (
      (dataSharingScore * 0.4) +
      (locationTrackingScore * 0.3) +
      (thirdPartyScore * 0.3)
    );
    
    // Apply bonuses up to 100 max
    return Math.min(100, Math.round(baseScore + enhancedPrivacyBonus + aiNotificationsBonus));
  };
  
  // Get privacy score color
  const getPrivacyScoreColor = () => {
    if (privacyScore >= 80) return "text-green-600";
    if (privacyScore >= 60) return "text-yellow-600";
    return "text-red-600";
  };
  
  // Get privacy score background
  const getPrivacyScoreBackground = () => {
    if (privacyScore >= 80) return "bg-green-600";
    if (privacyScore >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };
  
  // Demo verification history data
  const verificationHistory = [
    { month: 'Jan', verifications: 2, successful: 2 },
    { month: 'Feb', verifications: 5, successful: 4 },
    { month: 'Mar', verifications: 3, successful: 3 },
    { month: 'Apr', verifications: 8, successful: 7 },
    { month: 'May', verifications: 4, successful: 4 },
    { month: 'Jun', verifications: 6, successful: 5 },
  ];
  
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
  
  // Handle export click
  const handleExportClick = () => {
    setShowExportDialog(true);
  };
  
  // Handle actual export
  const handleExport = () => {
    toast({
      title: "Export Complete",
      description: "Your verification history has been exported successfully.",
    });
    setShowExportDialog(false);
  };

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
        <div className="ml-auto flex items-center">
          <button 
            onClick={handleExportClick}
            className="mr-4"
            aria-label="Export data"
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
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
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
      
      {/* Privacy Score Card */}
      <div className="mx-4 sm:mx-6 mb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-medium">Privacy Score</h2>
            <span className={`text-lg font-bold ${getPrivacyScoreColor()}`}>{privacyScore}/100</span>
          </div>
          <Progress value={privacyScore} className="h-2" indicatorClassName={getPrivacyScoreBackground()} />
          <p className="text-xs text-gray-500 mt-2">
            {privacyScore >= 80 
              ? "Excellent privacy protection. Your identity data is well secured."
              : privacyScore >= 60 
                ? "Good privacy settings. Consider enhancing specific areas."
                : "Your privacy protection could be improved. Check settings."
            }
          </p>
        </div>
      </div>
      
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
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Identity Capsule Settings</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Privacy Score in Settings */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Your Privacy Score</h3>
                <span className={`text-lg font-bold ${getPrivacyScoreColor()}`}>{privacyScore}/100</span>
              </div>
              <Progress value={privacyScore} className="h-2" indicatorClassName={getPrivacyScoreBackground()} />
            </div>
            
            <h3 className="text-sm font-medium mb-2">Privacy Controls</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-base">Data Sharing</Label>
                  <span className="text-sm text-gray-500">
                    {dataSharing <= 30 ? "Minimal" : dataSharing <= 70 ? "Balanced" : "Extended"}
                  </span>
                </div>
                <Slider 
                  value={[dataSharing]} 
                  onValueChange={(value) => setDataSharing(value[0])} 
                  max={100} 
                  step={1}
                />
                <p className="text-xs text-gray-500">
                  Controls how much personal data is shared with services.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-base">Location Data</Label>
                  <span className="text-sm text-gray-500">
                    {locationTracking <= 30 ? "Disabled" : locationTracking <= 70 ? "Limited" : "Full"}
                  </span>
                </div>
                <Slider 
                  value={[locationTracking]} 
                  onValueChange={(value) => setLocationTracking(value[0])} 
                  max={100} 
                  step={1}
                />
                <p className="text-xs text-gray-500">
                  Controls when and how location data is used for verification.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-base">Third-party Access</Label>
                  <span className="text-sm text-gray-500">
                    {thirdPartyAccess <= 30 ? "Restricted" : thirdPartyAccess <= 70 ? "Selected" : "Open"}
                  </span>
                </div>
                <Slider 
                  value={[thirdPartyAccess]} 
                  onValueChange={(value) => setThirdPartyAccess(value[0])} 
                  max={100} 
                  step={1}
                />
                <p className="text-xs text-gray-500">
                  Controls which third-party services can access your identity.
                </p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
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

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Export Verification History</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-3">6-Month Verification Activity</h3>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={verificationHistory}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="verifications" name="Total Verifications" fill="#1e3c0d" />
                    <Bar dataKey="successful" name="Successful" fill="#4caf50" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Export Options</h3>
              
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <input type="radio" id="csv" name="exportFormat" className="mr-2" defaultChecked />
                  <label htmlFor="csv">CSV Format</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="pdf" name="exportFormat" className="mr-2" />
                  <label htmlFor="pdf">PDF Report</label>
                </div>
                <div className="flex items-center">
                  <input type="radio" id="json" name="exportFormat" className="mr-2" />
                  <label htmlFor="json">JSON Data</label>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                Export includes verification timestamps, success rates, and connected services.
                No biometric data is included in the export.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowExportDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              className="w-full sm:w-auto bg-[#1e3c0d] hover:bg-[#143404]"
            >
              Export Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bottom Navigation */}
      <NavigationBar currentPath="/capsule" />
    </div>
  );
}
