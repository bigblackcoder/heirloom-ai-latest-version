import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import HeirloomLogo from "@/components/heirloom-logo";

// Form validation schema
const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const { signup, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  // Form setup
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  // Handle form submission
  const onSubmit = async (data: SignupFormValues) => {
    try {
      // Extract password confirmation before sending
      const { confirmPassword, ...submitData } = data;
      
      // Sign up through auth service
      await signup(submitData.username, submitData.email, submitData.password);
      
      // After successful signup, navigate to verification page
      navigate("/verification");
    } catch (error) {
      // Error is handled by the signup function
      console.error("Signup submission error:", error);
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

      {/* Signup Form */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription className="text-white/70">
            Join Heirloom to manage your digital identity
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
                        placeholder="Choose a username" 
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
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter your email" 
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
                        placeholder="Create a password" 
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
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Confirm your password" 
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
                className="w-full py-6 mt-2 bg-[#273414] text-white hover:bg-[#1e2610] rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="link" 
            className="text-white/70 hover:text-white"
            onClick={() => navigate("/")}
          >
            Already have an account? Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}