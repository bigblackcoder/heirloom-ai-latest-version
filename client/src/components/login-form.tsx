import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth-context';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HeirloomLogo } from '@/components/heirloom-logo';

const formSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginForm() {
  const { login } = useAuth();
  const [_, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const success = await login(values.username, values.password);
      if (success) {
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg">
      <div className="w-16 h-16 rounded-2xl bg-[#8ccc5c] flex items-center justify-center mb-4">
        <HeirloomLogo className="w-8 h-8 text-white" />
      </div>
      
      <h2 className="text-2xl font-bold mb-6 text-white">Welcome Back</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Username</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your username" 
                    {...field} 
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
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
                <FormLabel className="text-white">Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="Enter your password" 
                    {...field} 
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full py-6 bg-[#4caf50] hover:bg-[#2a5414] text-white font-medium text-lg rounded-full shadow-lg mt-2"
          >
            {isSubmitting ? 'Logging in...' : 'Sign In'}
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center">
        <p className="text-white/70 mb-2">Don't have an account?</p>
        <Button 
          variant="outline" 
          className="border-white/30 text-white hover:bg-white/20"
          onClick={() => navigate('/register')}
        >
          Create Account
        </Button>
      </div>
    </div>
  );
}