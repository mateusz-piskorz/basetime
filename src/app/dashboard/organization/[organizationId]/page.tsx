import { SectionTimeTracker } from '@/components/common/section-time-tracker';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { ActivityGraph } from './_partials/activity-graph';
import { Last7Days } from './_partials/last-7-days';
import { MetricCards } from './_partials/metric-cards';
import { RecentTimeEntries } from './_partials/recent-time-entries';
import { ThisWeekChart } from './_partials/this-week-chart';

export default async function OrganizationPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }
    return (
        <div className="space-y-12 py-8">
            <SectionTimeTracker />

            <div className="px-4 md:px-6 lg:px-8">
                <div className="flex flex-col flex-wrap gap-x-6 gap-y-10 md:flex-row">
                    <RecentTimeEntries recentTimeEntries={[{ id: 'dwa', name: 'DW-32', projectColor: 'GRAY', projectName: 'Project 1' }]} />
                    <Last7Days />
                    <ActivityGraph />
                </div>
            </div>
            <div className="mt-16 flex flex-col gap-8 px-4 md:flex-row md:px-6 lg:px-8">
                <ThisWeekChart />
                <MetricCards />
            </div>
        </div>
    );
}
