import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function that combines clsx and tailwind-merge for
 * cleaner and more maintainable classNames
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Helper function for API requests
 */
export async function apiRequest<T = any>(
  endpoint: string,
  method: string = 'GET',
  data?: any,
  headers: Record<string, string> = {}
): Promise<T> {
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    credentials: 'include',
  };

  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }

  const response = await fetch(endpoint, fetchOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed: ${response.status}`);
  }

  return await response.json();
}