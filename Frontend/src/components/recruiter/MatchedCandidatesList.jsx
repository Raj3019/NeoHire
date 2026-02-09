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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center p-5 bg-white dark:bg-zinc-900 border-4 border-neo-black dark:border-white shadow-neo relative">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-neo-yellow border-2 border-black flex items-center justify-center shadow-neo-sm">
            <Zap className="w-6 h-6 text-black fill-current" />
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase dark:text-white leading-none">
              Matches Found
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs font-bold bg-neo-black text-white px-2 py-0.5">
                {matches.length} DETECTED
              </span>
              <span className="font-mono text-xs font-bold text-neo-blue uppercase tracking-wider">
                FOR "{alertName}"
              </span>
            </div>
          </div>
        </div>

        <NeoButton
          variant="secondary"
          onClick={onClose}
          className="mt-4 md:mt-0 border-2 shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
        >
          <X className="w-5 h-5 mr-2" /> CLOSE RESULTS
        </NeoButton>
      </div>

      {/* Grid of Matches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
        {matches.map((match, index) => (
          <NeoCard
            key={match.employeeId || index}
            className="border-4 bg-white dark:bg-zinc-950 shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all duration-200 group flex flex-col pt-0 px-0 pb-0 overflow-hidden"
          >
            {/* Candidate Head */}
            <div className="p-5 border-b-4 border-black dark:border-white flex justify-between items-start gap-3 bg-gray-50 dark:bg-zinc-900/50">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-white border-2 border-black dark:border-white shadow-neo-sm flex items-center justify-center flex-shrink-0 group-hover:bg-neo-yellow transition-colors">
                  <span className="font-black text-3xl uppercase">{match.name?.charAt(0) || 'U'}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase leading-7 line-clamp-1 group-hover:text-neo-blue transition-colors">
                    {match.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-white border-2 border-black text-[10px] font-black uppercase">
                      {match.experience} YRS XP
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Stamp */}
              <div className="flex flex-col items-center">
                <div className="bg-neo-green text-white border-2 border-black px-2 py-1 shadow-neo-sm transform rotate-2 group-hover:rotate-0 transition-transform">
                  <span className="text-xl font-black leading-none">{match.fitScore}%</span>
                </div>
                <span className="text-[9px] font-black uppercase mt-1 tracking-widest opacity-50">FIT</span>
              </div>
            </div>

            {/* Skills Body */}
            <div className="p-5 flex-grow">
              <div className="mb-4">
                <div className="text-[10px] font-black uppercase text-gray-400 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-neo-blue border border-black"></span>
                  Top Signals Detected
                </div>
                <div className="flex flex-wrap gap-2">
                  {match.skills?.slice(0, 5).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-neo-blue/10 border-2 border-black dark:border-white text-[10px] font-black uppercase">
                      {skill}
                    </span>
                  ))}
                  {match.skills?.length > 5 && (
                    <span className="px-2 py-1 bg-gray-200 border-2 border-black text-[10px] font-black uppercase">
                      +{match.skills.length - 5}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div className="text-[10px] font-mono font-bold text-gray-500 uppercase">
                  Matched: {formatDate(match.matchedAt)}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 bg-white dark:bg-zinc-900 border-t-4 border-black dark:border-white flex gap-3">
              {match.resumeUrl ? (
                <a
                  href={match.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-neo-black text-white hover:bg-neo-blue dark:bg-white dark:text-black dark:hover:bg-neo-blue dark:hover:text-white border-2 border-transparent hover:border-black transition-all py-3 px-4 flex items-center justify-center gap-2 font-black uppercase text-xs tracking-wider shadow-neo-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                >
                  <FileText className="w-4 h-4" /> View Profile
                </a>
              ) : (
                <div className="flex-1 bg-gray-100 border-2 border-gray-300 text-gray-400 py-3 px-4 flex items-center justify-center font-black uppercase text-xs tracking-wider cursor-not-allowed">
                  Private
                </div>
              )}
            </div>
          </NeoCard>
        ))}
      </div>
    </div>
  );
}
