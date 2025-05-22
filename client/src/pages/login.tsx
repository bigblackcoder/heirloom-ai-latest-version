import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";

// Form validation schema
const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" })
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  // Form setup
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await login(data.username, data.password);
      
      // Use a short timeout to allow authentication state to update
      setTimeout(() => {
        // Navigate to dashboard after successful login
        console.log("Login successful, redirecting to dashboard");
        navigate("/dashboard");
      }, 300);
      
      return response;
    } catch (error) {
      // Error is handled by the login function
      console.error("Login submission error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e2610] via-[#232d12] to-[#273414] text-white p-6 flex flex-col">
      {/* Header with logo */}
      <div className="flex items-center mb-8">
        <Button 
          variant="ghost" 
          className="p-0 mr-3" 
          onClick={() => navigate("/")}
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
        </Button>
        <div className="flex items-center">
          <div className="w-8 h-8 mr-2">
            <img src="/images/heirloom-logo-white-black.jpeg" alt="Heirloom Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-xl font-bold">Heirloom</h1>
        </div>
      </div>

      {/* Login Form */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription className="text-white/70">
            Access your Heirloom identity dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your username" 
                        className="bg-white/20 border-white/20 text-white placeholder:text-white/50" 
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        className="bg-white/20 border-white/20 text-white placeholder:text-white/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full py-6 mt-2 bg-[#7c9861] hover:bg-[#273414] text-white rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center flex-col gap-2">
          <Button 
            variant="link" 
            className="text-white/70 hover:text-white"
            onClick={() => navigate("/signup")}
          >
            Don't have an account? Sign up
          </Button>
          <Button 
            variant="link" 
            className="text-white/70 hover:text-white"
            onClick={() => navigate("/verification")}
          >
            Verify your identity
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}