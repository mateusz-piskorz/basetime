import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/common';
import { Activity } from 'lucide-react';

export const ActivityGraph = () => {
    const paddedEntries: null[] = [...Array(Math.max(0, 4)).fill(null)];

    return (
        <div className="flex-1 md:min-w-[330px] lg:min-w-[300px]">
            <div className="mb-4 flex items-center gap-2">
                <Activity className="text-muted-foreground size-5" />
                <h2>Activity Graph</h2>
            </div>
            <Card className="h-[300px] py-0">
                <CardContent className="flex h-full flex-col p-0">
                    {paddedEntries.map((entry, idx) => (
                        <div
                            className={cn('flex h-full items-center justify-between px-4', idx !== paddedEntries.length - 1 && 'border-b-1')}
                            key={`empty-${idx}`}
                        >
                            <span className="text-muted-foreground mx-auto tracking-widest">TODO</span>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
};
