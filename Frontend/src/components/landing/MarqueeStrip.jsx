'use client';
import React from 'react';
import { Zap, Target, Shield, Rocket, Star, TrendingUp } from 'lucide-react';

const iconMap = {
  candidate: [Star, Zap, Rocket],
  recruiter: [Target, Shield, TrendingUp],
};

const MarqueeStrip = ({ text, reverse = false, className = '', isRecruiterMode = false, slim = false }) => {
  const icons = isRecruiterMode ? iconMap.recruiter : iconMap.candidate;

  return (
    <div className={`overflow-hidden whitespace-nowrap ${slim ? 'py-2' : 'py-3'} border-y-4 border-neo-black dark:border-white ${className}`}>
      <div className={`inline-block ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'}`}>
        {[...Array(10)].map((_, i) => {
          const Icon = icons[i % icons.length];
          return (
            <span key={i} className={`${slim ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'} font-black uppercase mx-4 tracking-widest inline-flex items-center gap-3`}>
              <Icon className={`${slim ? 'w-4 h-4' : 'w-5 h-5'} inline-block`} strokeWidth={3} />
              {text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default MarqueeStrip;
