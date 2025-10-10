'use client';

import { DocumentsSection } from './_partials/documents-section';
import { HeroSection } from './_partials/hero-section';

export default function Home() {
    return (
        <>
            <HeroSection />
            <DocumentsSection />
            <div className="bg-background h-[1200px] w-full">Here will be blog</div>
        </>
    );
}
