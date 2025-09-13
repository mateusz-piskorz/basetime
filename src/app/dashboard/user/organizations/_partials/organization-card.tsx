import { Card, CardContent } from '@/components/ui/card';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { Clock, FolderClosed, Users2 } from 'lucide-react';
import Link from 'next/link';

type Props = {
    organization: NonNullable<TrpcRouterOutput['getUserOrganizations']>[number];
};

export const OrganizationCard = ({ organization: { id, _count, loggedTime, name } }: Props) => {
    return (
        <Link href={`/dashboard/${id}/overview`}>
            <Card className={cn('relative w-full overflow-hidden md:max-w-[325px]')}>
                <CardContent className={cn('min-h-[150px] space-y-6')}>
                    <div className="flex gap-2">{name}</div>

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-6">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-muted-foreground" /> {loggedTime}
                        </div>
                        <div className="flex items-center gap-2">
                            <FolderClosed size={16} className="text-muted-foreground" /> {_count.Projects}
                        </div>
                        <div className="flex items-center gap-2">
                            <Users2 size={16} className="text-muted-foreground" /> {_count.Members}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
};
