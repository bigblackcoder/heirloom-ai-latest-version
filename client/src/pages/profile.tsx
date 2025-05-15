import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  UserCircle2,
  Upload,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Profile() {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('personal');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Fetch user data
  const { data: user, isLoading } = useQuery({ 
    queryKey: ['/api/auth/me'],
    enabled: true
  });

  // Simplified profile picture upload
  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simple validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please select a valid image file",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      // Upload the image using form data
      const response = await fetch('/api/user/profile-picture-form', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }
      
      // Update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-card p-4 sticky top-0 z-10 border-b">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Profile</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 pb-16">
        {/* Hidden file input for avatar upload */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleProfilePictureChange}
          accept="image/*"
          className="hidden"
        />

        {/* Profile header */}
        <div className="bg-primary/5 p-6 flex flex-col items-center">
          <div className="relative mb-4">
            <Avatar 
              className="h-24 w-24 border-4 border-background cursor-pointer" 
              onClick={handleProfilePictureClick}
            >
              <AvatarImage src={user?.avatar || ''} alt={user?.username || 'User'} />
              <AvatarFallback className="bg-primary/20 text-primary text-xl">
                {(user?.firstName?.[0] || '') + (user?.lastName?.[0] || '')}
                {!user?.firstName && !user?.lastName && user?.username?.substring(0, 2)}
                {!user?.firstName && !user?.lastName && !user?.username && 'U'}
              </AvatarFallback>
            </Avatar>
            <Button 
              size="icon" 
              variant="secondary" 
              className="absolute -bottom-2 -right-2 rounded-full h-8 w-8"
              onClick={handleProfilePictureClick}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <h2 className="text-2xl font-bold">
            {user?.firstName && user?.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user?.username || 'User'}
          </h2>
          
          <div className="flex items-center text-muted-foreground mt-1">
            <span className="text-sm">{user?.email || ''}</span>
          </div>
          
          {/* Debug info to help users understand how profile pictures work */}
          <div className="mt-2 text-xs text-muted-foreground max-w-xs text-center">
            <p>Tap the profile picture or edit button to upload a new image. Your picture will appear in the navigation bar.</p>
          </div>
          
          {user?.isVerified && (
            <Badge variant="outline" className="mt-2 flex items-center gap-1 border-green-500 text-green-500">
              <CheckCircle className="h-3 w-3" />
              <span>Verified Identity</span>
            </Badge>
          )}
        </div>

        {/* Tabs section */}
        <Tabs defaultValue="personal" className="mt-4" onValueChange={setActiveTab}>
          <div className="px-4">
            <TabsList className="w-full">
              <TabsTrigger value="personal" className="flex-1">Personal</TabsTrigger>
              <TabsTrigger value="security" className="flex-1">Security</TabsTrigger>
              <TabsTrigger value="privacy" className="flex-1">Privacy</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="personal" className="px-4 py-2 space-y-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCircle2 className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                {user?.firstName && user?.lastName && (
                  <div>
                    <div className="text-sm text-muted-foreground">Full Name</div>
                    <div>{user.firstName} {user.lastName}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div>{user?.email || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Username</div>
                  <div>{user?.username || 'Not provided'}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Member Since</div>
                  <div>{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={() => toast({
                    title: "Feature coming soon",
                    description: "Profile editing will be available in the next update."
                  })}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Verified Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Face Verification</div>
                      <div className="text-sm text-muted-foreground">Biometric identity verification</div>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-500">Verified</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">Email address verification</div>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-500">Verified</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Phone Number</div>
                      <div className="text-sm text-muted-foreground">Mobile number verification</div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary h-8">
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="px-4 py-2 space-y-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Password</div>
                      <div className="text-sm text-muted-foreground">Last changed 45 days ago</div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8">
                      Change
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">Extra security for your account</div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8">
                      Set up
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Login History</div>
                      <div className="text-sm text-muted-foreground">View recent login activity</div>
                    </div>
                    <Button variant="ghost" className="text-primary h-8">
                      <Clock className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="px-4 py-2 space-y-4">
            <Card>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Identity Capsule Privacy</div>
                      <div className="text-sm text-muted-foreground">Control how your identity data is used</div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8">
                      Manage
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">AI Connection Permissions</div>
                      <div className="text-sm text-muted-foreground">Manage AI service access</div>
                    </div>
                    <Button variant="outline" size="sm" className="h-8">
                      Manage
                    </Button>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Data Export</div>
                      <div className="text-sm text-muted-foreground">Download your data</div>
                    </div>
                    <Button variant="ghost" className="text-primary h-8">
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
            className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
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