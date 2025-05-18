import React from 'react';
import { useLocation } from 'wouter';

// Import UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardPageProps {
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [, setLocation] = useLocation();

  return (
    <div className="dashboard-page min-h-screen bg-[#f7f9f6]">
      {/* Header */}
      <header className="bg-[#273414] text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Heirloom Identity Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm hidden md:inline">Welcome, User</span>
            <Button 
              variant="outline" 
              className="text-white border-white hover:bg-white hover:text-[#273414]"
              onClick={onLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Identity Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-4">
                    👤
                  </div>
                  <h3 className="text-lg font-semibold">Default User</h3>
                  <p className="text-sm text-gray-500">Verified User</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Identity Status</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#e9f0e6] text-[#273414]">
                      Verified
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Biometric Auth</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#e9f0e6] text-[#273414]">
                      Enabled
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Face Recognition</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#e9f0e6] text-[#273414]">
                      Enabled
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Identity Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-[#e9f0e6] p-4 rounded-lg border border-[#273414]/10">
                        <h3 className="font-medium mb-2 text-[#273414]">Device Authentication</h3>
                        <p className="text-sm text-[#273414]/80 mb-4">Your device is registered for biometric authentication.</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-[#273414] text-[#273414] hover:bg-[#273414] hover:text-white"
                          onClick={() => setLocation('/webauthn-test')}
                        >
                          Manage Devices
                        </Button>
                      </div>
                      
                      <div className="bg-[#e9f0e6] p-4 rounded-lg border border-[#273414]/10">
                        <h3 className="font-medium mb-2 text-[#273414]">Face Verification</h3>
                        <p className="text-sm text-[#273414]/80 mb-4">Your face has been registered for identity verification.</p>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-[#273414] text-[#273414] hover:bg-[#273414] hover:text-white"
                          onClick={() => setLocation('/authenticate')}
                        >
                          Update Face Data
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Manage your security settings and authentication methods.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-600">Adds an extra layer of security</p>
                        </div>
                        <Button variant="outline" size="sm">Enable</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium">Recovery Options</h3>
                          <p className="text-sm text-gray-600">Set up recovery methods</p>
                        </div>
                        <Button variant="outline" size="sm">Configure</Button>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h3 className="font-medium">Authorized Devices</h3>
                          <p className="text-sm text-gray-600">Manage devices that can access your account</p>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Successful Login</h4>
                          <span className="text-sm text-gray-500">Just now</span>
                        </div>
                        <p className="text-sm text-gray-600">Using biometric authentication</p>
                      </div>
                      
                      <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Face Verification</h4>
                          <span className="text-sm text-gray-500">Just now</span>
                        </div>
                        <p className="text-sm text-gray-600">Face verified successfully</p>
                      </div>
                      
                      <div className="p-3 border-l-4 border-green-500 bg-green-50 rounded-r-lg">
                        <div className="flex justify-between">
                          <h4 className="font-medium">Device Registration</h4>
                          <span className="text-sm text-gray-500">Today</span>
                        </div>
                        <p className="text-sm text-gray-600">New device registered for biometric authentication</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 mt-10 py-6 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2025 Heirloom Identity Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;