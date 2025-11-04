import { cn } from '@/lib/utils/common';
import { CheckCircle, Crosshair, UserCheck2, Zap } from 'lucide-react';
import { DocCard } from './doc-card';
import { DashboardIllustration } from './illustrations/dashboard-illustration';
import { ProjectsManagementIllustration } from './illustrations/projects-management-illustration';
import { ReportsIllustration } from './illustrations/reports-illustration';
import { UserFriendlyIllustration } from './illustrations/user-friendly-illustration';

const arr = [
    {
        Illustration: DashboardIllustration,
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
        Illustration: ReportsIllustration,
        heading: 'Accurate Reports',
        Icon: Crosshair,
        description: 'Simple, modern, accurate, and user-friendly.Spend less time logging hours — and more time getting work done.',
        badges: ['Projects Filter', 'Members Filter', 'Period Filter', 'Billable Amount', 'Total Time'],
    },
    {
        Illustration: ProjectsManagementIllustration,
        heading: 'Simple Projects Management',
        Icon: CheckCircle,
        description: 'Simple, modern, accurate, and user-friendly.Spend less time logging hours — and more time getting work done.',
        badges: ['Projects Filter', 'Members Filter', 'Period Filter', 'Billable Amount', 'Total Time'],
    },
    {
        Illustration: UserFriendlyIllustration,
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
        <div className={cn('flex flex-col gap-24 sm:px-5 lg:px-0', className)}>
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
