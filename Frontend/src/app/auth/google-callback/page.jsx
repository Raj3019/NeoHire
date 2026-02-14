'use client';
import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { NeoCard } from '@/components/ui/neo';
import { Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'Employee';
  const { handleGoogleCallback, isAuthenticated, user } = useAuthStore();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const processCallback = async () => {
      try {
        const normalizedRole = role === 'Recruiter' || role?.toLowerCase() === 'recruiter' ? 'Recruiter' : 'Employee';
        const result = await handleGoogleCallback(normalizedRole);

        if (result.success) {
          const actualRole = result.role || normalizedRole;
          const redirectTo = actualRole === 'Recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard';
          router.replace(redirectTo);
        } else {
          // Role mismatch or other error
          setError(result.error || 'Google sign-in failed.');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Google callback error:', err);
        setError('An unexpected error occurred. Please try again.');
        setIsProcessing(false);
      }
    };

    processCallback();
  }, []);

  if (isProcessing) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-neo-bg dark:bg-zinc-950 p-4">
        <NeoCard className="w-full max-w-md relative pt-10 flex flex-col items-center">
          <div className="absolute top-0 left-0 w-full h-2 bg-neo-black dark:bg-white flex overflow-hidden">
            <div className="h-full w-4 bg-neo-yellow mr-1"></div>
            <div className="h-full w-4 bg-neo-blue mr-1"></div>
            <div className="h-full w-4 bg-neo-pink"></div>
          </div>
          <Loader2 className="w-12 h-12 animate-spin text-neo-blue mb-4" />
          <h2 className="text-xl font-black uppercase dark:text-white mb-2">Signing you in...</h2>
          <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mb-6">Setting up your account</p>
        </NeoCard>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-neo-bg dark:bg-zinc-950 p-4">
      <NeoCard className="w-full max-w-md relative pt-10 flex flex-col items-center text-center">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        <div className="w-16 h-16 border-4 border-neo-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] flex items-center justify-center bg-red-100 dark:bg-red-900/30 mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-black uppercase dark:text-white mb-2">Sign-In Failed</h2>
        <p className="font-mono text-sm text-gray-600 dark:text-gray-400 mb-6 px-4">{error}</p>
        <div className="flex gap-3 w-full px-4 mb-6">
          <Link href="/login" className="flex-1">
            <button className="w-full bg-neo-black dark:bg-white text-white dark:text-black font-black uppercase tracking-wider py-3 px-4 border-2 border-neo-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all text-sm flex items-center justify-center group">
              Login
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          <Link href="/register" className="flex-1">
            <button className="w-full bg-transparent text-neo-black dark:text-white font-black uppercase tracking-wider py-3 px-4 border-2 border-neo-black/20 dark:border-white/20 hover:border-neo-black dark:hover:border-white transition-all text-sm">
              Register
            </button>
          </Link>
        </div>
      </NeoCard>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neo-bg dark:bg-zinc-950">
        <Loader2 className="w-10 h-10 animate-spin text-neo-yellow" />
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
