import { QueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// Default fetch function for React Query
async function defaultFetchFunction(
  url: string,
  init?: RequestInit
): Promise<Response> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || response.statusText || 'Request failed';
    throw new Error(errorMessage);
  }
  return response;
}

// API request for mutations
export async function apiRequest({ url, method = 'GET', body }: {
  url: string;
  method?: string;
  body?: any;
}) {
  // For development, directly connect to server instead of using Vite proxy
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
  const fullUrl = baseUrl + url;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
    credentials: 'include'
  };

  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await defaultFetchFunction(fullUrl, options);
    
    // Check for redirects (especially for login/logout)
    if (response.redirected) {
      window.location.href = response.url;
      return null;
    }
    
    // Parse response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error(`API request failed for ${fullUrl}:`, error);
    console.error('Request details:', { url, method, body, fullUrl });
    throw error;
  }
}

// Create a global query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      queryFn: async ({ queryKey }) => {
        if (typeof queryKey[0] === 'string') {
          // For development, directly connect to server instead of using Vite proxy
          const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : '';
          const fullUrl = baseUrl + queryKey[0];
          
          const response = await defaultFetchFunction(fullUrl, {
            credentials: 'include'
          });
          
          // Check for redirects
          if (response.redirected) {
            window.location.href = response.url;
            return null;
          }
          
          // Return JSON or text based on content type
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return await response.json();
          }
          
          return await response.text();
        }
        throw new Error(`Invalid query key: ${queryKey}`);
      },
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'An error occurred'
        });
      }
    }
  }
});