import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, RefreshCcw, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import ConnectionManageModal from "@/components/connection-manage-modal";
import AddConnectionModal from "@/components/add-connection-modal";

interface Connection {
  id: number;
  userId: number;
  aiServiceName: string;
  isActive: boolean;
  createdAt: string;
  lastUsed?: string;
}

interface ActiveConnectionsProps {
  connections: Connection[];
  isLoading: boolean;
}

export default function ActiveConnections({ connections, isLoading }: ActiveConnectionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [manageModalOpen, setManageModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  
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
  
  // Get active connections with extra safety checks
  const activeConnections = Array.isArray(connections) ? connections.filter(c => c && c.isActive) : [];
  
  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    
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
  
  // Function to handle revoking a connection
  const handleRevoke = (connectionId: number) => {
    revokeConnectionMutation.mutate(connectionId);
  };
  
  // Get logo for service
  const getServiceLogo = (serviceName: string) => {
    if (serviceName.toLowerCase().includes("claude")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-1">
          <path d="M12 2L5 5V19L12 22L19 19V5L12 2Z" fill="#5738ca" stroke="#5738ca" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z" fill="white" stroke="white" strokeWidth="0.5"/>
          <path d="M12 11V17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    } else if (serviceName.toLowerCase().includes("gemini")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-1">
          <path d="M6 12L12 8L18 12L12 16L6 12Z" fill="#1e88e5" stroke="#1e88e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 2V8M12 16V22" stroke="#1e88e5" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      );
    } else if (serviceName.toLowerCase().includes("gpt")) {
      return (
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-1">
          <rect width="24" height="24" rx="5" fill="#10a37f" fillOpacity="0.2"/>
          <path d="M19.5 8.25l-7.5 4.5-7.5-4.5m7.5 4.5v9" stroke="#10a37f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M19.5 15.75l-7.5 4.5-7.5-4.5m16.5-11.25l-7.5 4.5-7.5-4.5" stroke="#10a37f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    
    return (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-1">
        <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
        <path d="M12 16V8M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  };
  
  return (
    <>
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold flex items-center">
              <ShieldAlert className="w-5 h-5 mr-2 text-[#1e3c0d]" />
              Connected AI Services
            </CardTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="h-8"
                onClick={() => setManageModalOpen(true)}
              >
                Manage
              </Button>
              <Button
                size="sm"
                className="h-8 bg-[#1e3c0d] hover:bg-[#273414]"
                onClick={() => setAddModalOpen(true)}
              >
                Add
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-16 bg-gray-100 rounded-lg"></div>
              <div className="h-16 bg-gray-100 rounded-lg"></div>
            </div>
          ) : activeConnections.length > 0 ? (
            <div className="space-y-3">
              {activeConnections.map((connection) => (
                <div 
                  key={connection.id}
                  className="bg-white border border-gray-100 rounded-xl p-3.5 shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center mb-1.5">
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
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>Last used: {getRelativeTime(connection.lastUsed)}</span>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-gray-900">No Active Connections</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                Connect your identity to AI services to securely share information.
              </p>
              <Button 
                variant="outline"
                className="mt-4"
                onClick={() => setAddModalOpen(true)}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Add Connection
              </Button>
            </div>
          )}
          
          <div className="mt-4 text-xs text-gray-500 italic">
            <p>Connections automatically expire after 30 days of inactivity.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Modals */}
      <ConnectionManageModal 
        isOpen={manageModalOpen}
        onClose={() => setManageModalOpen(false)}
        connections={connections || []}
      />
      
      <AddConnectionModal 
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </>
  );
}