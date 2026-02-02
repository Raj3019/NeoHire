'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { autoApplyAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { NeoCard, NeoButton, NeoBadge } from '@/components/ui/neo';
import { Zap, CheckCircle2, AlertCircle, Clock, MapPin, Building2, ChevronRight, Info, AlertTriangle, X, Crown, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AutoApplySettings() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: '', message: '' }), 5000);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statusRes, historyRes] = await Promise.all([
        autoApplyAPI.getStatus(),
        autoApplyAPI.getHistory()
      ]);
      setStatus(statusRes);
      setHistory(historyRes.applications || []);
    } catch (error) {
      console.error('Failed to load auto-apply data:', error);
      showFeedback('error', 'Failed to load auto-apply settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!hasAccess) {
      showFeedback('error', 'Please upgrade your plan to enable the Auto-Apply assistant');
      return;
    }

    if (!requirementsMet) {
      showFeedback('error', 'Please complete all profile requirements first');
      return;
    }

    try {
      setIsToggling(true);
      const res = await autoApplyAPI.toggle(!status.enabled);
      setStatus(prev => ({ ...prev, enabled: res.autoApplyEnabled }));
      showFeedback('success', res.message);
    } catch (error) {
      showFeedback('error', error.response?.data?.message || 'Failed to update auto-apply status');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) {
    return (
      <NeoCard className="animate-pulse h-96 flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-8 h-8 mx-auto mb-2 text-gray-300 animate-bounce" />
          <p className="text-gray-400 font-mono">Loading your AI assistant...</p>
        </div>
      </NeoCard>
    );
  }

  const requirementsMet =
    status?.canEnable?.hasResume &&
    status?.canEnable?.hasSkills &&
    status?.canEnable?.hasPhone &&
    status?.canEnable?.hasDateOfBirth &&
    status?.canEnable?.hasCity &&
    status?.canEnable?.hasEducation &&
    status?.canEnable?.hasJobPreferences &&
    status?.canEnable?.hasProfilePicture;

  const hasAccess = user?.currentPlan?.features?.autoApplyPerDay > 0;

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

      {/* Control Card - Premium Design */}
      <NeoCard className="border-4 border-amber-500 relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-yellow-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-amber-950/30">
        {/* Premium Background Effects */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-400/20 to-yellow-300/10 -rotate-12 translate-x-8 -translate-y-8 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-amber-400/10 to-transparent rotate-12 -translate-x-4 translate-y-4 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 border-2 border-amber-600 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                <Crown className="w-5 h-5 text-amber-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black uppercase dark:text-white">Smart Auto-Apply</h3>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900 border border-amber-500 shadow-sm">
                    ✨ PRO
                  </span>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-bold">Premium Feature</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md font-medium">
              Let our AI automatically apply for jobs that match your skills (<span className="text-amber-600 dark:text-amber-400 font-bold">80%+ match</span> required).
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <button
              onClick={handleToggle}
              disabled={isToggling || !requirementsMet || !hasAccess}
              className={`
                relative w-16 h-8 rounded-full border-2 border-black transition-all duration-300 shadow-neo-sm
                ${status?.enabled ? 'bg-neo-green' : 'bg-gray-200 dark:bg-zinc-800'}
                ${!requirementsMet || !hasAccess || isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
              `}
            >
              <div className={`
                absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-black rounded-full transition-all duration-300
                ${status?.enabled ? 'left-9' : 'left-1'}
              `} />
            </button>
            <span className={`text-xs font-black uppercase tracking-wider ${status?.enabled ? 'text-neo-green' : 'text-gray-400'}`}>
              {status?.enabled ? 'System Active' : 'System Offline'}
            </span>
          </div>
        </div>

        {/* Access Notification */}
        {!hasAccess && (
          <div className="mt-6 p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-lg flex gap-3 items-start">
            <Crown className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-600 uppercase">Upgrade Required</p>
              <p className="text-xs text-gray-500 mt-1 font-medium italic">Auto-Apply is a premium feature that works for you while you sleep. Upgrade to unlock autonomous job applications.</p>
              <Link href="/candidate/profile">
                <NeoButton variant="secondary" size="sm" className="mt-3 text-[10px] py-1 border-amber-500 text-amber-700">View Plans &rarr;</NeoButton>
              </Link>
            </div>
          </div>
        )}
        {/* Requirements Box */}
        {hasAccess && !requirementsMet && (
          <div className="mt-6 p-4 bg-neo-pink/10 border-2 border-neo-pink/30 rounded-lg flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-neo-pink shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-neo-pink uppercase">Requirements Not Met</p>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono">
                <span className={status?.canEnable?.hasResume ? 'text-neo-green' : 'text-neo-pink'}>
                  {status?.canEnable?.hasResume ? '✓' : '✗'} Resume
                </span>
                <span className={status?.canEnable?.hasSkills ? 'text-neo-green' : 'text-neo-pink'}>
                  {status?.canEnable?.hasSkills ? '✓' : '✗'} Skills
                </span>
                <span className={status?.canEnable?.hasPhone ? 'text-neo-green' : 'text-neo-pink'}>
                  {status?.canEnable?.hasPhone ? '✓' : '✗'} Phone
                </span>
                <span className={status?.canEnable?.hasDateOfBirth ? 'text-neo-green' : 'text-neo-pink'}>
                  {status?.canEnable?.hasDateOfBirth ? '✓' : '✗'} DOB
                </span>
                <span className={status?.canEnable?.hasCity ? 'text-neo-green' : 'text-neo-pink'}>
                  {status?.canEnable?.hasCity ? '✓' : '✗'} City
                </span>
                <span className={status?.canEnable?.hasEducation ? 'text-neo-green' : 'text-neo-pink'}>
                  {status?.canEnable?.hasEducation ? '✓' : '✗'} Education
                </span>
                <span className={status?.canEnable?.hasJobPreferences ? 'text-neo-green' : 'text-neo-pink'}>
                  {status?.canEnable?.hasJobPreferences ? '✓' : '✗'} Job Preferences
                </span>
                <span className={status?.canEnable?.hasProfilePicture ? 'text-neo-green' : 'text-neo-pink'}>
                  {status?.canEnable?.hasProfilePicture ? '✓' : '✗'} Profile Picture
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-500 italic">Complete these in your profile to activate auto-apply.</p>
            </div>
          </div>
        )}

        {status?.enabled && (
          <div className="mt-6 flex items-center gap-2 p-3 bg-neo-blue/10 border-2 border-neo-blue/30 rounded-lg text-xs font-mono text-neo-blue">
            <Info className="w-4 h-4" />
            <span>Our AI is scanning jobs every 6 hours to find your perfect match.</span>
          </div>
        )}
      </NeoCard>

      {/* History Card */}
      <NeoCard className="border-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black uppercase dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Auto-Apply History
          </h3>
          <NeoBadge variant="blue" className="font-mono">{history.length} APPLICATIONS</NeoBadge>
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
              <div className="w-12 h-12 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Building2 className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 font-mono text-sm">No auto-applications yet.</p>
              {status?.enabled ? (
                <p className="text-xs text-gray-400 mt-1">We'll let you know when we find a match!</p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Activate the system to start matching.</p>
              )}
            </div>
          ) : (
            history.slice(0, 1).map((app) => (
              <div
                key={app.applicationId}
                className="group border-2 border-black dark:border-white p-4 hover:translate-x-1 hover:-translate-y-1 transition-all bg-white dark:bg-zinc-900 shadow-none hover:shadow-neo-sm cursor-pointer"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="font-black text-neo-black dark:text-white group-hover:text-neo-blue transition-colors uppercase flex items-center gap-2">
                      {app.jobTitle}
                      <span className="px-2 py-0.5 text-[10px] font-black bg-neo-pink text-white border border-black">RECENT</span>
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-gray-500 uppercase tracking-tight">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {app.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.location}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-black text-neo-green">{app.matchScore}%</div>
                    <div className="text-[10px] font-mono text-gray-400 uppercase">Skills Match</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-neo-green" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-neo-green">Applied {formatDate(app.appliedAt)}</span>
                  </div>
                  <NeoBadge
                    variant={app.status === 'Applied' ? 'default' : app.status === 'Reject' ? 'red' : 'green'}
                    className="text-[10px] py-0 px-2 h-5"
                  >
                    {app.status}
                  </NeoBadge>
                </div>
              </div>
            ))
          )}
        </div>
      </NeoCard >
    </div >
  );
}
