'use client';
import React, { useState, useEffect } from 'react';
import { talentRadarAPI } from '@/lib/api';
import { NeoCard, NeoButton, NeoBadge } from '@/components/ui/neo';
import { Search, CheckCircle2, AlertCircle, Clock, MapPin, Building2, ChevronRight, Info, AlertTriangle, X, Radio, Sparkles, Crown } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function TalentRadarOptIn() {
  const { user, fetchProfile } = useAuthStore();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (user) {
      setIsEnabled(user.talentRadarOptIn || false);
      setIsLoading(false);
    }
  }, [user]);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
  };

  const handleToggle = async () => {
    if (!hasAccess) {
      showFeedback('error', 'Please upgrade your plan to enable recruiter discoverability');
      return;
    }

    if (!hasResume) {
      showFeedback('error', 'Please upload your resume first to enable Talent Radar');
      return;
    }

    try {
      setIsToggling(true);
      const res = await talentRadarAPI.toggleOptIn(!isEnabled);
      setIsEnabled(res.talentRadarOptIn);
      showFeedback('success', res.message);
      // Refresh profile to keep store in sync
      fetchProfile('Employee');
    } catch (error) {
      if (error.response?.status === 403) {
        showFeedback('error', 'Upgrade your plan to enable this feature.');
      } else {
        showFeedback('error', error.response?.data?.message || 'Failed to update visibility status');
      }
    } finally {
      setIsToggling(false);
    }
  };

  const hasResume = !!user?.resumeFileURL;
  const hasAccess = true; // FEATURE UNLOCKED: Plan check bypassed for testing/early access

  if (isLoading) {
    return (
      <NeoCard className="animate-pulse h-48 flex items-center justify-center border-4">
        <div className="text-center">
          <Search className="w-8 h-8 mx-auto mb-2 text-gray-300 animate-bounce" />
          <p className="text-gray-400 font-mono">Setting up your radar...</p>
        </div>
      </NeoCard>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Local Feedback Banner */}
      {feedback.message && (
        <div className={`
          fixed top-24 right-4 z-[999] p-4 border-2 border-neo-black dark:border-white shadow-neo animate-in fade-in slide-in-from-right-4 duration-300 flex items-center gap-3
          ${feedback.type === 'error' ? 'bg-neo-red text-white' : 'bg-neo-green text-white'}
        `}>
          {feedback.type === 'error' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          <span className="font-black uppercase text-sm">{feedback.message}</span>
          <button onClick={() => setFeedback({ type: '', message: '' })} className="ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Control Card */}
      <NeoCard className="border-4 border-neo-blue relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 -rotate-12 translate-x-8 -translate-y-8 pointer-events-none rounded-full blur-3xl" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-neo-blue via-blue-400 to-blue-600 border-2 border-black dark:border-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
                <Radio className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black uppercase dark:text-white">Talent Radar Visibility</h3>
                </div>
                <p className="text-xs text-neo-blue font-bold tracking-widest uppercase">Passive Discovery</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md font-medium">
              Allow recruiters to discover your profile even when you haven't applied. We'll match you based on your skills and experience.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <button
              onClick={handleToggle}
              disabled={isToggling || !hasAccess}
              className={`
                relative w-16 h-8 rounded-full border-2 border-black transition-all duration-300 shadow-neo-sm
                ${isEnabled ? 'bg-neo-green' : 'bg-gray-200 dark:bg-zinc-800'}
                ${isToggling || !hasAccess ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
              `}
            >
              <div className={`
                absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-black rounded-full transition-all duration-300
                ${isEnabled ? 'left-9' : 'left-1'}
              `} />
            </button>
            <span className={`text-xs font-black uppercase tracking-wider ${isEnabled ? 'text-neo-green' : 'text-gray-400'} flex items-center gap-1`}>
              {isEnabled && <Sparkles className="w-3 h-3 animate-pulse" />}
              {isEnabled ? 'Discoverable' : 'Hidden'}
            </span>
          </div>
        </div>

        {/* Requirements Notification */}
        {hasAccess && !hasResume && (
          <div className="mt-6 p-4 bg-neo-pink/10 border-2 border-neo-pink/30 rounded-lg flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-neo-pink shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-neo-pink uppercase">Action Required</p>
              <p className="text-xs text-gray-500 mt-1">Please upload your resume in the profile section to enable Talent Radar discoverability.</p>
            </div>
          </div>
        )}

        {isEnabled && (
          <div className="mt-6 flex items-center gap-2 p-3 bg-neo-green/10 border-2 border-neo-green/30 rounded-lg text-xs font-mono text-neo-green">
            <CheckCircle2 className="w-4 h-4" />
            <span>Recruiters can now find you for matching opportunities.</span>
          </div>
        )}
      </NeoCard>
    </div>
  );
}
