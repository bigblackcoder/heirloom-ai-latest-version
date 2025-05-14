import { useState, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/**
 * Debug Session component to display debug information in development mode
 * This component will only render in development mode or on localhost
 */
export function DebugSession({ debugId, data }: { debugId?: string; data?: any }) {
  const { toast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Only show in development mode or on localhost
    const isDev = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost';
    setIsVisible(isDev && !!debugId);
  }, [debugId]);
  
  const copyToClipboard = useCallback(() => {
    if (debugId) {
      navigator.clipboard.writeText(debugId);
      toast({
        title: "Copied",
        description: "Debug session ID copied to clipboard",
        duration: 2000,
      });
    }
  }, [debugId, toast]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Badge variant="outline" className="bg-amber-100 cursor-pointer">
            Debug: {debugId?.substring(0, 12)}...
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-80 text-xs">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Debug Session ID:</span>
              <div className="flex items-center gap-1">
                <code className="bg-muted p-1 rounded text-xs">{debugId}</code>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {data && (
              <div className="mt-2">
                <span className="font-semibold">Debug Data:</span>
                <pre className="bg-muted p-2 rounded text-xs mt-1 max-h-40 overflow-auto">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="text-xs text-muted-foreground mt-2">
              This debug information is only visible in development mode.
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}