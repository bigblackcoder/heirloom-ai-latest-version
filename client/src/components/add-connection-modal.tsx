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
    icon: "/images/ai-services/perplexity-logo.svg",
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
    icon: "/images/ai-services/copilot-logo.svg",
    color: "#0078d4"
  }
];

// Form schema for OAuth consent
const formSchema = z.object({
  serviceName: z.string().min(1, {
    message: "Service name is required"
  }),
  scopes: z.array(z.string()).optional(),
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
      scopes: [],
    },
  });
  
  // Mutation for initiating OAuth flow
  const initiateOAuthMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const serviceId = aiServices.find(s => s.name === values.serviceName)?.id;
      if (!serviceId) {
        throw new Error('Service not found');
      }

      return apiRequest({
        url: "/api/oauth/authorize",
        method: "POST",
        body: {
          serviceId,
          scopes: values.scopes
        }
      });
    },
    onSuccess: (data) => {
      // Redirect to OAuth provider
      window.location.href = data.authUrl;
    },
    onError: (error) => {
      toast({
        title: "Authorization Failed",
        description: "Failed to initiate OAuth flow. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    initiateOAuthMutation.mutate(values);
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

  // Get default scopes for a service
  const getDefaultScopes = (serviceId: string) => {
    const scopeMap = {
      'claude': ['identity', 'conversations:read', 'conversations:write'],
      'gpt': ['identity', 'chat:read', 'chat:write'],
      'gemini': ['profile', 'gemini.conversations'],
      'perplexity': ['identity', 'search:read'],
      'mcp': ['identity', 'credential:read'],
      'bing': ['identity', 'copilot:read', 'copilot:write']
    };
    return scopeMap[serviceId as keyof typeof scopeMap] || ['identity'];
  };

  // Get human-readable scope description
  const getScopeDescription = (scope: string) => {
    const descriptions = {
      'identity': 'Access to your verified identity information',
      'conversations:read': 'Read your conversation history',
      'conversations:write': 'Create new conversations on your behalf',
      'chat:read': 'Read your chat history',
      'chat:write': 'Send messages on your behalf',
      'profile': 'Access to your basic profile information',
      'gemini.conversations': 'Access to Gemini conversations',
      'search:read': 'Perform searches using your identity',
      'credential:read': 'Access managed credentials',
      'copilot:read': 'Read Copilot interactions',
      'copilot:write': 'Create Copilot requests'
    };
    return descriptions[scope as keyof typeof descriptions] || scope;
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Shield className="w-5 h-5 mr-2 text-[#1e3c0d]" />
            Connect AI Service
          </DialogTitle>
          <DialogDescription>
            Authorize an AI service to access your verified identity using OAuth 2.0.
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
            
            {/* Permissions/Scopes */}
            {selectedService && (
              <div className="space-y-4">
                <div className="text-sm font-medium">Permissions Requested</div>
                <div className="text-xs text-gray-600">
                  The AI service will have access to the following information:
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="space-y-2">
                    {getDefaultScopes(selectedService).map((scope, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm">{getScopeDescription(scope)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500">
                  You can revoke these permissions at any time from your dashboard.
                </div>
              </div>
            )}
            
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
              <p className="flex items-start">
                <ShieldAlert className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" />
                <span>
                  You'll be redirected to the AI service's authorization page. After granting permission, 
                  you'll be redirected back to complete the connection.
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
                disabled={!selectedService || initiateOAuthMutation.isPending}
              >
                {initiateOAuthMutation.isPending ? "Redirecting..." : "Authorize Connection"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}