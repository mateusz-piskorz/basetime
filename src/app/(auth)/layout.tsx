import { AppLogo } from '@/components/common/app-logo';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Auth',
    description: 'Auth description',
};

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <a href="#main-content" className="absolute z-10 w-0 overflow-hidden focus:w-fit">
                Skip to main content
            </a>
            <div className="relative grid h-dvh flex-col items-center justify-center px-8 sm:px-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
                <div className="bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r">
                    <div className="absolute inset-0 bg-zinc-900" />
                    <Link href="/" className="relative z-20 flex items-center justify-between text-lg font-medium">
                        <div className="flex items-center">
                            <AppLogo className="mr-2 size-8 fill-current text-white" />
                        </div>
                        Base Time
                    </Link>

                    <div className="relative z-20 mt-auto">
                        <blockquote className="space-y-2">
                            <p className="font-mono text-lg">&ldquo;The bad news is time flies. The good news is you’re the pilot.&rdquo;</p>
                            <footer className="font-mono text-sm text-neutral-300">Michael Altshuler</footer>
                        </blockquote>
                    </div>
                </div>
                <div className="w-full lg:p-8">
                    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                        <Link href={'/'} className="relative z-20 flex items-center justify-center lg:hidden">
                            <AppLogo className="size-10 fill-current text-black" />
                        </Link>
                        <main id="main-content">{children}</main>
                    </div>
                </div>
            </div>
        </>
    );
}
