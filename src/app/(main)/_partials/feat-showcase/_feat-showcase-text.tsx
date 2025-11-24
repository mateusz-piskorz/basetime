import { AuthButton } from '@/components/common/auth-button';

export const FeatShowcaseText = () => {
    return (
        <div className="px-5 text-center sm:px-6 md:px-8 lg:sticky lg:top-0 lg:w-[45%] lg:py-24 xl:px-12 2xl:py-40">
            <div className="mx-auto flex flex-col items-center gap-6 lg:items-start lg:text-start 2xl:max-w-[600px]">
                <h1 className="text-3xl leading-snug font-semibold sm:text-4xl 2xl:text-5xl">
                    <span className="text-accent">Time tracker</span> - your team will actually use
                </h1>
                <p className="text-muted-foreground text-base 2xl:text-base">
                    Modern, accurate, simple, and user-friendly. Spend less time logging hours — and more time getting work done.
                </p>
                <AuthButton text="Get Started" variant="default" size="lg" />
            </div>
        </div>
    );
};
