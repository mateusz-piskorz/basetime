'use server';

import { BlogSection } from './_partials/blog-section';
import { DocumentsSection } from './_partials/documents-section';
import FAQSection from './_partials/FAQ-section';
import { HeroSection } from './_partials/hero-section';
import PricingSection from './_partials/pricing-section';
import { TeamImgContent } from './_partials/team-img-content';

export default async function Home() {
    return (
        <>
            <HeroSection />
            {/* refactor-23-11-2025 end */}
            <DocumentsSection />
            <TeamImgContent />
            <BlogSection />
            <FAQSection />
            <PricingSection />
        </>
    );
}
