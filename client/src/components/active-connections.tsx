import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getAiServiceIcon } from "@/lib/ai-services";

interface Connection {
  id: number;
  aiServiceName: string;
  isActive: boolean;
}

interface ActiveConnectionsProps {
  connections: Connection[];
  isLoading: boolean;
}

export default function ActiveConnections({ connections, isLoading }: ActiveConnectionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mutation for revoking a connection
  const revokeConnectionMutation = useMutation({
    mutationFn: async (connectionId: number) => {
      return apiRequest("PATCH", `/api/connections/${connectionId}/revoke`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      toast({
        title: "Connection Revoked",
        description: "The AI connection has been revoked successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to revoke connection. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleAddConnection = () => {
    toast({
      title: "Add Connection",
      description: "This would open the AI service connection dialog.",
    });
  };

  const handleRevokeConnection = (connectionId: number, serviceName: string) => {
    if (confirm(`Are you sure you want to revoke access for ${serviceName}?`)) {
      revokeConnectionMutation.mutate(connectionId);
    }
  };

  // Filter to show only active connections
  const activeConnections = connections.filter(conn => conn.isActive);

  return (
    <div className="mt-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium">Active Connections</h2>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {/* Add button */}
        <div className="flex flex-col items-center min-w-[60px]">
          <Button 
            variant="outline"
            className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center mb-1 hover:bg-gray-50"
            onClick={handleAddConnection}
          >
            <svg
              className="w-6 h-6"
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
          </Button>
          <span className="text-xs text-center">Add</span>
        </div>
        
        {/* Active connections */}
        {isLoading ? (
          // Skeleton loaders
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center min-w-[60px]">
              <Skeleton className="w-14 h-14 rounded-full mb-1" />
              <Skeleton className="h-3 w-10 mb-1" />
            </div>
          ))
        ) : activeConnections.length === 0 ? (
          <div className="flex-1 py-4 text-center text-sm text-gray-500">
            No active connections. Connect with AI services to get started.
          </div>
        ) : (
          // Actual connections
          activeConnections.map((connection) => (
            <div 
              key={connection.id} 
              className="flex flex-col items-center min-w-[60px]"
              onContextMenu={(e) => {
                e.preventDefault();
                handleRevokeConnection(connection.id, connection.aiServiceName);
              }}
            >
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                <div className="w-10 h-10">
                  {getAiServiceIcon(connection.aiServiceName)}
                </div>
              </div>
              <span className="text-xs text-center">{connection.aiServiceName}</span>
            </div>
          ))
        )}
        
        {/* Placeholders for empty state or missing connections */}
        {!isLoading && activeConnections.length === 0 && (
          <>
            <div className="flex flex-col items-center min-w-[60px] opacity-60">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                {getAiServiceIcon("OpenAI")}
              </div>
              <span className="text-xs text-center">Open AI</span>
            </div>
            <div className="flex flex-col items-center min-w-[60px] opacity-60">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                {getAiServiceIcon("Claude")}
              </div>
              <span className="text-xs text-center">Claude</span>
            </div>
            <div className="flex flex-col items-center min-w-[60px] opacity-60">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-1">
                {getAiServiceIcon("Perplexity")}
              </div>
              <span className="text-xs text-center">Perplexity</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
