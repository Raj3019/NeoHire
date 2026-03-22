'use client';
import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * UsageLimitBanner - Shows remaining usage for a feature
 * 
 * @param {object} usage - { current, limit, remaining }
 * @param {string} label - e.g. "Job Posts", "Applications", "Resume Roasts", "Talent Radar Alerts"
 * @param {string} className - optional extra classes
 */
export default function UsageLimitBanner({ usage, label, className = '' }) {
  if (!usage) return null;

  const isUnlimited = usage.limit === 'Unlimited';
  const isAtLimit = !isUnlimited && usage.remaining === 0;

  const percentage = isUnlimited ? 0 : Math.min(100, (usage.current / usage.limit) * 100);

  return (
    <div className={`border-2 border-neo-black dark:border-white p-3 shadow-neo-sm ${isAtLimit ? 'bg-red-50 dark:bg-red-950/30 border-red-500' : 'bg-white dark:bg-zinc-900'} ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-xs font-black uppercase tracking-wider dark:text-white">
          {label}
        </span>
        <span className={`font-mono text-xs font-bold ${isAtLimit ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {isUnlimited ? (
            <>{usage.current} / Unlimited</>
          ) : (
            <>{usage.current} / {usage.limit}</>
          )}
        </span>
      </div>

      {!isUnlimited && (
        <div className="w-full h-2 bg-gray-200 dark:bg-zinc-700 border border-neo-black dark:border-white">
          <div
            className={`h-full transition-all duration-300 ${
              percentage >= 100 ? 'bg-red-500' : percentage >= 75 ? 'bg-neo-orange' : 'bg-neo-green'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {isAtLimit && (
        <div className="flex items-center gap-1.5 mt-2">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
          <span className="font-mono text-xs text-red-500 font-bold uppercase">
            Limit reached
          </span>
        </div>
      )}
    </div>
  );
}
