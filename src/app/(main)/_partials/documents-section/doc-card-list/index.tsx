import { cn } from '@/lib/utils/common';
import { CheckCircle, Crosshair, UserCheck2, Zap } from 'lucide-react';
import { DocCard } from './doc-card';

const arr = [
    {
        imgDarkSrc: '/docs/dashboard-dark.png',
        imgLightSrc: '/docs/dashboard-light.png',
        heading: 'Modern Dashboard',
        Icon: Zap,
        description: 'Simple, modern, accurate, and user-friendly.Spend less time logging hours — and more time getting work done.',
        badges: [
            'Live Time Tracker',
            'Recent Time Entries',
            'This Week Chart',
            'Organization Scope',
            'Last 7 Days',
            'Activity Graph',
            'Total Time',
            'Billable Amount',
        ],
    },
    {
        imgDarkSrc: '/docs/reports-dark.png',
        imgLightSrc: '/docs/reports-light.png',
        heading: 'Accurate Reports',
        Icon: Crosshair,
        description: 'Simple, modern, accurate, and user-friendly.Spend less time logging hours — and more time getting work done.',
        badges: ['Projects Filter', 'Members Filter', 'Period Filter', 'Billable Amount', 'Total Time'],
    },
    {
        imgDarkSrc: '/docs/projects-dark.png',
        imgLightSrc: '/docs/projects-light.png',
        heading: 'Simple Projects Management',
        Icon: CheckCircle,
        description: 'Simple, modern, accurate, and user-friendly.Spend less time logging hours — and more time getting work done.',
        badges: ['Projects Filter', 'Members Filter', 'Period Filter', 'Billable Amount', 'Total Time'],
    },
    {
        imgDarkSrc: '/docs/create-time-entry-dark.png',
        imgLightSrc: '/docs/create-time-entry-light.png',
        heading: 'User Friendly UI',
        Icon: UserCheck2,
        description: 'Simple, modern, accurate, and user-friendly.Spend less time logging hours — and more time getting work done.',
        badges: ['Projects Filter', 'Members Filter', 'Period Filter', 'Billable Amount', 'Total Time'],
    },
];

type Props = {
    className?: string;
};

export const DocCardList = ({ className }: Props) => {
    return (
        <div className={cn('flex flex-col gap-10 sm:px-5 lg:px-0', className)}>
            {arr.map((args, index) => {
                const first = index === 0;
                const last = index === arr.length - 1;
                return (
                    <DocCard
                        className={cn(first && 'lg:rounded-t-none lg:pt-24 2xl:pt-40', last && 'lg:rounded-b-none lg:pb-24 2xl:pb-40')}
                        key={args.heading}
                        {...args}
                    />
                );
            })}
        </div>
    );
};
