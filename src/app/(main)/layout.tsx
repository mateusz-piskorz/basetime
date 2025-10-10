import { Footer } from '@/layouts/main/footer';
import { Header } from '@/layouts/main/header/header';

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            {children}
            <Footer />
        </>
    );
}
