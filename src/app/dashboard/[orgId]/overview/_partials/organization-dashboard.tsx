'use client';

import { SectionTimeTracker } from '@/components/common/section-time-tracker';
import { useState } from 'react';
import { ActivityGraph } from './activity-graph';
import { Last7Days } from './last-7-days';
import { MetricCards } from './metric-cards';
import { RecentTimeEntries } from './recent-time-entries';
import { ThisWeekChart } from './this-week-chart';
import { Scope } from './types';

export const OrganizationDashboard = () => {
    const [scope, setScope] = useState<Scope>('member');

    return (
        <div className="space-y-16 py-8">
            <SectionTimeTracker />

            <div className="px-4 md:px-6 lg:px-8">
                <div className="flex flex-col flex-wrap gap-x-6 gap-y-10 md:flex-row">
                    <RecentTimeEntries scope={scope} />
                    <Last7Days scope={scope} />
                    <ActivityGraph scope={scope} />
                </div>
            </div>

            <div className="mt-20 flex flex-col gap-8 px-4 md:flex-row md:px-6 lg:px-8">
                <ThisWeekChart scope={scope} />
                <MetricCards scope={scope} setScope={setScope} />
            </div>
        </div>
    );
};
