import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';

export function useAuth() {
  const { isSignedIn, user } = useUser();
  const { getToken, signOut } = useClerkAuth();

  async function getAuthHeader(): Promise<Record<string, string>> {
    try {
      // Remove template parameter to use default JWT
      const token = await getToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    } catch (error) {
      console.error('Error getting auth token:', error);
      return {};
    }
  }

  async function getTokenWithFallback(): Promise<string | null> {
    try {
      // Try without template first
      const token = await getToken();
      if (token) return token;
      
      // Fallback: try with session template
      const sessionToken = await getToken({ template: 'session' });
      if (sessionToken) return sessionToken;
      
      // Final fallback: try with default template
      const defaultToken = await getToken({ template: 'default' });
      return defaultToken;
    } catch (error) {
      console.error('Error getting token with fallback:', error);
      return null;
    }
  }

  return { 
    isSignedIn, 
    user, 
    getAuthHeader, 
    getTokenWithFallback,
    signOut 
  };
}
