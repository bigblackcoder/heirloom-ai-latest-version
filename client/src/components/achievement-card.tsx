import React, { useState } from "react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  achievementType: string;
  createdAt: string;
  shareId?: string;
  shareUrl?: string;
  socialShareLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
  };
}

interface AchievementCardProps {
  achievement: Achievement;
}

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);
  
  // Format creation date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Unknown date";
    }
  };
  
  // Get icon based on achievement type
  const getAchievementIcon = () => {
    switch (achievement.achievementType) {
      case "verification":
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        );
      case "blockchain":
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        );
      case "security":
        return (
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>
        );
      case "milestone":
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-amber-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-purple-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
        );
    }
  };
  
  // Copy achievement share URL to clipboard
  const copyShareUrl = () => {
    if (achievement.shareUrl) {
      navigator.clipboard.writeText(achievement.shareUrl)
        .then(() => {
          toast({
            title: "Link copied!",
            description: "Share URL copied to clipboard",
          });
        })
        .catch(() => {
          toast({
            title: "Failed to copy",
            description: "Could not copy the link to clipboard",
            variant: "destructive",
          });
        });
    }
  };
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-0">
        <div className="flex items-center space-x-3">
          {getAchievementIcon()}
          <div>
            <h3 className="font-semibold">{achievement.title}</h3>
            <p className="text-xs text-gray-500">
              {formatDate(achievement.createdAt)}
            </p>
          </div>
        </div>
        <div className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 capitalize">
          {achievement.achievementType}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <p className="text-sm text-gray-600">
          {achievement.description}
        </p>
      </CardContent>
      
      <CardFooter className="px-4 py-3 bg-gray-50 flex justify-end">
        <Button 
          onClick={() => setShowShareDialog(true)}
          variant="outline"
          size="sm"
          className="text-sm"
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
            <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          Share
        </Button>
      </CardFooter>
      
      {/* Share dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Achievement</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600 mb-4">
              Share your "{achievement.title}" achievement with others.
            </p>
            
            {achievement.shareUrl && (
              <div className="flex items-center space-x-2 mb-6">
                <input
                  type="text"
                  readOnly
                  value={achievement.shareUrl}
                  className="flex-1 p-2 text-sm bg-gray-50 border rounded-md"
                />
                <Button onClick={copyShareUrl} variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            )}
            
            <Separator className="my-4" />
            
            <div className="mt-4">
              <p className="text-sm font-medium mb-3">Share on social media</p>
              
              <div className="flex space-x-3">
                {achievement.socialShareLinks?.twitter && (
                  <a
                    href={achievement.socialShareLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-[#1DA1F2] text-white"
                  >
                    <svg
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </a>
                )}
                
                {achievement.socialShareLinks?.linkedin && (
                  <a
                    href={achievement.socialShareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-[#0077B5] text-white"
                  >
                    <svg
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z" />
                      <rect x="2" y="9" width="4" height="12" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                )}
                
                {achievement.socialShareLinks?.facebook && (
                  <a
                    href={achievement.socialShareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full bg-[#1877F2] text-white"
                  >
                    <svg
                      className="w-5 h-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => setShowShareDialog(false)}
              variant="outline"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}