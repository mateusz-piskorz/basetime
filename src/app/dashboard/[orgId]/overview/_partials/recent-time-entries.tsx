'use client';

import { ProjectBadge } from '@/components/common/project-badge';
import { StartButton } from '@/components/common/start-button';
import { Card, CardContent } from '@/components/ui/card';
import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { CircleCheckBig } from 'lucide-react';
import { useMemo } from 'react';
import { Scope } from './types';

type Props = {
    scope: Scope;
};

export const RecentTimeEntries = ({ scope }: Props) => {
    const { orgId } = useMember();
    const { data: timeEntries } = trpc.timeEntriesPaginated.useQuery({
        orgId,
        ...(scope === 'organization' && { members: 'all' }),
        limit: 4,
    });

    const paddedEntries = useMemo(() => {
        const entries = (timeEntries?.data || []).slice(0, 4);
        const emptySlots = Array(Math.max(0, 4 - entries.length)).fill(null);
        return [...entries, ...emptySlots];
    }, [timeEntries]) as NonNullable<typeof timeEntries>['data'];

    return (
        <div className="h-[300px] flex-1 md:min-w-[330px] lg:min-w-[300px]">
            <div className="mb-4 flex items-center gap-2">
                <CircleCheckBig className="text-muted-foreground size-5" />
                <h2>Recent Time Entries</h2>
            </div>
            <Card variant="outline-light-theme" className="h-[300px] py-0">
                <CardContent className="flex h-full flex-col p-0">
                    {paddedEntries.map((entry, idx) => (
                        <div
                            className={cn('flex h-full items-center justify-between px-4', idx !== paddedEntries.length - 1 && 'border-b')}
                            key={entry?.id ?? `empty-${idx}`}
                        >
                            {entry ? (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm">{entry.name}</span>
                                        <ProjectBadge size="sm" name={entry.Project?.name || 'No Project'} hex={entry.Project?.color || '#B96D40'} />
                                    </div>
                                    <StartButton size="sm" actionState="start" />
                                </>
                            ) : (
                                <span className="text-muted-foreground mx-auto tracking-widest">-------</span>
                            )}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};
