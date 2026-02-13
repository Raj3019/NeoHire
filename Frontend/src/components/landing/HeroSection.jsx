'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { NeoBadge } from '@/components/ui/neo';

const candidateTaglines = [
  "The ATS system hates you. We teach you how to fight back.",
  "Optimize your resume. Beat the system. Secure the bag.",
  "Wake up to interview invites, not rejection emails.",
];

const recruiterTaglines = [
  "Stop sorting through thousands of irrelevant resumes.",
  "Our AI ranks candidates by relevance, skill, and reliability.",
  "Close roles 10x faster with AI-powered hiring.",
];

const wordVariants = {
  hidden: { opacity: 0, y: 30, rotateX: -40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' },
  }),
};

const HeroSection = ({ isRecruiterMode }) => {
  const router = useRouter();
  const [taglineIndex, setTaglineIndex] = useState(0);
  const taglines = isRecruiterMode ? recruiterTaglines : candidateTaglines;

  useEffect(() => {
    const interval = setInterval(() => {
      setTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [taglines.length]);

  const headlineWords = isRecruiterMode
    ? [
        { text: 'HIRE', className: 'text-neo-orange' },
        { text: 'THE', className: '' },
        { text: 'BEST', className: '' },
        { text: 'TALENT.', className: '' },
      ]
    : [
        { text: 'STOP', className: 'text-neo-blue' },
        { text: 'BEING', className: '' },
        { text: 'GHOSTED.', className: 'text-neo-yellow' },
      ];

  const handleToggle = useCallback(() => {
    router.push(isRecruiterMode ? '/' : '/?mode=recruiter');
  }, [isRecruiterMode, router]);

  return (
    <section
      id="home"
      className={`relative min-h-[85vh] flex items-center py-16 lg:py-20 px-4 border-b-4 border-neo-black dark:border-white overflow-hidden ${
        isRecruiterMode ? 'bg-neo-orange/10 dark:bg-neo-orange/20' : 'bg-neo-blue/10 dark:bg-neo-blue/20'
      }`}
    >
      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      {/* Subtle decorative shapes — positioned far from content to avoid overlap */}
      <div className={`hidden lg:block absolute top-10 right-[3%] w-12 h-12 border-4 border-neo-black/20 dark:border-white/20 shadow-neo-sm animate-float opacity-40 ${isRecruiterMode ? 'bg-neo-orange/30' : 'bg-neo-blue/30'}`} />
      <div className={`hidden lg:block absolute bottom-10 left-[3%] w-10 h-10 border-4 border-neo-black/20 dark:border-white/20 shadow-neo-sm animate-float-reverse opacity-40 ${isRecruiterMode ? 'bg-neo-pink/30' : 'bg-neo-yellow/30'}`} />

      <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center w-full">
        {/* Left: Content */}
        <div className="flex flex-col items-start text-left">
          {/* Portal toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-6 cursor-pointer"
            onClick={handleToggle}
          >
            <NeoBadge variant={isRecruiterMode ? 'pink' : 'green'}>
              <span className="text-sm px-2 font-black">
                {isRecruiterMode ? '⚠ RECRUITER PORTAL' : '★ CANDIDATE PORTAL'}
              </span>
            </NeoBadge>
            <p className="text-[10px] font-bold mt-1 uppercase text-gray-500 tracking-wider">
              Click to switch to {isRecruiterMode ? 'candidate' : 'recruiter'} mode
            </p>
          </motion.div>

          {/* Headline with staggered word reveal */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-neo-black dark:text-white leading-[0.9] mb-6">
            {headlineWords.map((word, i) => (
              <motion.span
                key={`${word.text}-${isRecruiterMode}`}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={wordVariants}
                className={`inline-block mr-4 ${word.className}`}
              >
                {word.text}
              </motion.span>
            ))}
          </h1>

          {/* Rotating tagline */}
          <div className="relative mb-8 w-full max-w-xl">
            <div className="bg-white dark:bg-zinc-800 p-4 md:p-5 border-4 border-neo-black dark:border-white shadow-neo-md dark:shadow-[6px_6px_0px_0px_#ffffff] transform rotate-1">
              <p className="text-sm md:text-lg font-mono font-bold text-neo-black dark:text-white leading-snug">
                {taglines[taglineIndex]}
                <span className="inline-block w-0.5 h-5 bg-neo-black dark:bg-white ml-1 align-middle animate-blink" />
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <button
              onClick={() => router.push(`/register${isRecruiterMode ? '?mode=recruiter' : ''}`)}
              className={`group relative px-6 py-3.5 text-white font-black text-lg border-4 border-neo-black dark:border-white shadow-neo-md dark:shadow-[6px_6px_0px_0px_#ffffff] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all ${
                isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-black dark:bg-zinc-800'
              }`}
            >
              {isRecruiterMode ? 'START HIRING' : 'LAUNCH CAREER'}
            </button>
            <button
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3.5 bg-white dark:bg-zinc-900 text-neo-black dark:text-white font-black text-lg border-4 border-neo-black dark:border-white shadow-neo-md dark:shadow-[6px_6px_0px_0px_#ffffff] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              HOW IT WORKS
            </button>
          </div>
        </div>

        {/* Right: Product preview mockup */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="hidden lg:block"
        >
          <div className="relative">
            {/* Browser frame */}
            <div className="bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white shadow-neo-xl dark:shadow-[12px_12px_0px_0px_#ffffff] overflow-hidden">
              {/* Browser top bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-neo-black dark:bg-zinc-900 border-b-4 border-neo-black dark:border-white">
                <div className="w-3 h-3 rounded-full bg-neo-red border-2 border-white/30" />
                <div className="w-3 h-3 rounded-full bg-neo-yellow border-2 border-white/30" />
                <div className="w-3 h-3 rounded-full bg-neo-green border-2 border-white/30" />
                <div className="flex-1 mx-4 bg-zinc-700 rounded-sm px-3 py-1">
                  <span className="text-xs font-mono text-gray-400">neohire.ai/dashboard</span>
                </div>
              </div>

              {/* Mock dashboard content */}
              <div className="p-5 space-y-3">
                {isRecruiterMode ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-lg uppercase dark:text-white">Talent Pipeline</span>
                      <span className="bg-neo-orange text-white font-bold text-xs px-2 py-1 border-2 border-neo-black">LIVE</span>
                    </div>
                    {[
                      { name: 'Sarah Chen', score: 96, role: 'Senior React Dev', color: 'bg-neo-green' },
                      { name: 'Alex Rivera', score: 89, role: 'Full Stack Engineer', color: 'bg-neo-blue' },
                      { name: 'Jordan Lee', score: 74, role: 'Backend Developer', color: 'bg-neo-yellow' },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border-2 border-neo-black dark:border-white bg-neo-bg dark:bg-zinc-700">
                        <div className={`w-10 h-10 ${c.color} border-2 border-neo-black flex items-center justify-center font-black text-sm text-black`}>
                          {c.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm truncate dark:text-white">{c.name}</p>
                          <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{c.role}</p>
                        </div>
                        <div className={`font-black text-lg ${c.score >= 90 ? 'text-neo-green' : c.score >= 80 ? 'text-neo-blue' : 'text-neo-yellow'}`}>
                          {c.score}%
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-black text-lg uppercase dark:text-white">Your Matches</span>
                      <span className="bg-neo-green text-black font-bold text-xs px-2 py-1 border-2 border-neo-black">3 NEW</span>
                    </div>
                    {[
                      { title: 'Frontend Developer', company: 'TechCorp', match: 96, salary: '$120k' },
                      { title: 'React Engineer', company: 'StartupX', match: 91, salary: '$140k' },
                      { title: 'Full Stack Dev', company: 'BigCo', match: 85, salary: '$130k' },
                    ].map((j, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 border-2 border-neo-black dark:border-white bg-neo-bg dark:bg-zinc-700">
                        <div className="w-10 h-10 bg-neo-blue border-2 border-neo-black flex items-center justify-center font-black text-sm text-white">
                          {j.company[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm truncate dark:text-white">{j.title}</p>
                          <p className="font-mono text-xs text-gray-500 dark:text-gray-400">{j.company} · {j.salary}</p>
                        </div>
                        <div className={`font-black text-lg ${j.match >= 90 ? 'text-neo-green' : 'text-neo-blue'}`}>
                          {j.match}%
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {/* Fake loading bar */}
                <div className="h-2 bg-gray-200 dark:bg-zinc-600 border border-neo-black dark:border-white overflow-hidden">
                  <div className={`h-full w-3/4 ${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-blue'}`} />
                </div>
              </div>
            </div>

            {/* Floating badge on mockup */}
            <div className={`absolute -top-4 -right-4 ${isRecruiterMode ? 'bg-neo-pink' : 'bg-neo-yellow'} border-4 border-neo-black shadow-neo px-3 py-2 font-black text-sm uppercase text-black transform rotate-6`}>
              AI Powered ⚡
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
