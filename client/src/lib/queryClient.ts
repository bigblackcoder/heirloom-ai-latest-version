import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export async function apiRequest(
  endpoint: string,
  options: ApiRequestOptions = {}
) {
  const { method = "GET", body, headers = {}, signal } = options;

  const requestHeaders: HeadersInit = {
    Accept: "application/json",
    ...headers,
  };

  if (body && !(body instanceof FormData)) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await fetch(endpoint, {
    method,
    headers: requestHeaders,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    credentials: "include", // Include cookies for authentication
    signal,
  });

  // If no content, return empty response
  if (response.status === 204) {
    return {};
  }

  const data = await response.json();

  // Handle API errors
  if (!response.ok) {
    const error = new Error(data.message || "An error occurred with the API request");
    error.name = "ApiError";
    // @ts-ignore
    error.status = response.status;
    // @ts-ignore
    error.data = data;
    throw error;
  }

  return data;
}

// Default fetcher for React Query
export const defaultFetcher = async ({ queryKey }: { queryKey: any }) => {
  const [endpoint] = queryKey;
  return await apiRequest(endpoint);
};