'use client';
import React from 'react';
import { NeoCard, NeoBadge, NeoButton } from '@/components/ui/neo';
import { Play, Pause, Edit2, Trash2, Users, Target, Clock, Zap, Radio } from 'lucide-react';

export default function AlertCard({ alert, onEdit, onDelete, onToggle, onViewMatches }) {
  return (
    <NeoCard className="border-4 border-black dark:border-white relative overflow-hidden bg-white dark:bg-zinc-900 shadow-neo hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[12px_12px_0px_0px_rgba(255,255,255,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all group">
      {/* Background Subtle Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-neo-blue/5 -rotate-12 translate-x-8 -translate-y-8 pointer-events-none rounded-full blur-3xl group-hover:bg-neo-blue/10 transition-colors" />

      {/* Status Overlay if Paused */}
      {!alert.isActive && (
        <div className="absolute inset-0 bg-gray-100/40 dark:bg-black/40 z-10 pointer-events-none" />
      )}

      <div className="flex justify-between items-start mb-6 relative z-20">
        <div className="flex gap-2">
          {!alert.isActive ? (
            <NeoBadge variant="secondary" className="bg-gray-100 dark:bg-zinc-800 text-gray-400 flex items-center gap-1 border-2 border-gray-200 dark:border-zinc-700 font-mono text-[10px]">
              <Pause className="w-3 h-3" /> PAUSED
            </NeoBadge>
          ) : (
            <NeoBadge variant="green" className="bg-neo-green/10 text-neo-green flex items-center gap-1 border-2 border-neo-green font-mono text-[10px]">
              <Zap className="w-3 h-3 animate-pulse" /> LIVE SCAN
            </NeoBadge>
          )}
        </div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button
            onClick={() => onEdit(alert)}
            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-800 border-2 border-black dark:border-white hover:bg-neo-blue hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(alert._id)}
            className="w-8 h-8 flex items-center justify-center bg-white dark:bg-zinc-800 border-2 border-black dark:border-white hover:bg-neo-red hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="mb-6 relative z-20">
        <h3 className="text-2xl font-black uppercase tracking-tight dark:text-white group-hover:text-neo-blue transition-colors truncate mb-1">
          {alert.name}
        </h3>
        <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-gray-50 dark:bg-zinc-800 border-2 border-gray-100 dark:border-zinc-700 text-[10px] font-mono font-bold text-gray-500 uppercase">
          <Radio className="w-3 h-3 text-neo-blue" />
          Checking Every 6h
        </div>
      </div>

      <div className="space-y-4 mb-8 h-32 overflow-hidden relative">
        <div>
          <div className="flex flex-wrap gap-2">
            {alert.requiredSkills?.map(skill => (
              <span key={skill} className="px-2 py-1 bg-white dark:bg-zinc-800 border-2 border-black dark:border-white text-[9px] font-black text-black dark:text-white uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-none">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-gray-100 dark:border-zinc-800">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">XP Required</span>
            <span className="font-black text-xl dark:text-white">{alert.minExperience}+ <span className="text-[10px] opacity-50">YRS</span></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Threshold</span>
            <span className="font-black text-xl text-neo-blue">{alert.minFitScore}%</span>
          </div>
        </div>

        {/* Fade Out Edge */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none" />
      </div>

      <div className="flex gap-3 relative z-20">
        <NeoButton
          onClick={() => onViewMatches(alert)}
          className="flex-[3] bg-neo-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100 shadow-neo-sm group-hover:shadow-neo transition-all"
        >
          <div className="flex items-center justify-between w-full px-1">
            <span className="text-xs">{alert.matchCount} TALENTS</span>
            <Users className="w-4 h-4" />
          </div>
        </NeoButton>
        <NeoButton
          variant="secondary"
          onClick={() => onToggle(alert._id)}
          className={`flex-1 border-2 ${alert.isActive ? 'hover:bg-neo-blue hover:text-white' : 'hover:bg-neo-green hover:text-white'}`}
        >
          {alert.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </NeoButton>
      </div>
    </NeoCard>
  );
}
