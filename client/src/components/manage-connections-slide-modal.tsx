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
      return apiRequest({
        url: `/api/connections/${connectionId}/revoke`,
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
  
  // Filter connections by active status with safety checks
  const activeConnections = Array.isArray(connections) ? connections.filter(conn => conn && conn.isActive) : [];
  const inactiveConnections = Array.isArray(connections) ? connections.filter(conn => conn && !conn.isActive) : [];
  
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

  // Get service icon using the updated brand colors
  const getServiceIcon = (serviceName: string) => {
    const serviceNameLower = serviceName.toLowerCase();
    
    if (serviceNameLower.includes("claude")) {
      return (
        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#D9775715] mr-1.5">
          <img src="/images/claude-logo.svg" alt="Claude" className="w-4 h-4" />
        </div>
      );
    } else if (serviceNameLower.includes("gemini")) {
      return (
        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#1C69FF15] mr-1.5">
          <img src="/images/gemini-logo.svg" alt="Gemini" className="w-4 h-4" />
        </div>
      );
    } else if (serviceNameLower.includes("gpt") || serviceNameLower.includes("chat")) {
      return (
        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#00000015] mr-1.5">
          <img src="/images/gpt-logo.svg" alt="ChatGPT" className="w-4 h-4" />
        </div>
      );
    } else if (serviceNameLower.includes("perplexity")) {
      return (
        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#22B8CD15] mr-1.5">
          <img src="/images/perplexity-logo.svg" alt="Perplexity" className="w-4 h-4" />
        </div>
      );
    } else if (serviceNameLower.includes("copilot")) {
      return (
        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#1e1e1e] mr-1.5">
          <img src="/images/copilot-logo.svg" alt="Microsoft Copilot" className="w-4 h-4" />
        </div>
      );
    } else if (serviceNameLower.includes("mcp")) {
      return (
        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-[#1e1e1e] mr-1.5">
          <img src="/images/mcp-logo.svg" alt="MCP Assistant" className="w-4 h-4" />
        </div>
      );
    }
    
    // Default icon if no match
    return (
      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-200 mr-1.5">
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
          <path d="M12 16V8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
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