'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { NeoCard, NeoBadge } from '@/components/ui/neo';
import { ArrowRight, Loader2, Star, Zap, Check, XCircle, AlertTriangle, Home } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

function EmailVerifiedContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const { fetchProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (error) {
      setIsLoading(false);
      return;
    }

    const verifySession = async () => {
      try {
        await fetchProfile();
      } catch (err) {
        // Silent catch
      } finally {
        setTimeout(() => setIsLoading(false), 1200);
      }
    };
    verifySession();
  }, [fetchProfile, error]);

  if (isLoading) {
    return (
      <NeoCard className="w-full max-w-md relative pt-12 pb-8 px-6 md:px-10 overflow-visible shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] border-4">
        <div className="absolute top-0 left-0 w-full h-2 bg-neo-black dark:bg-white flex overflow-hidden">
            <div className="h-full w-4 bg-neo-yellow mr-1"></div>
            <div className="h-full w-4 bg-neo-blue mr-1"></div>
        </div>
        <div className="flex flex-col items-center justify-center py-10 space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-neo-black dark:border-white rounded-none flex items-center justify-center animate-spin border-t-neo-blue"></div>
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black uppercase tracking-tight dark:text-white">Processing...</h2>
            <p className="font-mono text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">Validating Authentication Token</p>
          </div>
        </div>
      </NeoCard>
    );
  }

  // Simplified Error State UI
  if (error) {
    return (
      <NeoCard className="w-full max-w-md relative pt-12 pb-8 px-6 md:px-10 overflow-visible shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] border-4">
        <div className="absolute top-0 left-0 w-full h-2 bg-neo-red flex overflow-hidden">
            <div className="h-full w-full bg-neo-red"></div>
        </div>
        
        <div className="absolute -top-4 right-8">
            <NeoBadge variant="pink" className="text-[10px] py-1 px-4 shadow-neo-sm border-2 text-white font-black tracking-widest bg-neo-red border-neo-black">
                AUTH_FAILED
            </NeoBadge>
        </div>

        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="relative mb-8 group">
            <div className="w-20 h-20 border-4 border-neo-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] flex items-center justify-center bg-neo-red relative z-10 transform rotate-2">
                <XCircle className="w-12 h-12 text-white stroke-[3]" />
            </div>
            <AlertTriangle className="absolute -top-4 -right-4 w-8 h-8 text-neo-yellow fill-neo-yellow animate-bounce" />
          </div>
          
          <h1 className="text-4xl font-black uppercase tracking-tighter text-neo-black dark:text-white mb-2 leading-none">
            INVALID <br/>
            <span className="text-neo-red underline decoration-4 underline-offset-2">TOKEN</span>
          </h1>
          
          <div className="mb-10 mt-6 space-y-4">
            <p className="font-bold text-lg dark:text-gray-200 uppercase tracking-tight italic">
              "Verification link is no longer valid."
            </p>
            <p className="font-mono text-[13px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed max-w-[280px] mx-auto">
              This link has either expired or was already used. Please request a new verification link from the login page.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 w-full">
            <Link href="/login" className="w-full">
              <button 
                className="w-full bg-neo-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest py-3.5 px-6 border-2 border-neo-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center text-sm group"
              >
                <span>BACK TO LOGIN</span>
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            
            <Link href="/" className="w-full">
              <button 
                className="w-full bg-transparent text-neo-black dark:text-white font-black uppercase tracking-widest py-3 px-6 border-2 border-neo-black/10 dark:border-white/10 hover:border-neo-black dark:hover:border-white transition-all text-[11px] flex items-center justify-center gap-2"
              >
                <Home className="w-3 h-3" />
                HOME PAGE
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between border-t-2 border-neo-black/5 dark:border-white/5 pt-6 opacity-40">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-neo-red"></div>
            <span className="font-mono text-[9px] font-black uppercase tracking-widest text-neo-black dark:text-white">Validation_Error</span>
          </div>
          <span className="font-mono text-[9px] font-bold text-gray-400">ERR_0x9A</span>
        </div>
      </NeoCard>
    );
  }

  // Success State UI
  return (
    <NeoCard className="w-full max-w-md relative pt-12 pb-8 px-6 md:px-10 overflow-visible shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] border-4">
      {/* Progress Tape Header */}
      <div className="absolute top-0 left-0 w-full h-2 bg-neo-black dark:bg-white flex overflow-hidden">
          <div className="h-full w-4 bg-neo-yellow mr-1"></div>
          <div className="h-full w-4 bg-neo-blue mr-1"></div>
          <div className="h-full w-4 bg-neo-pink"></div>
          <div className="flex-1"></div>
          <div className="h-full w-12 bg-neo-yellow/30"></div>
      </div>
      
      {/* Clean Status Badge */}
      <div className="absolute -top-4 right-8">
          <NeoBadge variant="green" className="text-[10px] py-1 px-4 shadow-neo-sm border-2 text-white font-black tracking-widest border-neo-black">
              VERIFIED_OK
          </NeoBadge>
      </div>
      
      <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Success Visual */}
        <div className="relative mb-8 group">
          <div className="w-20 h-20 border-4 border-neo-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] flex items-center justify-center bg-neo-yellow relative z-10 transform -rotate-2">
              <Check className="w-12 h-12 text-neo-black stroke-[4]" />
          </div>
          
          <Star className="absolute -top-4 -right-4 w-8 h-8 text-neo-pink fill-neo-pink animate-spin-slow opacity-40" />
          <Zap className="absolute -bottom-2 -left-6 w-6 h-6 text-neo-blue fill-neo-blue animate-bounce" />
        </div>
        
        <h1 className="text-4xl font-black uppercase tracking-tighter text-neo-black dark:text-white mb-4 leading-none">
          ACCOUNT <br/>
          <span className="text-neo-blue underline decoration-4 underline-offset-2">ACTIVATED</span>
        </h1>
        
        <div className="mb-10 space-y-4">
          <div className="inline-block px-3 py-1 bg-neo-green/10 dark:bg-neo-green/20 border-2 border-neo-green/30 text-neo-green font-black text-[11px] uppercase tracking-wider mb-2">
            Verification Successful
          </div>
          <p className="font-mono text-[13px] text-gray-500 dark:text-gray-400 font-bold leading-relaxed max-w-[280px] mx-auto">
            Security handshake complete. Your professional profile is now live on the NeoHire network.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 w-full">
          <Link href="/login" className="w-full">
            <button 
              className="w-full bg-neo-black dark:bg-white text-white dark:text-black font-black uppercase tracking-widest py-3.5 px-6 border-2 border-neo-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center text-sm group"
            >
              <span>GO TO LOGIN</span>
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
          
          <Link href="/" className="w-full">
            <button 
              className="w-full bg-transparent text-neo-black dark:text-white font-black uppercase tracking-widest py-3 px-6 border-2 border-neo-black/10 dark:border-white/10 hover:border-neo-black dark:hover:border-white transition-all text-[11px]"
            >
              BACK TO HOME
            </button>
          </Link>
        </div>
      </div>
      
      <div className="mt-12 flex items-center justify-between border-t-2 border-neo-black/5 dark:border-white/5 pt-6 opacity-40 group">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-neo-green"></div>
          <span className="font-mono text-[9px] font-black uppercase tracking-widest text-neo-black dark:text-white">Sync_Complete</span>
        </div>
        <span className="font-mono text-[9px] font-bold text-gray-400">0x7F_VERIFIED</span>
      </div>
    </NeoCard>
  );
}

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-neo-bg dark:bg-zinc-950 p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none"></div>
      
      <div className="absolute top-1/4 right-[10%] w-12 h-12 border-4 border-neo-blue opacity-20 rotate-12 animate-pulse"></div>
      <div className="absolute bottom-1/4 left-[10%] w-16 h-16 border-4 border-neo-pink opacity-20 -rotate-12 animate-bounce-slow"></div>
      
      <Suspense fallback={<div>Loading...</div>}>
        <EmailVerifiedContent />
      </Suspense>
    </div>
  );
}
