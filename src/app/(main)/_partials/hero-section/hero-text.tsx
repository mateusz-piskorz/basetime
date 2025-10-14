import { AuthButton } from '@/components/common/auth-button';
import { Badge } from '@/components/ui/badge';

export const HeroText = () => {
    return (
        <div className="flex flex-col items-center gap-6 text-center lg:ml-10 lg:min-w-[430px] lg:items-start lg:text-start xl:min-w-[570px] xl:gap-8 2xl:ml-20 2xl:min-w-[710px]">
            <Badge variant="outline">Open Beta</Badge>
            <h1 className="text-3xl leading-snug font-semibold sm:text-4xl lg:max-w-[430px] lg:text-4xl xl:max-w-[570px] xl:text-5xl 2xl:max-w-[710px] 2xl:text-6xl">
                <span className="text-accent">Time tracker</span> - your team will actually use
            </h1>
            <p className="text-muted-foreground font-mono text-base lg:max-w-[370px] xl:max-w-[500px] xl:text-lg 2xl:max-w-[640px] 2xl:text-2xl">
                Modern, accurate, simple, and user-friendly. Spend less time logging hours — and more time getting work done.
            </p>
            <AuthButton text="Get Started" variant="accent" size="lg" />
        </div>
    );
};
