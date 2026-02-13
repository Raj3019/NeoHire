'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { hasValidAuth } from '@/lib/utils';

import {
    HeroSection,
    MarqueeStrip,
    HowItWorks,
    FeaturesGrid,
    SocialProofCTA,
    Testimonials,
    BetaFreeBanner,
    FAQSection,
    BottomCTA,
} from '@/components/landing';

const Content = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isAuthenticated } = useAuthStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && isAuthenticated && user) {
            if (user.role?.toLowerCase() === 'recruiter') {
                router.push('/recruiter/dashboard');
            } else {
                router.push('/candidate/dashboard');
            }
        }
    }, [mounted, isAuthenticated, user, router]);

    const isRecruiterMode = searchParams.get('mode') === 'recruiter';

    // Hydration loading state
    if (!mounted) {
        return <div className="min-h-screen bg-neo-bg" />;
    }

    // Authenticated → redirect
    if (isAuthenticated && user) {
        return (
            <div className="min-h-screen bg-neo-bg flex items-center justify-center font-black text-2xl uppercase tracking-tighter">
                Redirecting to Dashboard...
            </div>
        );
    }

    // Auth cookie hint but store not loaded yet
    if (hasValidAuth()) {
        return (
            <div className="min-h-screen bg-neo-bg flex items-center justify-center font-black text-2xl uppercase tracking-tighter italic text-neo-blue">
                Restoring your session...
            </div>
        );
    }

    return (
        <div className="bg-neo-bg overflow-x-hidden transition-colors duration-200">
            {/* 1. Hero */}
            <HeroSection isRecruiterMode={isRecruiterMode} />

            {/* 2. Marquee separator */}
            <MarqueeStrip
                text={
                    isRecruiterMode
                        ? '✅ VERIFIED CANDIDATES ✅ INSTANT RANKING ✅ 10X FASTER HIRING ✅'
                        : '★ STOP SCROLLING ★ START EARNING ★ SECURE THE BAG ★'
                }
                isRecruiterMode={isRecruiterMode}
                className={isRecruiterMode ? 'bg-neo-black text-neo-orange' : 'bg-neo-blue text-white'}
            />

            {/* 3. How It Works (NEW) */}
            <HowItWorks isRecruiterMode={isRecruiterMode} />

            {/* 4. Features bento grid */}
            <FeaturesGrid isRecruiterMode={isRecruiterMode} />

            {/* 5. Social proof + CTA */}
            <SocialProofCTA isRecruiterMode={isRecruiterMode} />

            {/* 6. Testimonials carousel */}
            <Testimonials isRecruiterMode={isRecruiterMode} />

            {/* 7. Free during Beta banner */}
            <BetaFreeBanner isRecruiterMode={isRecruiterMode} />

            {/* 9. FAQ (NEW) */}
            <FAQSection isRecruiterMode={isRecruiterMode} />

            {/* 10. Bottom CTA + Marquee */}
            <BottomCTA isRecruiterMode={isRecruiterMode} />
        </div>
    );
};

export default function Home() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#f3f4f6] dark:bg-[#121212]" />}>
            <Content />
        </Suspense>
    );
}
