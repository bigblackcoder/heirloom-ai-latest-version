/**
 * Secure API Utility
 * Used for making secure API calls without hardcoded credentials
 */

import axios from 'axios';
import { createHash } from 'crypto';

// Create an axios instance with default configuration
const secureApi = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * Generate a secure request signature
 * @param payload - Data to sign
 * @param secret - Secret key for signing (from environment variables)
 */
function generateSignature(payload: any, secret: string): string {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return createHash('sha256')
    .update(`${data}${secret}`)
    .digest('hex');
}

/**
 * Make a secure API request with proper authentication
 * @param url - API endpoint URL
 * @param method - HTTP method
 * @param data - Request payload
 * @param apiKeyName - Name of the environment variable containing the API key
 */
export async function secureRequest(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any,
  apiKeyName?: string
) {
  try {
    // Get API key from environment variables if specified
    const apiKey = apiKeyName ? process.env[apiKeyName] : undefined;
    
    // Prepare headers with authentication if needed
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    
    // Make the API request
    const response = await secureApi({
      url,
      method,
      data,
      headers
    });
    
    return response.data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Verify webhook request authenticity
 * @param payload - Request payload
 * @param signature - Provided signature
 * @param secretEnvName - Name of the environment variable containing the webhook secret
 */
export function verifyWebhookSignature(
  payload: any,
  signature: string,
  secretEnvName: string
): boolean {
  const secret = process.env[secretEnvName];
  if (!secret) {
    console.error(`Webhook secret not found in environment variables: ${secretEnvName}`);
    return false;
  }
  
  const calculatedSignature = generateSignature(payload, secret);
  return calculatedSignature === signature;
}

export default secureApi;