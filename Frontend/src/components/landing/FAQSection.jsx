'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const candidateFAQs = [
  {
    q: 'How does Auto-Apply work?',
    a: 'Once you enable Auto-Apply and upload your resume, our system runs a CRON job that matches your profile against all active job postings. If your match score is 80% or higher, we automatically submit your application. You wake up to offers instead of filling out forms.',
  },
  {
    q: 'Is the Resume Roast really that brutal?',
    a: "Yes. Our AI persona — The Resume Butcher — doesn't hold back. It tears apart your resume line by line, pointing out clichés, missing keywords, formatting disasters, and vague claims. It's harsh, but every user who followed the feedback improved their interview rate significantly.",
  },
  {
    q: 'How is my resume scored against a job?',
    a: 'We use proprietary AI models to securely analyze your resume against the specific job description. Our private scoring system provides you with a match percentage and actionable feedback to help you stand out to recruiters.',

  },
  {
    q: 'Is it really free to use?',
    a: "Currently, all plans are 100% free to use while we're in beta. We will be introducing premium paid plans in the near future, but for now, you can enjoy all features including Auto-Apply and resume improvement tools at no cost.",
  },
  {
    q: 'How does Talent Radar help me get discovered?',
    a: "When you opt-in to Talent Radar, recruiters can set alerts for specific skill combinations. If your profile matches their criteria, they get notified automatically. It's like having a 24/7 agent promoting you to hiring managers.",
  },
  {
    q: 'What happens after I apply to a job?',
    a: "You'll get real-time notifications whenever there's an update on your application — whether it's viewed, shortlisted, or you get an interview invite. Track everything from your candidate dashboard.",
  },
];

const recruiterFAQs = [
  {
    q: 'How does AI scoring work for applicants?',
    a: "When a candidate applies, our proprietary AI analyzes their resume against your specific job description. It returns a match percentage, skill breakdown, and reliability indicators. You see ranked candidates instantly — no manual screening needed.",
  },
  {
    q: 'What is Talent Radar?',
    a: "Talent Radar lets you set alerts for specific skill combinations (e.g., 'React + TypeScript + 5 years'). Our system continuously scans opted-in candidate profiles and notifies you when a match is found — even if they haven't applied to your job.",
  },
  {
    q: 'Can I post unlimited jobs?',
    a: "Currently, job postings are completely free while we're in beta. We will be introducing tiered paid plans (Startup, Scale, and Empire) soon, but for now, you can post jobs and access all recruiter features at no cost.",

  },
  {
    q: 'How is candidate reliability scored?',
    a: 'Our AI evaluates multiple factors: resume consistency, skill verification through keyword analysis, experience timeline coherence, and profile completeness. This gives you a reliability indicator before you even start the interview process.',
  },
  {
    q: 'Do you have an API for integration?',
    a: "Not yet — but it's on our roadmap for the Empire plan. Currently, all features are accessible through the web dashboard with real-time notifications.",
  },
  {
    q: "What's the typical setup time?",
    a: 'Under 5 minutes. Create your account, post your first job with a description, and our AI starts scoring applicants immediately. Most recruiters have their first ranked candidate list within 24 hours.',
  },
];

const FAQSection = ({ isRecruiterMode }) => {
  const faqs = isRecruiterMode ? recruiterFAQs : candidateFAQs;
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section className="py-24 px-4 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <span className={`inline-block font-black uppercase text-xl px-6 py-3 border-4 border-neo-black dark:border-white shadow-neo dark:shadow-[4px_4px_0px_0px_#ffffff] mb-6 ${isRecruiterMode ? 'bg-neo-pink text-black' : 'bg-neo-yellow text-black'}`}>
          FAQ 💬
        </span>
        <h2 className="text-5xl md:text-7xl font-black uppercase leading-none dark:text-white">
          GOT <span className={`inline-block px-3 transform rotate-1 ${isRecruiterMode ? 'bg-neo-orange text-white' : 'bg-neo-blue text-white'}`}>QUESTIONS</span>?
        </h2>
      </motion.div>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <motion.div
            key={`${faq.q}-${isRecruiterMode}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            <div className="bg-white dark:bg-zinc-800 border-4 border-neo-black dark:border-white shadow-neo-sm dark:shadow-[2px_2px_0px_0px_#ffffff] overflow-hidden">
              {/* Question header */}
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-gray-50 dark:hover:bg-zinc-700/50 transition-colors"
              >
                <span className="font-black text-lg md:text-xl uppercase dark:text-white pr-4">
                  {faq.q}
                </span>
                <ChevronDown
                  className={`w-6 h-6 flex-shrink-0 dark:text-white transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''
                    }`}
                  strokeWidth={3}
                />
              </button>

              {/* Answer (accordion) */}
              <div className={`accordion-content ${openIndex === i ? 'open' : ''}`}>
                <div>
                  <div className="px-5 md:px-6 pb-5 md:pb-6 border-t-2 border-neo-black/10 dark:border-white/10 pt-4">
                    <p className="font-mono text-sm md:text-base font-bold text-gray-600 dark:text-gray-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
