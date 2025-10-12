'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

export default function FAQSection() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'How long does shipping take?',
            answer: 'Standard shipping takes 3-5 business days, depending on your location. Express shipping options are available at checkout for 1-2 business day delivery.',
        },
        {
            id: 'item-2',
            question: 'What payment methods do you accept?',
            answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, and Google Pay. For enterprise customers, we also offer invoicing options.',
        },
        {
            id: 'item-3',
            question: 'Can I change or cancel my order?',
            answer: 'You can modify or cancel your order within 1 hour of placing it. After this window, please contact our customer support team who will assist you with any changes.',
        },
        {
            id: 'item-4',
            question: 'Do you ship internationally?',
            answer: "Yes, we ship to over 50 countries worldwide. International shipping typically takes 7-14 business days. Additional customs fees may apply depending on your country's import regulations.",
        },
        {
            id: 'item-5',
            question: 'What is your return policy?',
            answer: 'We offer a 30-day return policy for most items. Products must be in original condition with tags attached. Some specialty items may have different return terms, which will be noted on the product page.',
        },
    ];

    return (
        <section className="bg-background px-5 py-24 sm:px-6 md:px-8 lg:px-10 2xl:mx-auto 2xl:max-w-[1920px] 2xl:px-20 2xl:py-40">
            <div className="mx-auto">
                <div className="mx-auto max-w-xl text-center 2xl:max-w-[900px]">
                    <h2 className="text-3xl font-semibold text-balance md:text-4xl lg:text-5xl 2xl:text-6xl">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground mt-4 font-mono text-balance 2xl:text-xl">
                        Discover quick and comprehensive answers to common questions about our platform, services, and features.
                    </p>
                </div>

                <div className="mx-auto mt-12 max-w-xl 2xl:mt-20 2xl:max-w-[800px]">
                    <Accordion type="single" collapsible className="ring-muted w-full rounded-2xl border px-8 py-3 ring-4 dark:ring-0">
                        {faqItems.map((item) => (
                            <AccordionItem key={item.id} value={item.id} className="border-dashed font-mono">
                                <AccordionTrigger className="text-muted-foreground cursor-pointer text-base hover:no-underline 2xl:text-xl">
                                    {item.question}
                                </AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-base 2xl:text-xl">{item.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    <p className="text-muted-foreground mt-6 px-8">
                        Can&apos;t find what you&apos;re looking for? Contact our{' '}
                        <Link href="#" className="text-primary font-medium hover:underline">
                            customer support team
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
