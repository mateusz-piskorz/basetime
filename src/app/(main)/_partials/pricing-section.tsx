import { AuthButton } from '@/components/common/auth-button';
import { Check } from 'lucide-react';

export function PricingSection() {
    return (
        <div className="bg-background px-5 py-24 sm:px-6 md:px-8 lg:px-10 2xl:mx-auto 2xl:max-w-[1920px] 2xl:px-20 2xl:py-40" id="pricing-section">
            <div className="mx-auto">
                <div className="mx-auto max-w-2xl text-center 2xl:max-w-4xl">
                    <h2 className="text-3xl font-bold text-balance md:text-4xl lg:text-5xl 2xl:text-6xl">
                        Start with <span className="text-accent">time tracker </span> your team will actually use
                    </h2>
                </div>

                <div className="relative mx-auto mt-8 max-w-5xl rounded-3xl border md:mt-20 2xl:max-w-6xl 2xl:min-w-[1200px]">
                    <div className="flex flex-col items-center gap-12 divide-y p-12 md:flex-row md:divide-x md:divide-y-0">
                        <div className="pb-12 text-center md:pr-12 md:pb-0">
                            <h3 className="text-2xl font-semibold 2xl:text-4xl">Suite Enterprise</h3>
                            <p className="mt-2 text-lg 2xl:text-xl">For your company of any size</p>
                            <span className="mt-12 mb-6 inline-block text-6xl font-bold">
                                <span className="text-4xl">$</span>0
                            </span>

                            <div className="flex justify-center">
                                <AuthButton size="lg" variant="accent" text="Get started" />
                            </div>

                            <p className="text-muted-foreground mt-12 text-sm 2xl:text-base">
                                Includes : Security, Unlimited Storage, Payment, Search engine, and all features
                            </p>
                        </div>
                        <div className="relative">
                            <ul role="list" className="space-y-4">
                                {[
                                    'First premium advantage',
                                    'Second advantage weekly',
                                    'Third advantage donate to project',
                                    'Fourth, access to all components weekly',
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-2 font-mono 2xl:text-base">
                                        <Check className="size-3" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <p className="text-muted-foreground mt-6 text-sm 2xl:text-base">
                                Team can be any size, and you can add or switch members as needed. Companies using our platform include:
                            </p>
                            <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
                                <img
                                    className="h-5 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/nvidia.svg"
                                    alt="Nvidia Logo"
                                    height="20"
                                    width="auto"
                                />
                                <img
                                    className="h-4 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/column.svg"
                                    alt="Column Logo"
                                    height="16"
                                    width="auto"
                                />
                                <img
                                    className="h-4 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/github.svg"
                                    alt="GitHub Logo"
                                    height="16"
                                    width="auto"
                                />
                                <img
                                    className="h-5 w-fit dark:invert"
                                    src="https://html.tailus.io/blocks/customers/nike.svg"
                                    alt="Nike Logo"
                                    height="20"
                                    width="auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
