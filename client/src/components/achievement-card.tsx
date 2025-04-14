import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

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
  const [showShareDialog, setShowShareDialog] = useState(false);
  const { toast } = useToast();

  // Format the date to a readable format
  const formattedDate = new Date(achievement.dateEarned).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Get background color based on achievement type
  const getBadgeColor = () => {
    switch (achievement.achievementType) {
      case "verification":
        return "bg-green-100 text-green-800";
      case "blockchain":
        return "bg-purple-100 text-purple-800";
      case "custom":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get card accent color
  const getCardAccent = () => {
    switch (achievement.achievementType) {
      case "verification":
        return "border-l-4 border-l-green-500";
      case "blockchain":
        return "border-l-4 border-l-purple-500";
      case "custom":
        return "border-l-4 border-l-blue-500";
      default:
        return "border-l-4 border-l-gray-500";
    }
  };

  // Copy link to clipboard
  const copyLink = () => {
    navigator.clipboard.writeText(achievement.shareUrl).then(
      () => {
        toast({
          title: "Link copied!",
          description: "Achievement link has been copied to your clipboard.",
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Failed to copy",
          description: "Could not copy to clipboard. Please try again.",
          variant: "destructive",
        });
      }
    );
  };

  // Share to social media
  const shareTo = (platform: string) => {
    let url = "";
    const text = `I've earned a verification achievement on Heirloom: ${achievement.title}`;
    const shareUrl = encodeURIComponent(achievement.shareUrl);
    
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${shareUrl}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
        break;
    }
    
    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  return (
    <>
      <Card className={`mb-4 shadow-sm hover:shadow-md transition-shadow ${getCardAccent()}`}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{achievement.title}</CardTitle>
              <CardDescription className="text-sm mt-1">{formattedDate}</CardDescription>
            </div>
            <Badge className={getBadgeColor()}>
              {achievement.achievementType.charAt(0).toUpperCase() + achievement.achievementType.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-sm text-gray-600">{achievement.description}</p>
          
          {achievement.confidence && (
            <div className="mt-3 bg-gray-50 rounded p-2">
              <p className="text-xs font-medium text-gray-700">Verification Confidence</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${achievement.confidence}%` }}
                />
              </div>
              <p className="text-xs text-right mt-1">{achievement.confidence.toFixed(2)}%</p>
            </div>
          )}
          
          {achievement.contractAddress && (
            <div className="mt-3 bg-gray-50 rounded p-2">
              <p className="text-xs font-medium text-gray-700">Blockchain Details</p>
              <p className="text-xs mt-1">Network: {achievement.network}</p>
              <p className="text-xs mt-1 overflow-hidden text-ellipsis">
                Contract: {achievement.contractAddress.substring(0, 8)}...{achievement.contractAddress.substring(achievement.contractAddress.length - 6)}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => setShowShareDialog(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share Achievement
          </Button>
        </CardFooter>
      </Card>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Your Achievement</DialogTitle>
            <DialogDescription>
              Share this achievement with your network or copy the link to share manually.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <h3 className="font-medium mb-2">{achievement.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
              <div className="text-xs text-gray-500">Earned on {formattedDate}</div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <Button 
                variant="outline" 
                className="flex-1 text-[#1DA1F2]" 
                onClick={() => shareTo("twitter")}
              >
                <svg 
                  className="w-5 h-5 mr-2" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.1 10.1 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-[#4267B2]" 
                onClick={() => shareTo("facebook")}
              >
                <svg 
                  className="w-5 h-5 mr-2" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 text-[#0A66C2]" 
                onClick={() => shareTo("linkedin")}
              >
                <svg 
                  className="w-5 h-5 mr-2" 
                  viewBox="0 0 24 24" 
                  fill="currentColor"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </Button>
            </div>
            
            <div className="relative mt-4">
              <input
                type="text"
                value={achievement.shareUrl}
                readOnly
                className="w-full pr-24 p-2 border rounded text-sm bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute right-1 top-1 text-xs h-8"
                onClick={copyLink}
              >
                Copy Link
              </Button>
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