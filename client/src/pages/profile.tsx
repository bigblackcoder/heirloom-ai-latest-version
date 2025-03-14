import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/lib/types';
import NavigationBar from '@/components/navigation-bar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Shield, 
  Key, 
  Settings,
  LogOut,
  Edit,
  Clock,
  Lock,
  UserCircle2
} from 'lucide-react';

export default function Profile() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('personal');

  // Fetch user data
  const { data: user, isLoading } = useQuery({ 
    queryKey: ['/api/auth/me'],
    enabled: true
  });

  const mockUser: User = {
    id: 1,
    firstName: 'Alex',
    lastName: 'Morgan',
    username: 'alex.morgan',
    email: 'alex@example.com',
    memberSince: '2023-05-15T10:00:00Z',
    isVerified: true,
    avatar: ''
  };

  const handleLogout = () => {
    // Handle logout logic
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#1e3c0d] text-white">
      <header className="bg-[#273414] p-4 sticky top-0 z-10 border-b border-[#344919]">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">Profile</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')} className="text-white hover:bg-[#344919]">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 pb-16">
        {/* Profile header */}
        <div className="bg-[#334218] p-6 flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-[#1e3c0d]">
              <AvatarImage src={user?.avatar || ''} alt={user?.firstName || 'User'} />
              <AvatarFallback className="bg-[#7c9861] text-[#1e3c0d] text-xl">
                {user?.firstName?.[0] || mockUser.firstName[0]}
                {user?.lastName?.[0] || mockUser.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 bg-[#7c9861] hover:bg-[#8baa70] text-[#1e3c0d]"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
          
          <h2 className="text-2xl font-bold text-white">
            {user?.firstName || mockUser.firstName} {user?.lastName || mockUser.lastName}
          </h2>
          
          <div className="flex items-center text-white/70 mt-1">
            <span className="text-sm">{user?.username || mockUser.username}</span>
          </div>
          
          {(user?.isVerified || mockUser.isVerified) && (
            <Badge variant="outline" className="mt-2 flex items-center gap-1 border-[#7c9861] text-[#7c9861] bg-[#273414]">
              <CheckCircle className="h-3 w-3" />
              <span>Verified Identity</span>
            </Badge>
          )}
        </div>

        {/* Tabs section */}
        <Tabs defaultValue="personal" className="mt-4" onValueChange={setActiveTab}>
          <div className="px-4">
            <TabsList className="w-full bg-[#344919]">
              <TabsTrigger value="personal" className="flex-1 data-[state=active]:bg-[#7c9861] data-[state=active]:text-[#1e3c0d] text-white">Personal</TabsTrigger>
              <TabsTrigger value="security" className="flex-1 data-[state=active]:bg-[#7c9861] data-[state=active]:text-[#1e3c0d] text-white">Security</TabsTrigger>
              <TabsTrigger value="privacy" className="flex-1 data-[state=active]:bg-[#7c9861] data-[state=active]:text-[#1e3c0d] text-white">Privacy</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="personal" className="px-4 py-2 space-y-4">
            <Card className="bg-[#273414] border-[#344919] text-white">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCircle2 className="h-5 w-5 text-[#7c9861]" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div>
                  <div className="text-sm text-white/60">Full Name</div>
                  <div className="text-white">{user?.firstName || mockUser.firstName} {user?.lastName || mockUser.lastName}</div>
                </div>
                <div>
                  <div className="text-sm text-white/60">Email</div>
                  <div className="text-white">{user?.email || mockUser.email}</div>
                </div>
                <div>
                  <div className="text-sm text-white/60">Username</div>
                  <div className="text-white">{user?.username || mockUser.username}</div>
                </div>
                <div>
                  <div className="text-sm text-white/60">Member Since</div>
                  <div className="text-white">{new Date(user?.memberSince || mockUser.memberSince).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</div>
                </div>
                <Button variant="outline" className="w-full mt-2 border-[#7c9861] text-[#7c9861] hover:bg-[#7c9861] hover:text-[#1e3c0d]">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#273414] border-[#344919] text-white">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-[#7c9861]" />
                  Verified Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">Face Verification</div>
                      <div className="text-sm text-white/60">Biometric identity verification</div>
                    </div>
                    <Badge variant="outline" className="border-[#7c9861] text-[#7c9861] bg-[#273414]">Verified</Badge>
                  </div>
                  <Separator className="bg-[#344919]" />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">Email</div>
                      <div className="text-sm text-white/60">Email address verification</div>
                    </div>
                    <Badge variant="outline" className="border-[#7c9861] text-[#7c9861] bg-[#273414]">Verified</Badge>
                  </div>
                  <Separator className="bg-[#344919]" />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">Phone Number</div>
                      <div className="text-sm text-white/60">Mobile number verification</div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#7c9861] hover:bg-[#344919] h-8">
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="px-4 py-2 space-y-4">
            <Card className="bg-[#273414] border-[#344919] text-white">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-5 w-5 text-[#7c9861]" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">Password</div>
                      <div className="text-sm text-white/60">Last changed 45 days ago</div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 border-[#7c9861] text-[#7c9861] hover:bg-[#7c9861] hover:text-[#1e3c0d]">
                      Change
                    </Button>
                  </div>
                  <Separator className="bg-[#344919]" />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">Two-Factor Authentication</div>
                      <div className="text-sm text-white/60">Extra security for your account</div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 border-[#7c9861] text-[#7c9861] hover:bg-[#7c9861] hover:text-[#1e3c0d]">
                      Set up
                    </Button>
                  </div>
                  <Separator className="bg-[#344919]" />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">Login History</div>
                      <div className="text-sm text-white/60">View recent login activity</div>
                    </div>
                    <Button variant="ghost" className="text-[#7c9861] hover:bg-[#344919] h-8">
                      <Clock className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="px-4 py-2 space-y-4">
            <Card className="bg-[#273414] border-[#344919] text-white">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#7c9861]" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">Identity Capsule Privacy</div>
                      <div className="text-sm text-white/60">Control how your identity data is used</div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 border-[#7c9861] text-[#7c9861] hover:bg-[#7c9861] hover:text-[#1e3c0d]">
                      Manage
                    </Button>
                  </div>
                  <Separator className="bg-[#344919]" />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">AI Connection Permissions</div>
                      <div className="text-sm text-white/60">Manage AI service access</div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8 border-[#7c9861] text-[#7c9861] hover:bg-[#7c9861] hover:text-[#1e3c0d]">
                      Manage
                    </Button>
                  </div>
                  <Separator className="bg-[#344919]" />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-white">Data Export</div>
                      <div className="text-sm text-white/60">Download your data</div>
                    </div>
                    <Button variant="ghost" className="text-[#7c9861] hover:bg-[#344919] h-8">
                      Export
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logout button */}
        <div className="px-4 mt-8 mb-4">
          <Button 
            variant="outline" 
            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log Out
          </Button>
        </div>
      </main>

      <NavigationBar currentPath={location} />
    </div>
  );
}