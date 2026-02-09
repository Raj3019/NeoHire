'use client';
import React from 'react';
import { NeoCard, NeoBadge, NeoButton } from '@/components/ui/neo';
import { User, FileText, Calendar, Zap, Download, ExternalLink, X, Briefcase, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function MatchedCandidatesList({ matches, alertName, onClose }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="p-16 text-center border-4 border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-neo">
        <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-gray-200 dark:border-zinc-700">
          <User className="w-10 h-10 text-gray-300" />
        </div>
        <h3 className="text-2xl font-black dark:text-white uppercase mb-3">No Signals Detected</h3>
        <p className="text-gray-500 dark:text-gray-400 font-mono text-sm max-w-sm mx-auto mb-8 uppercase tracking-widest">
          We haven't found any candidates matching this alert's criteria in our latest scan.
        </p>
        <NeoButton onClick={onClose} className="px-10 bg-neo-blue text-white">Back to Radar</NeoButton>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white shadow-neo-sm relative overflow-hidden">
        {/* Subtle decorative element */}
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-neo-blue" />

        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 bg-neo-green animate-ping rounded-full" />
            <h2 className="text-2xl font-black uppercase dark:text-white leading-tight">
              Matches for <span className="text-neo-blue">"{alertName}"</span>
            </h2>
          </div>
          <p className="font-mono text-xs text-gray-400 font-bold uppercase tracking-wider">
            Detected {matches.length} profile signals in the global database
          </p>
        </div>

        <NeoButton variant="secondary" onClick={onClose} className="mt-4 md:mt-0 hover:bg-neo-red hover:text-white border-2">
          <X className="w-5 h-5 mr-2" /> Close Results
        </NeoButton>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        {matches.map((match, index) => (
          <NeoCard
            key={match.employeeId || index}
            className="border-4 bg-white dark:bg-zinc-950 shadow-neo-sm hover:shadow-neo hover:-translate-x-1 hover:-translate-y-1 transition-all group overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 p-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="relative">
                  <div className="w-20 h-20 bg-neo-pink border-4 border-neo-black dark:border-white flex items-center justify-center text-white font-black text-3xl shadow-neo-sm group-hover:scale-105 transition-transform">
                    {match.name?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-neo-blue border-2 border-black flex items-center justify-center shadow-sm text-white">
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                </div>

                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-black dark:text-white uppercase tracking-tight group-hover:text-neo-blue transition-colors">
                    {match.name}
                  </h3>
                  <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mt-2">
                    <span className="flex items-center gap-1.5 font-mono text-xs font-black text-gray-500 dark:text-gray-400 uppercase">
                      <Briefcase className="w-3.5 h-3.5" />
                      {match.experience} YRS XP
                    </span>
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                    <span className="flex items-center gap-1.5 font-mono text-xs font-black text-neo-blue uppercase">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(match.matchedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto p-4 bg-neo-green/10 border-4 border-neo-green/30 text-center sm:text-right shadow-inner">
                <div className="text-4xl font-black text-neo-green leading-none">{match.fitScore}%</div>
                <div className="text-[10px] font-black text-neo-green/60 uppercase tracking-widest mt-1">Match Fit</div>
              </div>
            </div>

            <div className="px-6 pb-6 pt-2">
              <div className="text-xs font-black text-gray-400 uppercase mb-3 tracking-widest flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-100 dark:bg-zinc-800" />
                Key Profile Signals
                <div className="flex-1 h-px bg-gray-100 dark:bg-zinc-800" />
              </div>
              <div className="flex flex-wrap gap-2">
                {match.skills?.slice(0, 6).map(skill => (
                  <span key={skill} className="px-3 py-1 bg-white dark:bg-zinc-800 border-2 border-neo-black dark:border-white text-[10px] font-black uppercase shadow-neo-sm group-hover:shadow-none transition-shadow">
                    {skill}
                  </span>
                ))}
                {match.skills?.length > 6 && (
                  <NeoBadge variant="secondary" className="text-[10px] uppercase font-black bg-gray-100 dark:bg-zinc-800">
                    +{match.skills.length - 6} more
                  </NeoBadge>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-zinc-900 border-t-4 border-neo-black dark:border-white p-4 flex gap-4">
              {match.resumeUrl ? (
                <a
                  href={match.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-3 bg-neo-blue text-white px-4 py-3 border-2 border-neo-black shadow-neo-sm hover:shadow-neo hover:-translate-y-0.5 active:translate-y-0 transition-all font-black uppercase text-xs"
                >
                  <FileText className="w-4 h-4" />
                  Request Full Profile
                </a>
              ) : (
                <div className="flex-1 text-center py-3 font-mono text-xs text-gray-400 uppercase font-bold italic">
                  Profile Details Private
                </div>
              )}

              <button className="p-3 bg-white dark:bg-zinc-800 border-2 border-neo-black dark:border-white shadow-neo-sm hover:bg-neo-blue hover:text-white transition-all text-black dark:text-white">
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </NeoCard>
        ))}
      </div>
    </div>
  );
}
