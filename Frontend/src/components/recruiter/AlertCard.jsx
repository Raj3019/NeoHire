'use client';
import React from 'react';
import { NeoCard, NeoBadge, NeoButton } from '@/components/ui/neo';
import { Play, Pause, Edit2, Trash2, Users, Target, Clock, Zap } from 'lucide-react';

export default function AlertCard({ alert, onEdit, onDelete, onToggle, onViewMatches }) {
  return (
    <NeoCard className="border-4 border-black dark:border-white relative overflow-hidden bg-white dark:bg-[#1E1E1E] shadow-neo hover:translate-x-1 hover:-translate-y-1 transition-all group">
      {/* Status Overlay if Paused */}
      {!alert.isActive && (
        <div className="absolute inset-0 bg-gray-100/40 dark:bg-black/40 z-10 pointer-events-none border-dashed border-gray-300 dark:border-zinc-800" />
      )}

      <div className="flex justify-between items-start mb-6 relative z-20">
        <div className="flex gap-3">
          {!alert.isActive ? (
            <NeoBadge variant="secondary" className="bg-gray-200 text-gray-500 flex items-center gap-1 border-2">
              <Pause className="w-3 h-3" /> PAUSED
            </NeoBadge>
          ) : (
            <NeoBadge variant="green" className="bg-neo-green text-white flex items-center gap-1 border-2">
              <Zap className="w-3 h-3 animate-pulse" /> SCANNING
            </NeoBadge>
          )}
          <NeoBadge variant="blue" className="bg-neo-blue text-white font-mono border-2">
            {alert.matchCount} MATCHES
          </NeoBadge>
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(alert)} className="p-2 bg-white border-2 border-black hover:bg-neo-yellow transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(alert._id)} className="p-2 bg-white border-2 border-black hover:bg-neo-red hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white group-hover:text-neo-blue transition-colors truncate">
          {alert.name}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-xs font-mono font-bold text-gray-400 uppercase">
          <Clock className="w-3 h-3" />
          System checking every 6 hours
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Target Filter</div>
          <div className="flex flex-wrap gap-2">
            {alert.requiredSkills?.map(skill => (
              <span key={skill} className="px-2 py-1 bg-neo-blue/5 border-2 border-neo-blue/20 text-[10px] font-black text-neo-blue uppercase">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-gray-100 dark:border-zinc-800">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min. Experience</span>
            <span className="font-black text-xl dark:text-white">{alert.minExperience}+ <span className="text-xs">YRS</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Min. Fit Score</span>
            <span className="font-black text-xl text-neo-green">{alert.minFitScore}%</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <NeoButton
          onClick={() => onViewMatches(alert)}
          className="flex-1 bg-neo-black text-white hover:bg-gray-800 border-2 dark:border-white"
        >
          <Users className="w-4 h-4 mr-2" /> View Talents
        </NeoButton>
        <NeoButton
          variant="secondary"
          onClick={() => onToggle(alert._id)}
          className={`px-4 border-2 ${alert.isActive ? 'hover:bg-neo-yellow' : 'hover:bg-neo-green hover:text-white'}`}
        >
          {alert.isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </NeoButton>
      </div>
    </NeoCard>
  );
}
