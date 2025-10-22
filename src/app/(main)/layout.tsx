import { Footer } from '@/layouts/main/footer';
import { Header } from '@/layouts/main/header/header';

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="bg-background mx-auto max-w-[1920px]">
            <a href="#main-content" className="absolute z-10 w-0 overflow-hidden focus:w-fit">
                Skip to main content
            </a>
            <Header />
            <main id="main-content">{children}</main>
            <Footer />
        </div>
    );
}
