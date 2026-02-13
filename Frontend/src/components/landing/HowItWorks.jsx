'use client';
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserPlus, FileUp, Brain, PartyPopper, Building2, Radar, BarChart3, Handshake } from 'lucide-react';

const candidateSteps = [
  {
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your profile in 60 seconds',
    color: 'bg-neo-blue',
  },
  {
    icon: FileUp,
    title: 'Upload Resume',
    description: 'Drop your PDF, we handle the rest',
    color: 'bg-neo-yellow',
  },
  {
    icon: Brain,
    title: 'AI Matches You',
    description: 'Our AI scores you against every open role',
    color: 'bg-neo-green',
  },
  {
    icon: PartyPopper,
    title: 'Get Hired',
    description: 'Wake up to interview invites',
    color: 'bg-neo-pink',
  },
];

const recruiterSteps = [
  {
    icon: Building2,
    title: 'Post a Job',
    description: 'Describe your ideal candidate',
    color: 'bg-neo-orange',
  },
  {
    icon: Radar,
    title: 'Talent Radar',
    description: 'Set alerts, we find matches 24/7',
    color: 'bg-neo-pink',
  },
  {
    icon: BarChart3,
    title: 'AI Ranks Them',
    description: 'Instant scoring against your JD',
    color: 'bg-neo-yellow',
  },
  {
    icon: Handshake,
    title: 'Hire Fast',
    description: 'Close roles 10x faster',
    color: 'bg-neo-green',
  },
];

const HowItWorks = ({ isRecruiterMode }) => {
  const steps = isRecruiterMode ? recruiterSteps : candidateSteps;
  const gridRef = useRef(null);
  const isInView = useInView(gridRef, { once: true, margin: '-80px' });

  return (
    <section id="how-it-works" className="py-24 px-4 max-w-7xl mx-auto">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <span className={`inline-block font-black uppercase text-xl px-6 py-3 border-4 border-neo-black dark:border-white shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] mb-6 ${isRecruiterMode ? 'bg-neo-orange text-white' : 'bg-neo-blue text-white'}`}>
          How It Works
        </span>
        <h2 className="text-5xl md:text-7xl font-black uppercase leading-none dark:text-white">
          {isRecruiterMode ? 'FOUR STEPS TO' : 'FOUR STEPS TO'}
          <br />
          <span className={`inline-block px-4 transform -rotate-1 ${isRecruiterMode ? 'bg-neo-orange text-white' : 'bg-neo-yellow text-neo-black'}`}>
            {isRecruiterMode ? 'YOUR DREAM TEAM' : 'YOUR DREAM JOB'}
          </span>
        </h2>
      </motion.div>

      {/* Steps grid — all animations driven by single useInView */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
        {/* Connecting line — track fades in after cards start, colored fill draws after */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-1 bg-gray-200 dark:bg-zinc-700 z-0"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
            transition={{ duration: 1.0, delay: 1.0, ease: 'easeOut' }}
            className={`h-full origin-left ${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-blue'}`}
          />
        </motion.div>

        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={`${step.title}-${isRecruiterMode}`}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ delay: i * 0.18, duration: 0.5, ease: 'easeOut' }}
              className="relative z-10"
            >
              <div className="bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] p-6 text-center hover:-translate-y-2 transition-transform group">
                {/* Step number */}
                <div className={`absolute -top-4 -right-3 ${step.color} text-black font-black text-sm w-8 h-8 flex items-center justify-center border-2 border-neo-black dark:border-white`}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 ${step.color} border-4 border-neo-black dark:border-white shadow-neo-sm dark:shadow-[2px_2px_0px_0px_#ffffff] mx-auto mb-5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-black" strokeWidth={2.5} />
                </div>

                {/* Text */}
                <h3 className="text-xl font-black uppercase mb-2 dark:text-white">{step.title}</h3>
                <p className="font-mono text-sm font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default HowItWorks;
