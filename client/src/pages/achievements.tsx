import React, { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

import AchievementCard, { Achievement } from "@/components/achievement-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import NavigationBar from "@/components/navigation-bar";

export default function Achievements() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [achievementTitle, setAchievementTitle] = useState("");
  const [achievementDesc, setAchievementDesc] = useState("");
  const [achievementType, setAchievementType] = useState("custom");
  
  // Fetch user achievements
  const { data: achievements, isLoading, error } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    refetchOnWindowFocus: false,
  });
  
  // Create achievement mutation
  const createAchievement = useMutation({
    mutationFn: (achievementData: any) =>
      apiRequest("/api/achievements/generate", "POST", achievementData),
    onSuccess: () => {
      toast({
        title: "Achievement Created",
        description: "Your achievement has been created and is ready to share.",
      });
      setShowCreateDialog(false);
      setAchievementTitle("");
      setAchievementDesc("");
      // Invalidate achievements query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create achievement. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Filter achievements by type
  const filterAchievementsByType = (type: string) => {
    if (!achievements) return [];
    return achievements.filter((achievement: Achievement) => 
      achievement.achievementType === type
    );
  };
  
  // Handle achievement creation
  const handleCreateAchievement = () => {
    if (!achievementTitle) {
      toast({
        title: "Missing Title",
        description: "Please provide a title for your achievement.",
        variant: "destructive",
      });
      return;
    }
    
    createAchievement.mutate({
      achievementType,
      title: achievementTitle,
      description: achievementDesc || "Custom user achievement",
      shareMode: "public"
    });
  };
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-5 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Your Achievements</h1>
          <p className="text-sm text-gray-500 mt-1">Share your verification milestones</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-[#1e3c0d] hover:bg-[#143404]"
        >
          <svg
            className="w-4 h-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Create
        </Button>
      </header>
      
      {/* Main Content */}
      <div className="px-4 sm:px-6">
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="mb-4 bg-gray-100">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-5 w-1/6" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-end">
                      <Skeleton className="h-8 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">Error loading achievements</p>
                <Button 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/achievements"] })}
                  variant="outline"
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : achievements?.length > 0 ? (
              <div>
                {achievements.map((achievement: Achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No achievements yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Verify your identity or create custom achievements to share with others.
                </p>
                <div className="mt-6">
                  <Button onClick={() => setShowCreateDialog(true)}>
                    Create Achievement
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="verification">
            {!isLoading && achievements?.length > 0 ? (
              <div>
                {filterAchievementsByType("verification").length > 0 ? (
                  filterAchievementsByType("verification").map((achievement: Achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                    <p className="text-gray-500">
                      No verification achievements found. Complete identity verification to earn one.
                    </p>
                    <Button 
                      onClick={() => navigate("/verification")}
                      variant="outline"
                      className="mt-4"
                    >
                      Go to Verification
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </TabsContent>
          
          <TabsContent value="blockchain">
            {!isLoading && achievements?.length > 0 ? (
              <div>
                {filterAchievementsByType("blockchain").length > 0 ? (
                  filterAchievementsByType("blockchain").map((achievement: Achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                    <p className="text-gray-500">
                      No blockchain achievements found. Connect your wallet to earn HIT tokens.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </TabsContent>
          
          <TabsContent value="custom">
            {!isLoading && achievements?.length > 0 ? (
              <div>
                {filterAchievementsByType("custom").length > 0 ? (
                  filterAchievementsByType("custom").map((achievement: Achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))
                ) : (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
                    <p className="text-gray-500">
                      No custom achievements found. Create one to share your milestones.
                    </p>
                    <Button 
                      onClick={() => setShowCreateDialog(true)}
                      className="mt-4"
                    >
                      Create Achievement
                    </Button>
                  </div>
                )}
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Create Achievement Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Shareable Achievement</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="achievement-type">Achievement Type</Label>
              <select
                id="achievement-type"
                value={achievementType}
                onChange={(e) => setAchievementType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="custom">Custom Achievement</option>
                <option value="milestone">Identity Milestone</option>
                <option value="security">Security Achievement</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="achievement-title">Title</Label>
              <Input
                id="achievement-title"
                placeholder="Enter achievement title"
                value={achievementTitle}
                onChange={(e) => setAchievementTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="achievement-desc">Description</Label>
              <textarea
                id="achievement-desc"
                placeholder="Describe your achievement (optional)"
                value={achievementDesc}
                onChange={(e) => setAchievementDesc(e.target.value)}
                className="w-full p-2 border rounded min-h-[100px]"
              />
            </div>
            
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
              <p className="text-sm text-gray-600">
                This achievement will be shareable via a unique link that you can post 
                on social media or send directly to others.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateDialog(false)}
              disabled={createAchievement.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAchievement}
              disabled={createAchievement.isPending}
              className="bg-[#1e3c0d] hover:bg-[#143404]"
            >
              {createAchievement.isPending ? "Creating..." : "Create Achievement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bottom Navigation */}
      <NavigationBar currentPath="/achievements" />
    </div>
  );
}