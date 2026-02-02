'use client';
import React from 'react';
import { NeoCard, NeoBadge, NeoButton } from '@/components/ui/neo';
import { User, FileText, Calendar, Zap, Download, ExternalLink, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function MatchedCandidatesList({ matches, alertName, onClose }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="p-8 text-center border-4 border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <h3 className="text-xl font-bold dark:text-white uppercase mb-2">No Matches Yet</h3>
        <p className="text-gray-500 font-mono text-sm max-w-sm mx-auto">
          We haven't found any candidates matching this alert's criteria in our latest scan.
        </p>
        <NeoButton variant="secondary" onClick={onClose} className="mt-6">Back to Alerts</NeoButton>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b-4 border-black dark:border-white pb-4">
        <div>
          <h2 className="text-2xl font-black uppercase dark:text-white">
            Matches for <span className="text-neo-blue">"{alertName}"</span>
          </h2>
          <p className="font-mono text-xs text-gray-500 font-bold uppercase mt-1">
            Found {matches.length} hidden talents
          </p>
        </div>
        <NeoButton variant="secondary" onClick={onClose} size="sm">
          <X className="w-5 h-5" />
        </NeoButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((match, index) => (
          <NeoCard
            key={match.employeeId || index}
            className="border-4 hover:translate-x-1 hover:-translate-y-1 transition-all bg-white dark:bg-zinc-900 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neo-pink border-2 border-black dark:border-white flex items-center justify-center text-white font-black text-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {match.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h3 className="font-black text-lg dark:text-white group-hover:text-neo-blue transition-colors">
                    {match.name}
                  </h3>
                  <p className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    {match.experience} Years Experience
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-neo-green">{match.fitScore}%</div>
                <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">Match Score</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Top Skills</div>
              <div className="flex flex-wrap gap-2">
                {match.skills?.slice(0, 4).map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-gray-100 dark:bg-zinc-800 border border-black dark:border-white text-[10px] font-bold uppercase truncate max-w-[100px]">
                    {skill}
                  </span>
                ))}
                {match.skills?.length > 4 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold text-gray-400 uppercase">
                    +{match.skills.length - 4} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>Matched {formatDate(match.matchedAt)}</span>
              </div>

              <div className="flex gap-2">
                {match.resumeUrl && (
                  <a
                    href={match.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-neo-black text-white px-3 py-1.5 border-2 border-black text-xs font-black uppercase hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:border-white active:shadow-none active:translate-x-0.5 active:translate-y-0.5 transition-all"
                  >
                    <Download className="w-3 h-3" />
                    Resume
                  </a>
                )}
              </div>
            </div>
          </NeoCard>
        ))}
      </div>
    </div>
  );
}
