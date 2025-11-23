import { cn } from '@/lib/utils/common';
import { HeroCardList } from './hero-card-list';
import { HeroImg } from './hero-img';
import { HeroText } from './hero-text';

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
                <HeroText />
                <HeroImg />
            </div>
            <HeroCardList />
        </section>
    );
};
