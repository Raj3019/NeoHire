'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const candidateFeatures = [
  {
    num: '01',
    icon: '🤖',
    title: 'AI ROAST',
    tag: 'MOST POPULAR',
    description: 'Upload your resume and watch our AI tear it apart. It hurts, but it works. Fix the gaps, get the interview.',
    color: 'bg-neo-blue',
    accentBorder: 'border-neo-blue',
    large: true,
    highlight: 'Our brutally honest AI reviews your resume, highlights weaknesses, and gives you an action plan. Avg score improvement: +34%.',
  },
  {
    num: '02',
    icon: '⚡',
    title: 'AUTO-APPLY',
    description: "Don't type your name 500 times. Our bot fills out applications while you sleep. Wake up to offers.",
    color: 'bg-neo-yellow',
    accentBorder: 'border-neo-yellow',
    inverted: true,
  },
  {
    num: '03',
    icon: '🔮',
    title: 'RESUME SCORE',
    description: 'Score your resume against the job description. See exactly what\'s missing and fix it before you apply.',
    color: 'bg-neo-green',
    accentBorder: 'border-neo-green',
  },
  {
    num: '04',
    icon: '📡',
    title: 'TALENT RADAR',
    description: 'Get discovered by recruiters while you sleep. Opt-in and let opportunities come to you.',
    color: 'bg-neo-pink',
    accentBorder: 'border-neo-pink',
    wide: true,
  },
];

const recruiterFeatures = [
  {
    num: '01',
    icon: '🎯',
    title: 'PRECISION',
    tag: 'CORE FEATURE',
    description: 'Filter 1,000 applicants in 30 seconds. Our AI highlights the winners and hides the time-wasters.',
    color: 'bg-neo-orange',
    accentBorder: 'border-neo-orange',
    large: true,
    highlight: 'AI-powered candidate ranking scored against your exact JD requirements. Save 40+ hours per hire.',
  },
  {
    num: '02',
    icon: '⚡',
    title: 'SPEED',
    description: "Stop scheduling 'intro chats'. Get a reliability score and a technical breakdown before you even say hello.",
    color: 'bg-neo-black',
    accentBorder: 'border-neo-orange',
    inverted: true,
    invertedText: 'text-neo-orange',
  },
  {
    num: '03',
    icon: '🔮',
    title: 'AI SCORING',
    description: "Stop guessing. Get an instant match score for every applicant based on your specific JD requirements.",
    color: 'bg-neo-pink',
    accentBorder: 'border-neo-pink',
  },
  {
    num: '04',
    icon: '📊',
    title: 'SMART DASHBOARD',
    description: 'Real-time pipeline analytics at a glance. Track applications, interviews, and hires in one brutalist dashboard.',
    color: 'bg-neo-yellow',
    accentBorder: 'border-neo-yellow',
    wide: true,
  },
];

const FeaturesGrid = ({ isRecruiterMode }) => {
  const features = isRecruiterMode ? recruiterFeatures : candidateFeatures;

  return (
    <section id="features" className="py-24 px-4 max-w-7xl mx-auto">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-8"
      >
        <div>
          <h2 className="text-5xl md:text-7xl font-black uppercase leading-none dark:text-white">
            {isRecruiterMode ? 'THE TOOLKIT' : 'THE CHEAT'} <br />
            <span
              className={`px-4 inline-block transform -rotate-2 ${
                isRecruiterMode ? 'bg-neo-orange text-white' : 'bg-neo-green text-neo-black'
              }`}
            >
              {isRecruiterMode ? 'FOR PROS' : 'CODES'}
            </span>
          </h2>
          <p className="font-mono text-sm font-bold uppercase tracking-wider mt-4 text-gray-400 dark:text-gray-500">
            {isRecruiterMode ? '4 tools that change how you hire' : '4 unfair advantages. Use them all.'}
          </p>
        </div>
        <p className="text-xl font-mono max-w-md border-l-8 border-neo-black dark:border-white pl-6 font-bold dark:text-gray-300">
          {isRecruiterMode
            ? 'We stripped away the corporate HR fluff. This is a weapon for talent acquisition.'
            : 'Corporate hiring is a game. We give you the controller with cheat codes enabled.'}
        </p>
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
        {features.map((feature, i) => {
          const gridClass = feature.large
            ? 'lg:row-span-2'
            : feature.wide
            ? 'md:col-span-2 lg:col-span-2'
            : '';

          const isInverted = feature.inverted;
          const bgClass = isInverted
            ? `${feature.color} ${feature.invertedText || 'text-black'}`
            : 'bg-white dark:bg-zinc-800';

          return (
            <motion.div
              key={`${feature.title}-${isRecruiterMode}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.12, duration: 0.5, ease: 'easeOut' }}
              className={`group relative ${gridClass}`}
            >
              <div
                className={`h-full ${bgClass} border-4 border-neo-black dark:border-white shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] hover:shadow-neo-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden`}
              >
                {/* Colored accent bar at top */}
                <div className={`h-1.5 w-full ${feature.color} transition-all duration-300 group-hover:h-2`} />

                <div className="p-8">
                  {/* Number badge — colored */}
                  <div className={`absolute top-0 right-0 ${feature.color} text-black font-black px-3 py-1.5 border-l-4 border-b-4 border-neo-black dark:border-white text-sm`}>
                    {feature.num}
                  </div>

                  {/* Tag for featured cards */}
                  {feature.tag && (
                    <span className={`inline-block font-black text-xs uppercase px-3 py-1 mb-4 border-2 border-neo-black dark:border-white ${isInverted ? 'bg-white text-black' : `${feature.color} text-black`}`}>
                      {feature.tag}
                    </span>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-20 h-20 border-4 border-neo-black dark:border-white mb-6 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] flex items-center justify-center text-4xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 ${
                      isInverted ? 'bg-white' : feature.color
                    }`}
                  >
                    {feature.icon}
                  </div>

                  {/* Content */}
                  <h3 className={`text-3xl font-black mb-4 uppercase ${isInverted ? '' : 'dark:text-white'}`}>
                    {feature.title}
                  </h3>
                  <p className={`font-mono text-lg leading-relaxed font-bold ${isInverted ? 'opacity-90' : 'text-gray-600 dark:text-gray-300'}`}>
                    {feature.description}
                  </p>

                  {/* Highlight callout for large cards */}
                  {feature.large && feature.highlight && (
                    <div className={`mt-8 pl-4 border-l-4 ${feature.accentBorder} ${isInverted ? 'border-white' : ''}`}>
                      <p className={`font-mono text-sm font-bold leading-relaxed ${isInverted ? 'opacity-80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {feature.highlight}
                      </p>
                    </div>
                  )}

                  {/* Hover arrow indicator */}
                  <div className={`mt-6 flex items-center gap-2 font-black uppercase text-sm opacity-0 translate-x-[-8px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${isInverted ? '' : 'dark:text-white'}`}>
                    Learn more <ArrowRight className="w-4 h-4" strokeWidth={3} />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturesGrid;
