import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldAlert, 
  Shield, 
  RefreshCcw, 
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Connection {
  id: number;
  userId: number;
  aiServiceName: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface ConnectionManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  connections: Connection[];
}

export default function ConnectionManageModal({ 
  isOpen, 
  onClose,
  connections
}: ConnectionManageModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active");
  
  // Mutation for revoking a connection
  const revokeConnectionMutation = useMutation({
    mutationFn: (connectionId: number) => {
      return apiRequest({
        url: `/api/connections/${connectionId}/revoke`,
        method: "PATCH"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection Revoked",
        description: "The AI service no longer has access to your identity."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to revoke connection. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Get active and inactive connections - make sure connections is an array
  const connectionsArray = Array.isArray(connections) ? connections : [];
  const activeConnections = connectionsArray.filter(c => c.isActive);
  const inactiveConnections = connectionsArray.filter(c => !c.isActive);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };
  
  // Get relative time
  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return "Never used";
    
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };
  
  // Function to get brand badge based on service name
  const getBrandBadge = (serviceName: string) => {
    const serviceColors: Record<string, string> = {
      "Claude": "bg-[#5738ca]/10 text-[#5738ca] border-[#5738ca]/30",
      "Gemini": "bg-[#1e88e5]/10 text-[#1e88e5] border-[#1e88e5]/30",
      "GPT": "bg-[#10a37f]/10 text-[#10a37f] border-[#10a37f]/30",
      "Bing": "bg-[#0078d4]/10 text-[#0078d4] border-[#0078d4]/30",
      "Perplexity": "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/30",
      "Synthia": "bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/30"
    };
    
    const service = Object.keys(serviceColors).find(s => 
      serviceName.toLowerCase().includes(s.toLowerCase())
    );
    
    return service 
      ? serviceColors[service]
      : "bg-gray-100 text-gray-700 border-gray-200";
  };
  
  // Get logo for service
  const getServiceLogo = (serviceName: string) => {
    if (serviceName.toLowerCase().includes("claude")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-1.5">
          <path d="M12 2L5 5V19L12 22L19 19V5L12 2Z" fill="#5738ca" stroke="#5738ca" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" fill="white" stroke="white" strokeWidth="0.5"/>
          <path d="M12 11V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    } else if (serviceName.toLowerCase().includes("gemini")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-1.5">
          <path d="M6 12L12 8L18 12L12 16L6 12Z" fill="#1e88e5" stroke="#1e88e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 2V8M12 16V22" stroke="#1e88e5" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    } else if (serviceName.toLowerCase().includes("gpt")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-1.5">
          <rect width="24" height="24" rx="5" fill="#10a37f" fillOpacity="0.2"/>
          <path d="M19.5 8.25l-7.5 4.5-7.5-4.5m7.5 4.5v9" stroke="#10a37f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.5 15.75l-7.5 4.5-7.5-4.5m16.5-11.25l-7.5 4.5-7.5-4.5" stroke="#10a37f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-1.5">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
        <path d="M12 16V8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  };
  
  // Function to handle revoking a connection
  const handleRevoke = (connectionId: number) => {
    revokeConnectionMutation.mutate(connectionId);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <ShieldAlert className="w-5 h-5 mr-2 text-[#1e3c0d]" />
            Manage AI Connections
          </DialogTitle>
          <DialogDescription>
            Control which AI services have access to your identity.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs 
          defaultValue="active" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-2"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="active"
              className="flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              Active
              <Badge className="ml-1 bg-green-100 text-green-800 hover:bg-green-100">
                {activeConnections.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="revoked"
              className="flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Revoked
              <Badge className="ml-1 bg-gray-100 text-gray-800 hover:bg-gray-100">
                {inactiveConnections.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-3 mt-3">
            {activeConnections.length > 0 ? (
              activeConnections.map((connection) => (
                <div 
                  key={connection.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-2">
                        <Badge variant="outline" className={`mr-2 ${getBrandBadge(connection.aiServiceName)}`}>
                          <span className="flex items-center">
                            {getServiceLogo(connection.aiServiceName)}
                            {connection.aiServiceName}
                          </span>
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Shield className="w-3.5 h-3.5 mr-1.5" />
                          <span>Connected on {formatDate(connection.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          <span>Last used: {getRelativeTime(connection.lastUsed)}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 hover:bg-red-50 hover:text-red-600"
                      onClick={() => handleRevoke(connection.id)}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                <Shield className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-gray-900">No Active Connections</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                  You don't have any active AI service connections.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="revoked" className="space-y-3 mt-3">
            {inactiveConnections.length > 0 ? (
              inactiveConnections.map((connection) => (
                <div 
                  key={connection.id}
                  className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-2">
                        <Badge variant="outline" className={`mr-2 ${getBrandBadge(connection.aiServiceName)}`}>
                          <span className="flex items-center">
                            {getServiceLogo(connection.aiServiceName)}
                            {connection.aiServiceName}
                          </span>
                        </Badge>
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          Revoked
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Shield className="w-3.5 h-3.5 mr-1.5" />
                          <span>Connected on {formatDate(connection.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-3.5 h-3.5 mr-1.5" />
                          <span>Last used: {getRelativeTime(connection.lastUsed)}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-8"
                    >
                      <RefreshCcw className="w-3.5 h-3.5 mr-1.5" />
                      Reconnect
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
                <XCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-gray-900">No Revoked Connections</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                  You haven't revoked any AI service connections.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="mt-2 p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
          <p className="flex items-start">
            <ShieldAlert className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" />
            <span>
              AI connections give services permission to access your verified identity. 
              Revoke connections for services you no longer use.
            </span>
          </p>
        </div>
        
        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}