'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { employeeAPI, recruiterAPI } from '@/lib/api';
import { NeoButton, NeoCard, NeoInput } from '@/components/ui/neo';
import { Briefcase, User, Eye, EyeOff, Mail, Check, ArrowRight } from 'lucide-react';
import { cn, cookieStorage, hasValidAuth } from '@/lib/utils';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Determine mode from URL search params
  const mode = searchParams.get('mode');
  const roleParam = searchParams.get('role');
  const isRecruiter = mode === 'recruiter' || roleParam === 'recruiter';
  const role = isRecruiter ? 'Recruiter' : 'Employee';

  const { login, signup, isAuthenticated, user, fetchProfile } = useAuthStore();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', fullName: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect authenticated users away from register page
  useEffect(() => {
    if (!mounted) return;
    // Prefer parsing persisted auth cookie first to avoid flashes
    if (hasValidAuth()) {
      const authCookie = cookieStorage.getItem('auth-storage');
      if (authCookie) {
        try {
          const parsed = JSON.parse(authCookie);
          const stored = parsed?.state || parsed;
          const storedUser = stored?.user || (stored?.isAuthenticated ? stored : null);
          const storedRole = storedUser?.role;
          if (storedRole) {
            const isRec = (storedRole === 'Recruiter' || storedRole?.toLowerCase() === 'recruiter');
            const redirectTo = isRec ? '/recruiter/dashboard' : '/candidate/dashboard';
            //console.log('Register page: redirecting from cookie:', { storedRole, redirectTo });
            router.replace(redirectTo);
            return;
          }
        } catch (e) {
          // ignore and continue
        }
      }

      if (!user || !user.role) {
        const tryRestoreSession = async () => {
          await fetchProfile();
        };
        tryRestoreSession();
        return;
      }
    }

    const hasAuth = (isAuthenticated && user && user.email);
    if (hasAuth) {
      const userRole = user?.role;
      const isRecruiterRole = (userRole === 'Recruiter' || userRole?.toLowerCase() === 'recruiter');
      const redirectTo = isRecruiterRole ? '/recruiter/dashboard' : '/candidate/dashboard';
      router.replace(redirectTo);
    }
  }, [mounted, isAuthenticated, user, router, isRecruiter, fetchProfile]);

  const handleResend = async () => {
    if (isLoading || !formData.email) return;
    setIsLoading(true);
    setError('');
    try {
      const api = isRecruiter ? recruiterAPI : employeeAPI;
      const response = await api.resendVerification(formData.email);
      setResendStatus(response.message);
      setIsLoading(false);
      // Clear status after 5 seconds
      setTimeout(() => setResendStatus(''), 5000);
    } catch (err) {
      if (!err.isHandled) {
        setError(err.response?.data?.message || 'Failed to resend verification email.');
      }
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear any existing errors
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(formData.email, formData.password, formData.confirmPassword, role, formData.fullName);

      if (result.success) {
        if (result.requiresVerification) {
          setSuccessMessage(result.message); // Use result.message directly from the store's signup
          setIsLoading(false);
        } else {
          // Redirect based on role after successful signup
          router.push(role === 'Recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard');
        }
      } else {
        // Show error message and stop loading
        if (!result.isHandled) {
          setError(result.error || 'Signup failed. Please try again.');
        }
        setIsLoading(false);
      }
    } catch (err) {
      // Handle unexpected errors
      if (!err.isHandled) {
        console.error('Signup error:', err);
      }
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Block rendering if mounted and already authenticated (from store OR cookies)
  if (!mounted) return null;
  if (isAuthenticated && user) return null;
  if (hasValidAuth()) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-neo-bg dark:bg-zinc-950 p-4 transition-colors text-neo-black">
      <NeoCard className="w-full max-w-md relative pt-10">
        <div className={`absolute top-0 left-0 w-full h-2 ${isRecruiter ? 'bg-neo-orange' : 'bg-neo-yellow'}`}></div>

        <h2 className="text-3xl font-black text-center mb-6 uppercase mt-2 dark:text-white">
          Join Us
          <span className={`block text-sm font-mono mt-1 ${isRecruiter ? 'text-neo-orange' : 'text-neo-blue'}`}>
            {isRecruiter ? 'Recruiter Portal' : 'Candidate Portal'}
          </span>
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-neo-black dark:border-red-400 shadow-neo-sm relative">
            <button
              onClick={() => setError('')}
              className="absolute top-2 right-2 text-neo-black dark:text-red-400 dark:hover:text-red-200 font-bold text-xl leading-none"
              aria-label="Dismiss error"
            >
              ×
            </button>
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-neo-black dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-bold text-sm dark:text-red-300">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage ? (
          <div className="flex flex-col items-center text-center py-2 animate-in fade-in zoom-in duration-500">
            <div className="relative mb-6">
              <div className={cn(
                "w-20 h-20 border-4 border-neo-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] rounded-full flex items-center justify-center mx-auto relative z-10",
                isRecruiter ? "bg-neo-orange" : "bg-neo-yellow"
              )}>
                <Mail className="w-10 h-10 text-neo-black" />
              </div>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-8 h-8 border-2 border-neo-black rounded-full flex items-center justify-center z-20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] animate-bounce",
                isRecruiter ? "bg-neo-pink text-white" : "bg-neo-blue text-white"
              )}>
                <Check className="w-4 h-4 stroke-[4px]" />
              </div>
            </div>

            <h2 className="text-2xl font-black uppercase text-neo-black dark:text-white mb-3 tracking-tight leading-none">
              Check Your <span className={cn("font-mono", isRecruiter ? "text-neo-orange" : "text-neo-blue")}>Inbox</span>
            </h2>

            <p className="font-mono text-[13px] text-gray-500 dark:text-gray-400 mb-6 max-w-[280px]">
              We've sent a magic link to your email. Click it to activate your account.
            </p>

            <div className="w-full space-y-4">
              <Link href={`/login?mode=${isRecruiter ? 'recruiter' : 'candidate'}`} className="block w-full">
                <NeoButton className={cn(
                  "w-full text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none py-3 text-base font-black uppercase tracking-wider group",
                  isRecruiter ? "bg-neo-orange hover:bg-orange-600" : "bg-neo-blue hover:bg-blue-600"
                )}>
                  Proceed to Login
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </NeoButton>
              </Link>
            </div>

            <div className="mt-8 p-3 border-2 border-dashed border-gray-200 dark:border-zinc-800 w-full relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 bg-white dark:bg-[#1E1E1E] text-[9px] font-black uppercase text-gray-400">
                Troubleshooting
              </div>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                {resendStatus ? (
                  <span className="text-green-600 dark:text-green-400 animate-pulse">{resendStatus}</span>
                ) : (
                  <>
                    Didn't receive anything? Check spam or <button
                      onClick={handleResend}
                      disabled={isLoading}
                      className="text-neo-pink underline hover:text-pink-600 disabled:opacity-50 disabled:no-underline"
                    >
                      {isLoading ? 'resending...' : 'click here to resend'}
                    </button>.
                  </>
                )}
              </p>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="space-y-1">
                <label className="block font-bold text-sm dark:text-white uppercase tracking-tight">Full Name</label>
                <NeoInput
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-sm dark:text-white uppercase tracking-tight">Email Address</label>
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
                <label className="block font-bold text-sm dark:text-white uppercase tracking-tight">Password</label>
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neo-black dark:hover:text-white focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block font-bold text-sm dark:text-white uppercase tracking-tight">Confirm Password</label>
                <div className="relative">
                  <NeoInput
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    disabled={isLoading}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-neo-black dark:hover:text-white focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <NeoButton
                type="submit"
                size="lg"
                className="w-full mt-4 bg-neo-black text-white hover:bg-zinc-800"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Get Started →'}
              </NeoButton>
            </form>

            <div className="mt-6 text-center text-sm font-mono dark:text-gray-300">
              Already have an account? <Link href={`/login?mode=${isRecruiter ? 'recruiter' : 'candidate'}`} className="font-bold underline decoration-2 hover:text-neo-blue">Login</Link>
            </div>
          </>
        )}
      </NeoCard>
    </div>
  );
}

export default function Register() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
