import { cn } from '@/lib/utils/common';
import { HeroSectionCards } from './_hero-section-cards';
import { HeroSectionImg } from './_hero-section-img';
import { HeroSectionText } from './_hero-section-text';

export const HeroSection = () => {
    return (
        <section
            className={cn(
                'bg-background relative space-y-24 overflow-hidden px-5 py-24',
                'sm:px-6',
                'md:px-8',
                'lg:space-y-28 lg:px-10 lg:py-28',
                '2xl:mx-auto 2xl:max-w-[1920px] 2xl:space-y-40 2xl:px-20 2xl:py-40',
            )}
        >
            <div className="flex items-center justify-between gap-40">
                <HeroSectionText />
                <HeroSectionImg />
            </div>
            <HeroSectionCards />
        </section>
    );
};
