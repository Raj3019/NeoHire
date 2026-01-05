'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { cookieStorage, hasValidAuth, getStoredAuth } from '@/lib/utils';

export default function AuthInitializer() {
  const { fetchProfile, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    // Only try to fetch profile if we have auth hints (token in storage)
    const initAuth = async () => {
      // If already authenticated, skip
      if (isAuthenticated && user) return;

      // Check if there's any auth hint (token in cookies/localStorage)
      const hasAuthHint = hasValidAuth();
      
      // If NO auth hint, user is definitely a guest - don't make any API calls
      if (!hasAuthHint) {
        return;
      }

      // If we have an auth hint, try to restore session
      const storedUser = getStoredAuth();
      const currentRole = user?.role || storedUser?.role;

      try {
        await fetchProfile(currentRole || undefined);
      } catch (error) {
        // Silently fail - user is guest or token expired
      }
    };

    initAuth();
  }, []); // Only run on mount

  return null; // This component doesn't render anything
}
