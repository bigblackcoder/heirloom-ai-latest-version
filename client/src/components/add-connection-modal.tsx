import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define available AI services
const aiServices = [
  {
    id: "claude",
    name: "Claude AI",
    description: "Anthropic's Claude assistant",
    icon: "/images/ai-services/claude-color.png",
    color: "#5738ca"
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Google's advanced AI assistant",
    icon: "/images/ai-services/gemini-color.png",
    color: "#1e88e5"
  },
  {
    id: "gpt",
    name: "ChatGPT",
    description: "OpenAI's powerful assistant",
    icon: "/images/ai-services/openai-logo.png",
    color: "#10a37f"
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    description: "AI-powered answer engine",
    icon: "/images/ai-services/perplexity-logo.png",
    color: "#f97316"
  },
  {
    id: "mcp",
    name: "MCP Assistant", 
    description: "Managed credential provider",
    icon: "/images/ai-services/mcp.png",
    color: "#283142"
  },
  {
    id: "bing",
    name: "Microsoft Copilot",
    description: "Microsoft's AI companion",
    icon: "/images/ai-services/copilot-logo.png",
    color: "#0078d4"
  }
];

// Form schema
const formSchema = z.object({
  serviceName: z.string().min(1, {
    message: "Service name is required"
  }),
  connectionCode: z.string().min(6, {
    message: "Connection code must be at least 6 characters"
  }),
});

export default function AddConnectionModal({ isOpen, onClose }: AddConnectionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  // Setup form with zod resolver
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serviceName: "",
      connectionCode: "",
    },
  });
  
  // Mutation for adding a connection
  const addConnectionMutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      return apiRequest({
        url: "/api/connections",
        method: "POST",
        body: {
          aiServiceName: values.serviceName,
          connectionCode: values.connectionCode
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/connections"] });
      toast({
        title: "Connection Added",
        description: "You've successfully connected with the AI service.",
      });
      form.reset();
      setSelectedService(null);
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to the AI service. Please check your connection code and try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addConnectionMutation.mutate(values);
  };
  
  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    const service = aiServices.find(s => s.id === serviceId);
    if (service) {
      form.setValue("serviceName", service.name);
      setSelectedService(serviceId);
    }
  };
  
  // Get service logo color
  const getServiceLogo = (serviceId: string) => {
    const service = aiServices.find(s => s.id === serviceId);
    if (!service) return "#333333";
    return service.color;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Shield className="w-5 h-5 mr-2 text-[#1e3c0d]" />
            Add New AI Connection
          </DialogTitle>
          <DialogDescription>
            Connect your identity to an AI service for secure verification.
          </DialogDescription>
        </DialogHeader>
        
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
            
            {/* Connection Code */}
            {selectedService && (
              <FormField
                control={form.control}
                name="connectionCode"
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
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#1e3c0d] hover:bg-[#273414]"
                disabled={!selectedService || addConnectionMutation.isPending}
              >
                {addConnectionMutation.isPending ? "Connecting..." : "Connect"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}