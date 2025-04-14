import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  TooltipProvider, 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export interface Achievement {
  id: string;
  achievementType: string;
  title: string;
  description: string;
  dateEarned: string;
  shareId: string;
  shareUrl: string;
  confidence?: number;
  network?: string;
  contractAddress?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  // Format relative time (e.g., "3 days ago")
  const relativeTime = formatDistanceToNow(new Date(achievement.dateEarned), { addSuffix: true });
  
  // Handle share link copying
  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${achievement.shareId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to your clipboard.",
    });
  };
  
  // Share to social media
  const shareToTwitter = () => {
    const text = `I earned the "${achievement.title}" achievement on Heirloom Identity Platform! ${achievement.description}`;
    const shareUrl = `${window.location.origin}/share/${achievement.shareId}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };
  
  const shareToLinkedIn = () => {
    const shareUrl = `${window.location.origin}/share/${achievement.shareId}`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };
  
  const shareToFacebook = () => {
    const shareUrl = `${window.location.origin}/share/${achievement.shareId}`;
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };
  
  // Renders the achievement type badge
  const renderBadge = () => {
    let badgeClass = "";
    let badgeText = "";
    
    switch (achievement.achievementType) {
      case "verification":
        badgeClass = "bg-green-100 text-green-800";
        badgeText = "Verification";
        break;
      case "blockchain":
        badgeClass = "bg-blue-100 text-blue-800";
        badgeText = "Blockchain";
        break;
      case "milestone":
        badgeClass = "bg-purple-100 text-purple-800";
        badgeText = "Milestone";
        break;
      case "security":
        badgeClass = "bg-red-100 text-red-800";
        badgeText = "Security";
        break;
      default:
        badgeClass = "bg-gray-100 text-gray-800";
        badgeText = "Custom";
    }
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${badgeClass}`}>
        {badgeText}
      </span>
    );
  };
  
  return (
    <>
      <Card className="mb-4 overflow-hidden border-gray-200 hover:border-gray-300 transition-all">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">{achievement.title}</CardTitle>
            {renderBadge()}
          </div>
          <CardDescription className="text-sm text-gray-500">
            Earned {relativeTime}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-2">
          <p className="text-sm text-gray-600">{achievement.description}</p>
          
          {/* Show confidence if available */}
          {achievement.confidence && (
            <div className="mt-2 flex items-center">
              <span className="text-xs text-gray-500 mr-2">Verification confidence:</span>
              <div className="h-2 bg-gray-200 rounded-full w-32">
                <div 
                  className="h-2 rounded-full bg-green-500" 
                  style={{ width: `${achievement.confidence}%` }}
                ></div>
              </div>
              <span className="text-xs ml-2">{achievement.confidence.toFixed(2)}%</span>
            </div>
          )}
          
          {/* Show blockchain details if available */}
          {achievement.network && (
            <div className="mt-2 text-xs text-gray-600">
              <span className="font-medium">Network: </span>{achievement.network}
              {achievement.contractAddress && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        className="ml-2 text-xs text-blue-600 hover:underline"
                        onClick={() => {
                          navigator.clipboard.writeText(achievement.contractAddress || "");
                          toast({
                            title: "Copied",
                            description: "Contract address copied to clipboard",
                          });
                        }}
                      >
                        {achievement.contractAddress.substring(0, 6)}...{achievement.contractAddress.substring(achievement.contractAddress.length - 4)}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to copy contract address</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          )}
        </CardContent>
        
        <CardFooter className="pt-1 justify-end">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowShareDialog(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <svg 
              className="w-4 h-4 mr-1" 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </Button>
        </CardFooter>
      </Card>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Achievement</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex flex-col space-y-4">
              <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
                <div className="font-medium mb-2">{achievement.title}</div>
                <div className="text-sm text-gray-600 mb-2">{achievement.description}</div>
                <div className="text-xs text-gray-500">Earned {relativeTime}</div>
              </div>
              
              <div className="flex flex-col space-y-2">
                <div className="text-sm font-medium mb-1">Social Media</div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={shareToTwitter}
                    variant="outline" 
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-[#1DA1F2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z" />
                    </svg>
                    <span>Twitter</span>
                  </Button>
                  
                  <Button 
                    onClick={shareToLinkedIn}
                    variant="outline" 
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                    <span>LinkedIn</span>
                  </Button>
                  
                  <Button 
                    onClick={shareToFacebook}
                    variant="outline" 
                    className="flex-1 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium mb-1">Direct Link</div>
                <div className="flex items-center">
                  <input
                    className="flex-1 border rounded-l-md py-2 px-3 text-sm"
                    value={`${window.location.origin}/share/${achievement.shareId}`}
                    readOnly
                  />
                  <Button 
                    onClick={copyShareLink}
                    className="rounded-l-none"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}