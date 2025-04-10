import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle,
  Shield,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlidingModal } from "@/components/ui/sliding-modal";

interface Connection {
  id: number;
  userId: number;
  aiServiceName: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface ManageConnectionsSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageConnectionsSlideModal({
  isOpen,
  onClose
}: ManageConnectionsSlideModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("active");
  
  // Query to get user's connections
  const { data: connections = [], isLoading } = useQuery<Connection[]>({
    queryKey: ["/api/connections"],
  });
  
  // Mutation to revoke a connection
  const revokeConnectionMutation = useMutation({
    mutationFn: (connectionId: number) => {
      return apiRequest(`/api/connections/${connectionId}/revoke`, {
        method: "PATCH",
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      // Show success toast
      toast({
        title: "Connection revoked",
        description: "The AI service no longer has access to your identity.",
      });
    },
    onError: (error) => {
      console.error("Error revoking connection:", error);
      toast({
        title: "Failed to revoke",
        description: "Could not revoke connection. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Filter connections by active status
  const activeConnections = connections.filter(conn => conn.isActive);
  const inactiveConnections = connections.filter(conn => !conn.isActive);
  
  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get service logo
  const getServiceIcon = (serviceName: string) => {
    if (serviceName.toLowerCase().includes("claude")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-1.5">
          <rect width="24" height="24" rx="5" fill="#5436DA" fillOpacity="0.2"/>
          <path d="M7 15.5V8.5a1 1 0 0 1 1.5-.86l6 3.5a1 1 0 0 1 0 1.72l-6 3.5A1 1 0 0 1 7 15.5z" fill="#5436DA" stroke="#5436DA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
    <SlidingModal
      isOpen={isOpen}
      onClose={onClose}
      direction="bottom"
      showCloseButton={true}
      duration={500}
      containerClassName="max-w-md mx-auto max-h-[80vh]"
    >
      <div className="p-6">
        <div className="flex items-center text-xl mb-2">
          <ShieldAlert className="w-5 h-5 mr-2 text-[#1e3c0d]" />
          <h2 className="font-bold">Manage AI Connections</h2>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Control which AI services have access to your identity.
        </p>
        
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
            {isLoading ? (
              <div className="text-center py-8">
                <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-pulse" />
                <p className="text-gray-500">Loading connections...</p>
              </div>
            ) : activeConnections.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Shield className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No active connections</p>
                <p className="text-gray-400 text-sm mt-1">
                  You haven't connected any AI services yet.
                </p>
                <Button 
                  className="mt-4 bg-[#1e3c0d] hover:bg-[#273414]"
                  onClick={onClose}
                >
                  Add Connection
                </Button>
              </div>
            ) : (
              <>
                {activeConnections.map((connection) => (
                  <div 
                    key={connection.id} 
                    className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {getServiceIcon(connection.aiServiceName)}
                        <span className="font-medium">{connection.aiServiceName}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        Active
                      </Badge>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Connected on {formatDate(connection.createdAt)}
                    </div>
                    
                    {connection.lastUsed && (
                      <div className="mt-1 text-xs text-gray-500">
                        Last used on {formatDate(connection.lastUsed)}
                      </div>
                    )}
                    
                    <div className="mt-3 flex justify-end">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRevoke(connection.id)}
                        disabled={revokeConnectionMutation.isPending}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                        Revoke Access
                      </Button>
                    </div>
                  </div>
                ))}
                
                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 mt-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0 text-amber-500" />
                    <p>
                      Active connections allow AI services to verify your identity.
                      Revoke access at any time to prevent further verification.
                    </p>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="revoked" className="space-y-3 mt-3">
            {isLoading ? (
              <div className="text-center py-8">
                <XCircle className="w-8 h-8 text-gray-300 mx-auto mb-2 animate-pulse" />
                <p className="text-gray-500">Loading connections...</p>
              </div>
            ) : inactiveConnections.length === 0 ? (
              <div className="text-center py-8 px-4">
                <XCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No revoked connections</p>
                <p className="text-gray-400 text-sm mt-1">
                  You haven't revoked any connections yet.
                </p>
              </div>
            ) : (
              <>
                {inactiveConnections.map((connection) => (
                  <div 
                    key={connection.id} 
                    className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        {getServiceIcon(connection.aiServiceName)}
                        <span className="font-medium">{connection.aiServiceName}</span>
                      </div>
                      <Badge className="bg-gray-100 text-gray-600">
                        Revoked
                      </Badge>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-500">
                      Connected on {formatDate(connection.createdAt)}
                    </div>
                    
                    {connection.lastUsed && (
                      <div className="mt-1 text-xs text-gray-500">
                        Last used on {formatDate(connection.lastUsed)}
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </SlidingModal>
  );
}