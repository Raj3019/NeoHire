'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { hasValidAuth, getStoredAuth } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function AdminGuard({ children }) {
  const { user, isAuthenticated, fetchProfile } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    setMounted(true);
    
    const checkHydration = async () => {
      if (isAuthenticated && user) {
        setIsHydrating(false);
        return;
      }
      
      if (hasValidAuth() && !isAuthenticated) {
        const storedUser = getStoredAuth();
        await fetchProfile(storedUser?.role || undefined);
      }
      
      setIsHydrating(false);
    };
    
    const timer = setTimeout(checkHydration, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!mounted || isHydrating) return;

    if (!isAuthenticated && hasValidAuth()) {
      return;
    }

    if (!isAuthenticated) {
      router.push(`/login?redirect=${pathname}`);
      return;
    }

    if (!isAdmin) {
      if (user?.role === 'Recruiter') {
        router.push('/recruiter/dashboard');
      } else {
        router.push('/candidate/dashboard');
      }
    }
  }, [mounted, isAuthenticated, user, isAdmin, router, pathname, isHydrating]);

  if (!mounted || isHydrating) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neo-bg dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-neo-yellow" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neo-bg dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-neo-yellow" />
      </div>
    );
  }

  return children;
}
