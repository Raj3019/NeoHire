'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { resetAccountRestrictedFlag } from '@/lib/api';
import { NeoButton, NeoCard, NeoInput } from '@/components/ui/neo';
import { Briefcase, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn, cookieStorage, hasValidAuth } from '@/lib/utils';
import { googleSignIn } from '@/lib/api';

// Create a component that uses useSearchParams
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Determine mode from URL search params
  const mode = searchParams.get('mode');
  const roleParam = searchParams.get('role');
  const isRecruiter = mode === 'recruiter' || roleParam === 'recruiter';

  const { login, isAuthenticated, user, fetchProfile } = useAuthStore();
  // Role defaults to URL param or candidate, but we won't toggle it here anymore to match reference
  const role = isRecruiter ? 'Recruiter' : 'Employee';
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
    // Reset the account restricted flag so suspended/banned users
    // can see proper error messages when trying to login again
    resetAccountRestrictedFlag();
  }, []);

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (!mounted) return;
    // First try to read persisted auth from cookie to avoid flashes
    if (hasValidAuth()) {
      const authCookie = cookieStorage.getItem('auth-storage');
      if (authCookie) {
        try {
          const parsed = JSON.parse(authCookie);
          const stored = parsed?.state || parsed;
          const storedUser = stored?.user || (stored?.isAuthenticated ? stored : null);
          const storedRole = storedUser?.role;
          if (storedRole) {
            const roleLower = storedRole.toLowerCase();
            let redirectTo = '/candidate/dashboard';

            if (roleLower === 'admin') redirectTo = '/admin/dashboard';
            else if (roleLower === 'recruiter') redirectTo = '/recruiter/dashboard';

            router.replace(redirectTo);
            return;
          }
        } catch (e) {
          // ignore parse errors and fall back to normal flow
        }
      }

      // If we have token but no suitable stored role, try to restore session (auto-detect)
      if (!user || (user.role?.toLowerCase() !== 'admin' && user.role?.toLowerCase() !== 'recruiter' && user.role?.toLowerCase() !== 'employee')) {
        const tryRestoreSession = async () => {
          await fetchProfile();
        };
        tryRestoreSession();
        return;
      }
    }

    // Fallback: check store state and redirect
    const hasAuth = (isAuthenticated && user && user.email);
    if (hasAuth) {
      const userRole = user?.role?.toLowerCase();
      let redirectTo = '/candidate/dashboard';

      if (userRole === 'admin') redirectTo = '/admin/dashboard';
      else if (userRole === 'recruiter') redirectTo = '/recruiter/dashboard';

      router.replace(redirectTo);
    }
  }, [mounted, isAuthenticated, user, router, isRecruiter, fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear any existing errors
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData.email, formData.password, role);

      if (result.success) {
        // Redirect based on actual role from result
        const actualRole = result.user?.role?.toLowerCase();
        if (actualRole === 'admin') router.push('/admin/dashboard');
        else if (actualRole === 'recruiter') router.push('/recruiter/dashboard');
        else router.push('/candidate/dashboard');
      } else {
        // Show error message and stop loading ONLY if not already toasted
        if (!result.isHandled) {
          setError(result.error || 'Login failed. Please check your credentials.');
        }
        setIsLoading(false);
      }
    } catch (err) {
      // Handle unexpected errors
      // console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Block rendering while we are initializing auth and redirecting
  if (!mounted) return <div className="min-h-screen bg-neo-bg"></div>;

  // If we definitely have auth, don't show the form
  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-neo-bg dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neo-yellow" />
      </div>
    );
  }

  // If we have a hint that we might be auth (cookie exists), also hide the form while we verify
  if (hasValidAuth()) {
    return (
      <div className="min-h-screen bg-neo-bg dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neo-yellow" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-neo-bg dark:bg-zinc-950 p-4 transition-colors">
      <NeoCard className="w-full max-w-md relative pt-10">
        <div className={`absolute top-0 left-0 w-full h-2 ${isRecruiter ? 'bg-neo-pink' : 'bg-neo-yellow'}`}></div>

        <h2 className="text-3xl font-black text-center mb-6 uppercase mt-2 dark:text-white">
          Welcome Back
          <span className={`block text-sm font-mono mt-1 ${isRecruiter ? 'text-neo-pink' : 'text-neo-blue'}`}>
            {isRecruiter ? 'Recruiter Portal' : 'Candidate Portal'}
          </span>
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 dark:border-red-400 shadow-[2px_2px_0px_0px_rgba(239,68,68,0.5)] relative">
            <button
              onClick={() => setError('')}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 font-bold text-xl leading-none"
              aria-label="Dismiss error"
            >
              ×
            </button>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-red-700 dark:text-red-300 font-bold text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
            <label className="block font-bold text-sm dark:text-white">Email</label>
            <NeoInput
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block font-bold text-sm dark:text-white">Password</label>
            <div className="relative">
              <NeoInput
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <NeoButton
            type="submit"
            size="lg"
            className={`w-full mt-4 ${isRecruiter ? 'bg-neo-pink text-white hover:bg-pink-400 dark:shadow-[4px_4px_0px_0px_#ffffff]' : ''}`}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Logging In...' : 'Log In'}
          </NeoButton>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-neo-black/10 dark:border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white dark:bg-[#1E1E1E] px-4 font-black uppercase tracking-widest text-gray-400">or</span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={() => {
            setGoogleLoading(true);
            googleSignIn(role);
          }}
          disabled={isLoading || googleLoading}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-3 px-4 border-2 border-neo-black dark:border-white font-black uppercase tracking-wider text-sm transition-all",
            "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]",
            "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
            "bg-white dark:bg-zinc-900 text-neo-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {googleLoading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          {googleLoading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        <div className="mt-6 text-center text-sm font-mono dark:text-gray-300">
          Don't have an account? <Link href={`/register?mode=${isRecruiter ? 'recruiter' : 'candidate'}`} className="font-bold underline decoration-2 hover:text-neo-blue">Sign Up</Link>
        </div>
      </NeoCard>
    </div>
  );
}

// Wrap the LoginForm in Suspense
export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
