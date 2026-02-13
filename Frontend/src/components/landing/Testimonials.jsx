'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const candidateTestimonials = [
  {
    quote: "I was getting rejected by interns. Used NeoHire, fixed my resume keywords, and now I'm rejecting offers. Power move.",
    author: 'Marcus T.',
    role: 'HIRED @ TECHCORP',
    color: 'bg-neo-yellow',
    initials: 'MT',
  },
  {
    quote: "The resume scorer showed me exactly why I was getting rejected. Fixed my keywords, reached 98% match, and landed my dream job.",
    author: 'Sarah J.',
    role: 'SENIOR DEV',
    color: 'bg-neo-green',
    initials: 'SJ',
  },
  {
    quote: "Auto-apply changed my life. I set it up before bed and woke up to 3 interview invites. This is the future of job hunting.",
    author: 'Priya K.',
    role: 'DATA ENGINEER',
    color: 'bg-neo-blue',
    initials: 'PK',
  },
];

const recruiterTestimonials = [
  {
    quote: "I fired my external agency. This tool found me a Principal Engineer in 48 hours. It's actually insane.",
    author: 'Mike Ross',
    role: 'CTO @ GRIDLOCK',
    color: 'bg-neo-orange',
    initials: 'MR',
  },
  {
    quote: "The reliability score is scary accurate. Saved us from hiring a 'senior' dev who couldn't code. ROI is 100x.",
    author: 'Jessica Pearson',
    role: 'VP TALENT',
    color: 'bg-neo-pink',
    initials: 'JP',
  },
  {
    quote: "Talent Radar alerts found us a unicorn backend dev that wasn't even actively looking. Closed the offer in 5 days.",
    author: 'David Chen',
    role: 'HEAD OF ENG',
    color: 'bg-neo-yellow',
    initials: 'DC',
  },
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

const Testimonials = ({ isRecruiterMode }) => {
  const testimonials = isRecruiterMode ? recruiterTestimonials : candidateTestimonials;
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  // Auto advance every 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  // Reset carousel index when mode changes
  useEffect(() => {
    setCurrent(0);
    setDirection(1);
  }, [isRecruiterMode]);

  const t = testimonials[current];

  return (
    <section className="py-24 px-4 max-w-6xl mx-auto overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <span
          className={`text-black font-black px-6 py-3 border-4 border-neo-black dark:border-white shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] mb-6 inline-block uppercase text-xl ${
            isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-yellow'
          }`}
        >
          {isRecruiterMode ? 'Success Stories 🏆' : 'Receipts 🧾'}
        </span>
        <h2 className="text-5xl md:text-6xl font-black uppercase dark:text-white">REAL RESULTS</h2>
      </motion.div>

      {/* Carousel */}
      <div className="relative">
        {/* Card */}
        <div className="min-h-[320px] md:min-h-[280px] relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={`${current}-${isRecruiterMode}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full"
            >
              <div className={`bg-white dark:bg-zinc-800 p-8 md:p-12 border-4 border-neo-black dark:border-white shadow-neo-lg dark:shadow-[8px_8px_0px_0px_#ffffff] relative ${current % 2 === 0 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`}>
                {/* Quote mark */}
                <div className={`absolute -top-6 -left-4 ${t.color} border-4 border-neo-black dark:border-white p-3 shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] font-black text-4xl text-black`}>
                  "
                </div>

                <p className="text-xl md:text-2xl font-bold mb-8 font-mono leading-tight dark:text-white mt-4">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-4 border-t-4 border-neo-black dark:border-white pt-6">
                  {/* Avatar with initials */}
                  <div className={`w-14 h-14 ${t.color} border-4 border-neo-black flex items-center justify-center font-black text-lg text-black`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-black text-xl uppercase dark:text-white">{t.author}</p>
                    <p className={`font-mono text-sm font-bold ${isRecruiterMode ? 'bg-neo-orange text-white' : 'bg-neo-blue text-white'} inline-block px-2 py-0.5`}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={prev}
            className="w-12 h-12 bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white shadow-neo-sm dark:shadow-[2px_2px_0px_0px_#ffffff] flex items-center justify-center hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5 dark:text-white" strokeWidth={3} />
          </button>

          {/* Dots */}
          <div className="flex gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > current ? 1 : -1);
                  setCurrent(i);
                }}
                className={`w-3 h-3 border-2 border-neo-black dark:border-white transition-all ${
                  i === current
                    ? `${isRecruiterMode ? 'bg-neo-orange' : 'bg-neo-blue'} scale-125`
                    : 'bg-gray-300 dark:bg-zinc-600'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-12 h-12 bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white shadow-neo-sm dark:shadow-[2px_2px_0px_0px_#ffffff] flex items-center justify-center hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5 dark:text-white" strokeWidth={3} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
