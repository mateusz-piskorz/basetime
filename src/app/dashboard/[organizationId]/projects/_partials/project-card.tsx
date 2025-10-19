import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMember } from '@/lib/hooks/use-member';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { cn, formatMinutes } from '@/lib/utils/common';
import { Clock, Timer, Users2 } from 'lucide-react';

type Props = {
    project: NonNullable<TrpcRouterOutput['projects']>[number];
    deleteProject: (memberId: string) => void;
    manageProject: (memberId: string) => void;
};

export const ProjectCard = ({
    project: { name, id, _count, loggedTime, estimatedMinutes, percentCompleted },
    manageProject,
    deleteProject,
}: Props) => {
    const {
        member: { role: currentUserRole },
    } = useMember();
    return (
        <Card className="bg-bg dark:bg-card w-full border shadow-none md:max-w-[325px]">
            <CardContent className={cn('min-h-[200px] space-y-6', currentUserRole === 'EMPLOYEE' && 'min-h-[150px]')}>
                <div className="flex gap-2">{name}</div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Users2 size={16} />
                            Members
                        </div>
                        <div>{_count.Members}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Clock size={16} />
                            Logged
                        </div>
                        <div>{loggedTime}</div>
                    </div>
                    <div className="flex justify-between">
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Timer size={16} />
                            Estimated
                        </div>
                        <div> {estimatedMinutes ? formatMinutes(estimatedMinutes) : '-'}</div>
                    </div>
                </div>
                <div className="w-full">
                    <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{percentCompleted ?? 0}%</span>
                    </div>
                    <div className="bg-muted h-2 w-full overflow-hidden rounded">
                        <div
                            className="bg-accent-secondary h-2 rounded"
                            style={{
                                width: `${Math.min(Number(percentCompleted ?? 0), 100)}%`,
                                transition: 'width 0.3s',
                            }}
                        />
                    </div>
                </div>
                {currentUserRole !== 'EMPLOYEE' && (
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => manageProject(id)}>Manage</Button>
                        <Button onClick={() => deleteProject(id)} variant="destructive">
                            Delete
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
