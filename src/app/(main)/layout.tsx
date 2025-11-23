import { SkipToMainContent } from '@/components/common/skip-to-main-content';
import { Footer } from '@/layouts/main/footer';
import { Header } from '@/layouts/main/header/header';

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="bg-background mx-auto max-w-[1920px]">
            <SkipToMainContent />
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
        </div>
    );
}
