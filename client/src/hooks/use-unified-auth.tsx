import { useAuth as useProviderAuth } from '@/providers/auth-provider';
import { useAuth as useHooksAuth } from '@/hooks/use-auth';
import { USE_NEW_AUTH_PROVIDER } from '@/config/auth';

/**
 * Unified Auth Hook
 * 
 * This hook provides a unified interface to whichever auth system 
 * is configured in the application. This allows components to use
 * a consistent API regardless of which auth implementation is active.
 */
export function useAuth() {
  try {
    // Try the provider-based auth first (newer implementation)
    return useProviderAuth();
  } catch (e) {
    // Fall back to the hooks-based auth if the provider-based auth is not available
    try {
      return useHooksAuth();
    } catch (e2) {
      // If neither auth system is available, throw a helpful error
      throw new Error(
        "No auth provider found. Make sure to wrap your application with either AuthProvider from providers/auth-provider or AuthProvider from hooks/use-auth."
      );
    }
  }
}