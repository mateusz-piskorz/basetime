import { UserInfo } from '@/components/common/user-info';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { Clock, DollarSign, FolderClosed } from 'lucide-react';

type Props = {
    member: NonNullable<TrpcRouterOutput['getMembers']>[number];

    deleteMember: (memberId: string) => void;
    manageMember: (memberId: string) => void;
};

export const MemberCard = ({ member: { id, User, _count, loggedTime, role, hourlyRate }, manageMember, deleteMember }: Props) => {
    return (
        <Card className="w-full md:max-w-[325px]">
            <CardContent className="space-y-6">
                <div className="flex gap-2">
                    <UserInfo showEmail user={User} />
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
                <Button onClick={() => manageMember(id)}>Manage</Button>
                <Button onClick={() => deleteMember(id)} variant="destructive">
                    Delete
                </Button>
            </CardContent>
        </Card>
    );
};
