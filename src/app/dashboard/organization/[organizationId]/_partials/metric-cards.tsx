'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMember } from '@/lib/hooks/use-member';

export const MetricCards = () => {
    const { role } = useMember().member;
    return (
        <div className="flex flex-1 flex-col gap-8 md:flex-2/6">
            <Card className="py-4">
                <CardContent>
                    <span className="text-muted-foreground block text-sm">Spent Time</span>
                    <span className="font-mono">20h 30min</span>
                </CardContent>
            </Card>
            <Card className="py-4">
                <CardContent>
                    <span className="text-muted-foreground block text-sm">Billable Amount</span>
                    <span className="font-mono">430 PLN</span>
                </CardContent>
            </Card>
            {role && (
                <Select defaultValue="you">
                    <SelectTrigger className="w-[150px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>View metrics for</SelectLabel>
                            <SelectItem value="you">Yourself</SelectItem>
                            <SelectItem value="organization">Organization</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            )}
        </div>
    );
};
