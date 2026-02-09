'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { cookieStorage, hasValidAuth, getStoredAuth } from '@/lib/utils';

export default function AuthInitializer() {
  const { fetchProfile, isAuthenticated, user } = useAuthStore();
  const initAttempted = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (initAttempted.current) return;
    initAttempted.current = true;

    const initAuth = async () => {
      // If already authenticated with user data, skip
      if (isAuthenticated && user) return;

      // Check for stored auth data (from previous session)
      const storedUser = getStoredAuth();

      // If we have stored user data, the session cookie might still be valid
      // Try to restore the session by fetching the profile
      if (storedUser) {
        const currentRole = storedUser.role;
        try {
          await fetchProfile(currentRole || undefined);
        } catch (error) {
          // Session expired or invalid - user will be logged out
          console.log('Session restoration failed:', error.message);
        }
        return;
      }

      // Also check if there's any auth hint (for cases where storage is cleared but cookie exists)
      const hasAuthHint = hasValidAuth();
      if (hasAuthHint) {
        try {
          await fetchProfile(undefined);
        } catch (error) {
          // Silently fail - user is guest or token expired
        }
      }
    };

    initAuth();
  }, []); // Only run on mount

  return null; // This component doesn't render anything
}
