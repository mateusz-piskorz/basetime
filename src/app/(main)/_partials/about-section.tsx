import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const AboutSection = () => {
    return (
        <section className="bg-background px-5 py-24 sm:px-6 md:px-8 lg:px-10 2xl:mx-auto 2xl:max-w-[1920px] 2xl:px-20 2xl:py-40" id="about-section">
            <div className="mx-auto space-y-8 md:space-y-12">
                <div className="bg-card aspect-video w-full">
                    <img className="rounded dark:opacity-90" src="/team-img-content-photo.jpeg" alt="team image" loading="lazy" />
                </div>

                <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                    <h2 className="text-3xl font-semibold 2xl:text-6xl">The Lyra ecosystem brings together our models, products and platforms.</h2>
                    <div className="text-muted-foreground space-y-6">
                        <p className="2xl:text-xl">
                            Lyra is evolving to be more than just the models. It supports an entire ecosystem — from products to the APIs and
                            platforms helping developers and businesses innovate.
                        </p>

                        <p className="2xl:text-xl">
                            Lyra. It supports an entire ecosystem — from products innovate. Sit minus, quod debitis autem quia aspernatur delectus
                            impedit modi, neque non id ad dignissimos? Saepe deleniti perferendis beatae.
                        </p>

                        <Button asChild size="default" className="gap-1 px-6">
                            <Link href="#">
                                <span>Learn More</span>
                                <ChevronRight className="size-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
