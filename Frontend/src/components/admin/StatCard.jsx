'use client';
import React from 'react';
import { NeoCard } from '@/components/ui/neo';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function StatCard({ title, value, subValue, icon: Icon, color = 'blue', trend, description }) {
  const colorMap = {
    blue: { bg: 'bg-neo-blue', shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' },
    green: { bg: 'bg-neo-green', shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' },
    yellow: { bg: 'bg-neo-yellow', shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' },
    pink: { bg: 'bg-neo-pink', shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' },
    red: { bg: 'bg-neo-red', shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' },
    purple: { bg: 'bg-purple-500', shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' },
    cyan: { bg: 'bg-cyan-400', shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' },
    orange: { bg: 'bg-neo-orange', shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' },
    indigo: { bg: 'bg-indigo-500', shadow: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' },
  };

  const style = colorMap[color] || colorMap.blue;
  const showBadge = subValue !== undefined || (description && description.startsWith('+'));
  const badgeText = subValue !== undefined ? subValue : (description ? description.split(' ')[0] : '');

  return (
    <div className="group relative h-full">
      {/* Decorative background border */}
      <div className={cn(
        "absolute inset-0 border-2 border-neo-black dark:border-white transition-transform group-hover:translate-x-1.5 group-hover:translate-y-1.5",
        style.bg
      )}></div>

      {/* Main card content */}
      <div className="relative h-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-4 md:p-5 flex flex-col transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 z-10 shadow-none">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border-2 border-neo-black shrink-0 shadow-[2px_2px_0px_0px_#000]",
            style.bg
          )}>
            <Icon className="w-5 h-5 text-neo-black stroke-[3]" />
          </div>

          {showBadge && (
            <div className={cn(
              "px-1.5 py-0.5 border-2 border-neo-black font-black text-[9px] md:text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
              (typeof badgeText === 'string' && badgeText.startsWith('+')) || trend > 0 ? "bg-neo-green text-neo-black" : "bg-neo-yellow text-neo-black"
            )}>
              {badgeText}
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <span className="font-mono text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </span>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-black tracking-tighter text-neo-black dark:text-white leading-none">
              {value?.toLocaleString() || 0}
            </span>
          </div>

          {description && (
            <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-tight mt-1.5 truncate">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { TrendingUp, TrendingDown } from 'lucide-react';
