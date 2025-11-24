import { cn } from '@/lib/utils/common';
import { CheckCircle, Crosshair, UserCheck2, Zap } from 'lucide-react';
import { DashboardIllustration } from '../_illustrations/dashboard-illustration';
import { ProjectsManagementIllustration } from '../_illustrations/projects-management-illustration';
import { ReportsIllustration } from '../_illustrations/reports-illustration';
import { UserFriendlyIllustration } from '../_illustrations/user-friendly-illustration';
import { Item } from './_item';

const arr = [
    {
        Illustration: DashboardIllustration,
        heading: 'Modern Dashboard',
        Icon: Zap,
        description:
            'Get real-time insights and a comprehensive overview of your key metrics with our sleek and intuitive dashboard. Easily monitor performance and make informed decisions with up-to-date data at your fingertips.',
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
        description:
            'Generate precise and detailed reports in just seconds. Our advanced reporting tools ensure you always have reliable information, enabling you to track progress and share results with confidence.',
        badges: ['Projects Filter', 'Members Filter', 'Period Filter', '2 Years History', 'Billable Amount', 'Total Time'],
    },
    {
        Illustration: ProjectsManagementIllustration,
        heading: 'Simple Projects Management',
        Icon: CheckCircle,
        description:
            'Streamline your workflows with easy-to-use project management features. Organize tasks, set priorities, and collaborate seamlessly to keep your team on track and deliver successful outcomes.',
        badges: [
            'Task Lists',
            'Kanban Boards',
            'Milestone Tracking',
            'Due Dates',
            'Priority Labels',
            'Team Collaboration',
            'Progress Overview',
            'Easy Assignments',
        ],
    },
    {
        Illustration: UserFriendlyIllustration,
        heading: 'User Friendly UI',
        Icon: UserCheck2,
        description:
            'Enjoy a clean, intuitive interface designed for efficiency and ease of use. Navigate effortlessly and accomplish more with a layout that puts what you need right where you expect it.',
        badges: [
            'One-Click Actions',
            'Responsive Design',
            'Dark Mode',
            'Keyboard Shortcuts',
            'Quick Navigation',
            'Human Readable Time Input',
            'Tooltips & Hints',
            'Customizable Views',
        ],
    },
];

export const FeatShowcaseList = () => {
    return (
        <div className="flex flex-col gap-24 sm:px-5 lg:w-[55%] lg:px-0">
            {arr.map((args, index) => {
                const first = index === 0;
                const last = index === arr.length - 1;
                return (
                    <Item
                        className={cn(first && 'lg:rounded-t-none lg:pt-24 2xl:pt-40', last && 'lg:rounded-b-none lg:pb-24 2xl:pb-40')}
                        key={args.heading}
                        {...args}
                    />
                );
            })}
        </div>
    );
};
