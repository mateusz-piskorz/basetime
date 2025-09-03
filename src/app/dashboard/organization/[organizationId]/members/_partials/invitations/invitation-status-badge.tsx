import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { INVITATION_STATUS } from '@prisma/client';

type Props = {
    status: INVITATION_STATUS;
};

export const InvitationStatusBadge = ({ status }: Props) => {
    return (
        <Badge
            variant="secondary"
            className={cn(
                'rounded-xs border border-[#E5E7E6] px-1 text-sm font-normal',
                status === 'ACCEPTED' && 'border-[#22c55e] text-[#22c55e]',
                status === 'CANCELED' && 'border-[#F49D37] text-[#F49D37]',
                status === 'REJECTED' && 'border-[#e30909] text-[#e30909]',
            )}
        >
            {status}
        </Badge>
    );
};
