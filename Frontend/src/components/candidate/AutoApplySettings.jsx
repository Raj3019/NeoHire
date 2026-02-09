'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { autoApplyAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { NeoCard, NeoButton, NeoBadge, NeoModal } from '@/components/ui/neo';
import { Zap, CheckCircle2, AlertCircle, Clock, MapPin, Building2, ChevronRight, Info, AlertTriangle, X, Crown, Sparkles } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AutoApplySettings() {
  const { user } = useAuthStore();
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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

  const hasAccess = true; // FEATURE UNLOCKED: Plan check bypassed for testing/early access

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
                <Zap className="w-5 h-5 text-amber-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black uppercase dark:text-white">Smart Auto-Apply</h3>
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 font-bold uppercase tracking-widest">AI Agent Active</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md font-medium">
              Let our AI automatically apply for jobs that match your skills (<span className="text-amber-600 dark:text-amber-400 font-bold">80%+ match</span> required).
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-3">
            <button
              onClick={handleToggle}
              disabled={isToggling || !requirementsMet}
              className={`
                relative w-16 h-8 rounded-full border-2 border-black transition-all duration-300 shadow-neo-sm
                ${status?.enabled ? 'bg-neo-green' : 'bg-gray-200 dark:bg-zinc-800'}
                ${!requirementsMet || isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
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
      <NeoCard className="border-4 bg-white dark:bg-zinc-900/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-neo-blue" />
            <h3 className="text-lg font-black uppercase dark:text-white">Recent Activity</h3>
          </div>
          {history.length > 0 && (
            <NeoButton
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(true)}
              className="text-[10px] h-8 border-2"
            >
              VIEW ALL ({history.length})
            </NeoButton>
          )}
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-lg">
              <div className="w-10 h-10 bg-gray-50 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-2 border-2 border-neo-black/10 dark:border-white/10">
                <Building2 className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-gray-500 font-mono text-xs uppercase">No applications yet</p>
            </div>
          ) : (
            history.slice(0, 1).map((app) => (
              <div
                key={app.applicationId}
                className="group border-2 border-black dark:border-white p-4 bg-white dark:bg-zinc-800 shadow-neo-sm relative overflow-hidden"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="font-black text-neo-black dark:text-white group-hover:text-neo-blue transition-colors uppercase flex items-center gap-2 text-sm">
                      {app.jobTitle}
                      <span className="px-1.5 py-0.5 text-[8px] font-black bg-neo-pink text-white border border-black">LATEST</span>
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                      <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {app.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {app.location}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-black text-neo-green">{app.matchScore}%</div>
                    <div className="text-[8px] font-mono text-gray-400 uppercase">Match</div>
                  </div>
                </div>
              </div>
            ))
          )}
          {history.length > 1 && (
            <p className="text-[10px] text-center font-mono text-gray-400 uppercase tracking-wider">
              + {history.length - 1} more automated applications
            </p>
          )}
        </div>
      </NeoCard>

      {/* History Modal */}
      <NeoModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        title="ALL AUTO-APPLICATIONS"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4 py-2">
          {history.map((app) => (
            <div
              key={app.applicationId}
              className="border-2 border-neo-black dark:border-white p-4 bg-white dark:bg-zinc-900 shadow-neo-sm hover:-translate-y-1 transition-transform"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <h4 className="font-black text-neo-black dark:text-white uppercase text-base">
                    {app.jobTitle}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-gray-500 uppercase">
                    <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {app.company}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {app.location}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-neo-green">{app.matchScore}%</div>
                  <div className="text-[10px] font-mono text-gray-400 uppercase">AI Score</div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-neo-blue" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                    Applied {formatDate(app.appliedAt)}
                  </span>
                </div>
                <NeoBadge
                  variant={app.status === 'Applied' ? 'default' : app.status === 'Reject' ? 'red' : 'green'}
                  className="text-[10px] py-0.5 px-3 h-auto"
                >
                  {app.status}
                </NeoBadge>
              </div>
            </div>
          ))}
        </div>
      </NeoModal>
    </div>
  );
}
