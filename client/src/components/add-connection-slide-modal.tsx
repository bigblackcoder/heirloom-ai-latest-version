import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldAlert } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SlidingModal } from "@/components/ui/sliding-modal";

// Connection validation schema
const connectionSchema = z.object({
  serviceName: z.string().min(1, "Service name is required"),
  connectionId: z.string().min(6, "Connection ID must be at least 6 characters").max(50, "Connection ID too long"),
});

type ConnectionFormValues = z.infer<typeof connectionSchema>;

interface AddConnectionSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddConnectionSlideModal({
  isOpen,
  onClose
}: AddConnectionSlideModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<string>("");
  
  // Setup form
  const form = useForm<ConnectionFormValues>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      serviceName: "",
      connectionId: "",
    },
  });
  
  // Mutation to add a new connection
  const addConnectionMutation = useMutation({
    mutationFn: (data: ConnectionFormValues) => {
      return apiRequest({
        url: "/api/connections",
        method: "POST",
        body: {
          aiServiceName: data.serviceName,
          connectionCode: data.connectionId,
        }
      });
    },
    onSuccess: () => {
      // Invalidate connections query to refresh the list
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      
      // Show success toast
      toast({
        title: "Connection added",
        description: `You're now connected to ${form.getValues().serviceName}`,
      });
      
      // Close the modal
      onClose();
      
      // Reset form
      form.reset();
      setSelectedService("");
    },
    onError: (error) => {
      console.error("Error adding connection:", error);
      toast({
        title: "Connection failed",
        description: "Could not add connection. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: ConnectionFormValues) => {
    addConnectionMutation.mutate(data);
  };
  
  // AI service list with updated colors
  const aiServices = [
    { 
      id: "claude", 
      name: "Claude AI", 
      description: "Anthropic's Claude assistant",
      icon: "/images/ai-services/claude-color.png", 
      color: "#5738ca" 
    },
    { 
      id: "gpt", 
      name: "ChatGPT", 
      description: "OpenAI's powerful assistant",
      icon: "/images/ai-services/openai-logo.png", 
      color: "#10a37f" 
    },
    { 
      id: "gemini", 
      name: "Google Gemini", 
      description: "Google's advanced AI assistant",
      icon: "/images/ai-services/gemini-color.png", 
      color: "#1e88e5" 
    },
    { 
      id: "perplexity", 
      name: "Perplexity AI", 
      description: "AI-powered answer engine",
      icon: "/images/ai-services/perplexity-logo.svg", 
      color: "#f97316" 
    },
    { 
      id: "bing", 
      name: "Microsoft Copilot", 
      description: "Microsoft's AI companion",
      icon: "/images/ai-services/copilot-logo.svg", 
      color: "#0078d4" 
    },
    { 
      id: "mcp", 
      name: "MCP Assistant", 
      description: "Managed credential provider",
      icon: "/images/ai-services/mcp.png", 
      color: "#283142" 
    },
  ];
  
  // Handle AI service selection
  const handleServiceSelect = (serviceId: string) => {
    const service = aiServices.find(s => s.id === serviceId);
    if (service) {
      form.setValue("serviceName", service.name);
      setSelectedService(serviceId);
    }
  };
  
  // Get service background color - simplified version
  const getServiceBackground = (serviceId: string) => {
    const service = aiServices.find(s => s.id === serviceId);
    if (!service) return "#f1f1f1";
    
    // Return a light tint of the service color
    return `${service.color}15`;
  };
  
  return (
    <SlidingModal
      isOpen={isOpen}
      onClose={onClose}
      direction="bottom"
      showCloseButton={true}
      duration={500}
      containerClassName="max-w-md mx-auto"
    >
      <div className="p-6">
        <div className="flex items-center text-xl mb-2">
          <Shield className="w-5 h-5 mr-2 text-[#1e3c0d]" />
          <h2 className="font-bold">Add New AI Connection</h2>
        </div>
        <p className="text-gray-600 text-sm mb-6">
          Connect your identity to an AI service for secure verification.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Service Selection */}
            <FormField
              control={form.control}
              name="serviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select AI Service</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      {aiServices.map((service) => (
                        <div
                          key={service.id}
                          className={`
                            border rounded-xl p-3 cursor-pointer transition-all duration-200
                            ${selectedService === service.id 
                              ? `border-2 shadow-md` 
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}
                          `}
                          style={{
                            borderColor: selectedService === service.id ? service.color : undefined,
                            backgroundColor: selectedService === service.id ? `${service.color}10` : undefined,
                            transform: selectedService === service.id ? 'scale(1.02)' : undefined
                          }}
                          onClick={() => handleServiceSelect(service.id)}
                        >
                          <div className="flex items-center mb-2">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center mr-2 overflow-hidden bg-white"
                              style={{ 
                                boxShadow: `0 0 0 2px ${service.color}25`
                              }}
                            >
                              <img 
                                src={service.icon}
                                alt={service.name} 
                                className="w-8 h-8 object-contain"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-sm">{service.name}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600">
                            {service.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Hidden input field to store the selected service name */}
            <input type="hidden" {...form.register("serviceName")} />
            
            {/* Only show connection ID field if a service is selected */}
            {selectedService && (
              <FormField
                control={form.control}
                name="connectionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Connection Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter the code from your AI service" 
                        {...field} 
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                    <div className="text-xs text-muted-foreground mt-1.5">
                      This code is provided by the AI service when requesting identity verification.
                    </div>
                  </FormItem>
                )}
              />
            )}
            
            <div className="p-3 bg-amber-50 rounded-lg text-sm text-amber-800">
              <p className="flex items-start">
                <ShieldAlert className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" />
                <span>
                  Only connect to trusted AI services. Connections give services access to 
                  your verified identity information.
                </span>
              </p>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#1e3c0d] hover:bg-[#273414] flex-1"
                disabled={!selectedService || addConnectionMutation.isPending}
              >
                {addConnectionMutation.isPending ? "Connecting..." : "Connect"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </SlidingModal>
  );
}