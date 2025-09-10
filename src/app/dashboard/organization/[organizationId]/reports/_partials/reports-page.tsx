'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { MultiOptionsFilterState } from '@/components/common/multi-options-filter-state';

import { TimeEntryReportChart } from '@/components/common/time-entry-report-chart';
import { Card, CardContent } from '@/components/ui/card';
import { projectColor } from '@/lib/constants/project-color';
import { dayjs } from '@/lib/dayjs';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { formatMinutes, sumBillableAmount, sumTimeEntries } from '@/lib/utils/common';
import { timeEntrySegments } from '@/lib/utils/timeEntrySegments';
import { User2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PeriodDropdown } from './period-dropdown';

export const ReportsPage = () => {
    const { organizationId, member } = useMember();

    const [startDate, setStartDate] = useState(dayjs().startOf('week').toDate());
    const [endDate, setEndDate] = useState(dayjs().endOf('week').toDate());

    const [members, setMembers] = useState<string[]>([]);
    const [projects, setProjects] = useState<string[]>([]);

    const { data: membersData } = trpc.getMembers.useQuery({ organizationId });
    const { data: projectsData } = trpc.getProjects.useQuery({ organizationId });

    const { data: timeEntriesData } = trpc.getTimeEntries.useQuery({
        organizationId,
        projectIds: projects,
        memberIds: members,
        startDate: startDate.toString(),
        endDate: endDate.toString(),
    });

    const segments = useMemo(() => {
        const rangeOfDays = dayjs(endDate).diff(dayjs(startDate), 'day');

        const granularity = rangeOfDays < 24 ? 'day' : rangeOfDays < 93 ? 'week' : 'month';

        return timeEntrySegments({
            timeEntries: timeEntriesData?.timeEntries || [],
            start: startDate,
            end: endDate,
            granularity,
        });
    }, [timeEntriesData, startDate, endDate]);

    const totalMinutes = useMemo(() => sumTimeEntries(timeEntriesData?.timeEntries || []), [timeEntriesData]);
    const billableAmount = useMemo(
        () =>
            sumBillableAmount(
                timeEntriesData?.timeEntriesByMembers?.map((member) => ({
                    hourlyRate: member.hourlyRate || 0,
                    minutes: sumTimeEntries(member.TimeEntries),
                })) || [],
            ),
        [timeEntriesData],
    );

    return (
        <div className="space-y-8 py-8">
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 md:px-8">
                <DashboardHeading title="Reports" className="mb-0" />
            </div>
            <div className="space-y-4 px-4 md:px-8">
                <div className="flex flex-wrap justify-between">
                    <div className="space-y-4 space-x-4">
                        <MultiOptionsFilterState
                            options={(projectsData || []).map(({ id, name, color }) => ({
                                label: (
                                    <>
                                        <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: projectColor[color] }} />
                                        {name}
                                    </>
                                ),
                                value: id,
                            }))}
                            setValues={(val) => setProjects(val)}
                            values={projects}
                            title="Projects"
                        />
                        <MultiOptionsFilterState
                            options={(membersData || []).map(({ User, id }) => ({
                                label: `${User.name} ${member.id === id ? '(You)' : ''}`,
                                value: id,
                                icon: User2,
                            }))}
                            setValues={(val) => setMembers(val)}
                            values={members}
                            title="Members"
                        />
                    </div>
                    <PeriodDropdown startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
                </div>
                <TimeEntryReportChart data={segments} />
                <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
                    <Card className="min-w-[250px] py-4">
                        <CardContent>
                            <span className="text-muted-foreground block text-sm">Total Time</span>
                            <span className="font-mono">{formatMinutes(totalMinutes)}</span>
                        </CardContent>
                    </Card>
                    <Card className="min-w-[250px] py-4">
                        <CardContent>
                            <span className="text-muted-foreground block text-sm">Billable Amount</span>
                            <span className="font-mono">{billableAmount} PLN</span>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
