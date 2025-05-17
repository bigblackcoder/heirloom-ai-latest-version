import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      queryFn: defaultQueryFn,
    },
  },
});

async function defaultQueryFn({ queryKey }: { queryKey: string[] }) {
  const [url] = queryKey;
  const res = await fetch(url);
  
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    throw error;
  }
  
  return res.json();
}

type RequestOptions = {
  body?: object;
  headers?: HeadersInit;
};

export async function apiRequest(
  url: string,
  method: string,
  { body, headers }: RequestOptions = {}
) {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "An error occurred while making the request."
    );
    throw error;
  }

  return res.json();
}