'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useDayjs } from '@/lib/hooks/use-dayjs';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { formatMinutes, sumBillableAmount, sumTimeEntries } from '@/lib/utils/common';
import { useMemo } from 'react';
import { Scope } from './types';

type Props = {
    scope: Scope;
    setScope: (val: Scope) => void;
};

export const MetricCards = ({ scope, setScope }: Props) => {
    const { dayjs } = useDayjs();
    const { member, organizationId, roundUpMinutesThreshold } = useMember();

    const { data } = trpc.getTimeEntries.useQuery({
        organizationId,
        ...(scope === 'member' && { memberIds: [member.id] }),
        startDate: dayjs().startOf('week').toDate().toString(),
        endDate: dayjs().endOf('week').toDate().toString(),
    });

    const totalMinutes = useMemo(() => sumTimeEntries({ entries: data?.timeEntries || [], dayjs }), [data, dayjs]);
    const billableAmount = useMemo(
        () =>
            sumBillableAmount({
                roundUpMinutesThreshold,
                members:
                    data?.timeEntriesByMembers?.map((member) => ({
                        hourlyRate: member.hourlyRate || 0,
                        minutes: sumTimeEntries({ entries: member.TimeEntries, dayjs }),
                    })) || [],
            }),
        [data, roundUpMinutesThreshold, dayjs],
    );

    return (
        <div className="flex flex-1 flex-col gap-8 md:flex-2/6">
            {member.role !== 'EMPLOYEE' && (
                <Select onValueChange={setScope} value={scope}>
                    <SelectTrigger className="w-[150px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>View metrics for</SelectLabel>
                            <SelectItem value="member">Yourself</SelectItem>
                            <SelectItem value="organization">Organization</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            )}
            <Card className="py-4">
                <CardContent>
                    <span className="text-muted-foreground block text-sm">Total Time</span>
                    <span className="font-mono">{formatMinutes(totalMinutes)}</span>
                </CardContent>
            </Card>
            <Card className="py-4">
                <CardContent>
                    <span className="text-muted-foreground block text-sm">Billable Amount</span>
                    <span className="font-mono">{billableAmount} PLN</span>
                </CardContent>
            </Card>
        </div>
    );
};
