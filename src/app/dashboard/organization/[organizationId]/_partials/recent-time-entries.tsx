'use client';

import { ProjectBadge } from '@/components/common/project-badge';
import { StartButton } from '@/components/common/start-button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/common';
import { PROJECT_COLOR } from '@prisma/client';
import { CircleCheckBig } from 'lucide-react';

type Entry = { id: string; name: string; projectName?: string; projectColor?: PROJECT_COLOR };

type Props = {
    recentTimeEntries: Entry[];
};

export const RecentTimeEntries = ({ recentTimeEntries }: Props) => {
    const paddedEntries: (Entry | null)[] = [...recentTimeEntries.slice(0, 4), ...Array(Math.max(0, 4 - recentTimeEntries.length)).fill(null)];

    return (
        <div className="h-[300px] flex-1 md:min-w-[330px] lg:min-w-[300px]">
            <div className="mb-4 flex items-center gap-2">
                <CircleCheckBig className="text-muted-foreground size-5" />
                <h2>Recent Time Entries</h2>
            </div>
            <Card className="h-[300px] py-0">
                <CardContent className="flex h-full flex-col p-0">
                    {paddedEntries.map((entry, idx) => (
                        <div
                            className={cn('flex h-full items-center justify-between px-4', idx !== paddedEntries.length - 1 && 'border-b-1')}
                            key={entry?.id ?? `empty-${idx}`}
                        >
                            {entry ? (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm">{entry.name}</span>
                                        <ProjectBadge size="sm" name={entry.projectName || 'No Project'} color={entry.projectColor || 'GRAY'} />
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
