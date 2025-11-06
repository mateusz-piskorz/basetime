'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { MembersFilter } from '@/components/common/members-filter';
import { ProjectsFilter } from '@/components/common/projects-filter';
import { TimeEntryReportChart } from '@/components/common/time-entry-report-chart';
import { Card, CardContent } from '@/components/ui/card';
import { useDayjs } from '@/lib/hooks/use-dayjs';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { formatMinutes, sumBillableAmount, sumTimeEntries } from '@/lib/utils/common';
import { timeEntrySegments } from '@/lib/utils/timeEntrySegments';
import { useMemo, useState } from 'react';
import { PeriodDropdown } from './period-dropdown';

export const ReportsPage = () => {
    const { dayjs } = useDayjs();
    const { orgId, member, roundUpMinutesThreshold, roundUpSecondsThreshold } = useMember();

    const [startDate, setStartDate] = useState(dayjs().startOf('week').toDate());
    const [endDate, setEndDate] = useState(dayjs().endOf('week').toDate());

    const [members, setMembers] = useState<string[]>([]);
    const [projects, setProjects] = useState<string[]>([]);

    const { data: timeEntriesData } = trpc.timeEntriesPaginated.useQuery({
        orgId,
        projects,
        members,
        startDate: startDate.toString(),
        endDate: endDate.toString(),
    });

    const { data: timeEntriesByMember } = trpc.timeEntriesByMember.useQuery({
        orgId,
        projectIds: projects,
        members,
        startDate: startDate.toString(),
        endDate: endDate.toString(),
    });

    const { segments } = useMemo(() => {
        const rangeOfDays = dayjs(endDate).diff(dayjs(startDate), 'day');

        const granularity = rangeOfDays < 24 ? 'day' : rangeOfDays < 93 ? 'week' : 'month';

        return timeEntrySegments({
            timeEntries: timeEntriesData?.data || [],
            start: startDate,
            end: endDate,
            granularity,
            dayjs,
            roundUpSecondsThreshold,
        });
    }, [timeEntriesData, startDate, endDate, dayjs, roundUpSecondsThreshold]);

    const totalMinutes = useMemo(
        () => sumTimeEntries({ entries: timeEntriesData?.data || [], dayjs, roundUpSecondsThreshold }),
        [timeEntriesData, dayjs, roundUpSecondsThreshold],
    );
    const billableAmount = useMemo(
        () =>
            sumBillableAmount({
                roundUpMinutesThreshold,
                members:
                    timeEntriesByMember?.map((member) => ({
                        hourlyRate: member.hourlyRate || 0,
                        minutes: sumTimeEntries({ entries: member.TimeEntries, dayjs, roundUpSecondsThreshold }),
                    })) || [],
            }),
        [timeEntriesByMember, roundUpMinutesThreshold, dayjs, roundUpSecondsThreshold],
    );

    return (
        <div className="space-y-8 py-8">
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 md:px-8">
                <DashboardHeading title="Reports" className="mb-0" />
            </div>
            <div className="space-y-4 px-4 md:px-8">
                <div className="flex flex-wrap justify-between">
                    <div className="space-y-4 space-x-4">
                        <ProjectsFilter projects={projects} setProjects={setProjects} />
                        {['MANAGER', 'OWNER'].includes(member.role) && <MembersFilter members={members} setMembers={setMembers} />}
                    </div>
                    <PeriodDropdown startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate} />
                </div>
                <TimeEntryReportChart data={segments} className="h-[450px]" />
                <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
                    <Card className="bg-bg dark:bg-card min-w-[250px] border py-4 shadow-none">
                        <CardContent>
                            <span className="text-muted-foreground block text-sm">Total Time</span>
                            <span className="font-mono">{formatMinutes(totalMinutes)}</span>
                        </CardContent>
                    </Card>
                    <Card className="bg-bg dark:bg-card min-w-[250px] border py-4 shadow-none">
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
