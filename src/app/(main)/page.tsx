'use server';

import { AboutSection } from './_partials/about-section';
import { BlogSection } from './_partials/blog-section';
import { FAQSection } from './_partials/FAQ-section';
import { FeatShowcase } from './_partials/feat-showcase';
import { HeroSection } from './_partials/hero-section';
import { PricingSection } from './_partials/pricing-section';

export default async function Home() {
    return (
        <>
            <HeroSection />
            <FeatShowcase />
            <AboutSection />
            <BlogSection />
            <FAQSection />
            <PricingSection />
        </>
    );
}
