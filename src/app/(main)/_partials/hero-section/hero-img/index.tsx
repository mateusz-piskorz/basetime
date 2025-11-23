'use client';
import React from 'react';
import { HeroImgItem } from './hero-img-item';

const arr = [
    {
        title: 'New Landing Page',
        initialSeconds: 48,
        type: 'Design',
    },
    {
        title: 'Competitor Analysis',
        initialSeconds: 135,
        type: 'Research',
    },
    {
        title: 'Authentication Module',
        initialSeconds: 8,
        type: 'Development',
    },
    {
        title: 'Backend API Refactor',
        initialSeconds: 254,
        type: 'Development',
    },
] as const;

export const HeroImg = () => {
    const [active, setActive] = React.useState('Backend API Refactor');
    return (
        <div className="relative hidden h-[472px] w-[600px] lg:block">
            <div className="border-accent dark:border-border absolute flex h-[472px] w-[600px] flex-col rounded-md border">
                {arr.map((args, index) => {
                    const last = index === arr.length - 1;
                    const isActive = args.title === active;
                    return (
                        <HeroImgItem
                            isActive={isActive}
                            toggleActive={(title) => {
                                if (active === title) {
                                    setActive('');
                                } else {
                                    setActive(title);
                                }
                            }}
                            className={last ? '' : 'border-accent dark:border-border border-b'}
                            key={args.title}
                            {...args}
                        />
                    );
                })}
            </div>
        </div>
    );
};
