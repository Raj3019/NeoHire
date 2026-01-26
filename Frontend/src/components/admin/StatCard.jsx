'use client';
import React from 'react';
import { NeoCard } from '@/components/ui/neo';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export default function StatCard({ title, value, icon: Icon, color = 'blue', trend, description }) {
  const colorMap = {
    blue: {
      bg: 'bg-neo-blue',
      shadow: 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
    },
    green: {
      bg: 'bg-neo-green',
      shadow: 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
    },
    yellow: {
      bg: 'bg-neo-yellow',
      shadow: 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
    },
    pink: {
      bg: 'bg-neo-pink',
      shadow: 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
    },
    red: {
      bg: 'bg-neo-red',
      shadow: 'shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
    },
  };

  const style = colorMap[color] || colorMap.blue;

  return (
    <div className="group relative h-full">
      <div className={cn(
        "absolute inset-0 border-2 border-neo-black dark:border-white transition-transform group-hover:translate-x-1 group-hover:translate-y-1",
        style.bg
      )}></div>
      
      <div className="relative h-full bg-white dark:bg-zinc-900 border-2 border-neo-black dark:border-white p-5 flex flex-col justify-between transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1 z-10 shadow-none">
        <div className="flex items-start justify-between mb-4">
           <div className={cn(
             "w-10 h-10 flex items-center justify-center border-2 border-neo-black shrink-0 shadow-[2px_2px_0px_0px_#000]",
             style.bg
           )}>
             <Icon className="w-5 h-5 text-neo-black stroke-[3]" />
           </div>
            {trend !== undefined && (
              <div className={cn(
                "px-2 py-1 border-2 border-neo-black font-black text-[11px] uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]",
                trend >= 0 ? "bg-neo-green text-neo-black" : "bg-neo-red text-white"
              )}>
                {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </div>
            )}
        </div>

        <div className="flex flex-col min-w-0">
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 mb-0.5 truncate">
            {title}
          </span>
          <div className="text-3xl font-black tracking-tighter text-neo-black dark:text-white leading-none mb-1">
            {value.toLocaleString()}
          </div>
          {description && (
             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight truncate">
               {description}
             </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { TrendingUp, TrendingDown } from 'lucide-react';
