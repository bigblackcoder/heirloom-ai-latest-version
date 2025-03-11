import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const contentType = res.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const errorData = await res.json();
      
      if (typeof errorData === "object" && errorData !== null) {
        if ("message" in errorData) {
          throw new Error(errorData.message as string);
        } else if ("error" in errorData) {
          throw new Error(errorData.error as string);
        }
      }
    }

    throw new Error(`Request failed with status: ${res.status}`);
  }
}

export async function apiRequest<TData = unknown>(
  urlOrOptions: string | {
    url: string;
    method?: string;
    body?: Record<string, any>;
  },
  options: RequestInit = {},
): Promise<TData> {
  let url: string;
  let finalOptions: RequestInit = { ...options };
  
  // Handle both parameter formats
  if (typeof urlOrOptions === 'string') {
    url = urlOrOptions;
  } else {
    url = urlOrOptions.url;
    finalOptions.method = urlOrOptions.method || 'GET';
    if (urlOrOptions.body) {
      finalOptions.body = JSON.stringify(urlOrOptions.body);
    }
  }
  
  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  const opts: RequestInit = {
    credentials: "include",
    ...finalOptions,
    headers: {
      ...defaultHeaders,
      ...finalOptions.headers,
    },
  };

  const response = await fetch(url, opts);

  const contentType = response.headers.get("content-type");
  
  if (response.status === 204) {
    return {} as TData;
  }

  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  if (contentType?.includes("application/json")) {
    await throwIfResNotOk(response);
    return response.json();
  }

  await throwIfResNotOk(response);
  return {} as TData;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn = <TData>(options: {
  on401: UnauthorizedBehavior;
}) => {
  return async (url: string): Promise<TData | null> => {
    try {
      return await apiRequest<TData>(url);
    } catch (error) {
      if (
        error instanceof Error && 
        error.message === "Unauthorized" &&
        options.on401 === "returnNull"
      ) {
        return null;
      }
      throw error;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      queryFn: getQueryFn({ on401: "throw" }),
    },
  },
});