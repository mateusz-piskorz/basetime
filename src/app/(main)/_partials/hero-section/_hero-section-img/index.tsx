'use client';
import React from 'react';
import { Item } from './_item';

const arr = [
    {
        title: 'New Landing Page',
        initSeconds: 48,
        typeName: 'Design',
        hexColor: '#449DD1',
    },
    {
        title: 'Competitor Analysis',
        initSeconds: 135,
        typeName: 'Research',
        hexColor: '#F49D37',
    },
    {
        title: 'Authentication Module',
        initSeconds: 8,
        typeName: 'Development',
        hexColor: '#94BAA7',
    },
    {
        title: 'Backend API Refactor',
        initSeconds: 254,
        typeName: 'Development',
        hexColor: '#94BAA7',
    },
];

export const HeroSectionImg = () => {
    const [active, setActive] = React.useState('Backend API Refactor');

    return (
        <div className="relative hidden h-[472px] w-[600px] lg:block">
            <div className="border-accent dark:border-border absolute flex h-[472px] w-[600px] flex-col rounded-md border">
                {arr.map((args, index) => {
                    const last = index === arr.length - 1;
                    const isActive = args.title === active;
                    return (
                        <Item
                            isActive={isActive}
                            toggleActive={(title) => setActive(active === title ? '' : title)}
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
