import { UserInfo } from '@/components/common/user-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useMember } from '@/lib/hooks/use-member';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { Clock, DollarSign, FolderClosed } from 'lucide-react';

type Props = {
    member: NonNullable<TrpcRouterOutput['members']>[number];
    deleteMember: (memberId: string) => void;
    manageMember: (memberId: string) => void;
};

export const MemberCard = ({ member: { id, User, _count, loggedTime, role, hourlyRate, avatar }, manageMember, deleteMember }: Props) => {
    const {
        member: { role: currentUserRole, id: currentMemberId },
    } = useMember();

    return (
        <Card className={cn('relative w-full overflow-hidden md:max-w-[325px]', currentMemberId === id && 'border-green-500/70')}>
            <CardContent className={cn('min-h-[200px] space-y-6', currentUserRole === 'EMPLOYEE' && 'min-h-[150px]')}>
                <div className="flex gap-2">
                    <UserInfo showEmail user={User} showCurrentUserIndicator={currentMemberId === id} avatar={avatar} />
                    {role}
                </div>

                <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-muted-foreground" /> {loggedTime}
                    </div>
                    <div className="flex items-center gap-2">
                        <FolderClosed size={16} className="text-muted-foreground" /> {_count.Projects}
                    </div>
                    <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-muted-foreground" /> {hourlyRate ? hourlyRate : '-'}
                    </div>
                </div>
                {currentUserRole !== 'EMPLOYEE' && (
                    <div className="flex flex-wrap gap-2">
                        <Button onClick={() => manageMember(id)}>Manage</Button>
                        <Button onClick={() => deleteMember(id)} variant="destructive">
                            Delete
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
