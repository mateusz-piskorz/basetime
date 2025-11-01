'use client';

import { useMember } from '@/lib/hooks/use-member';
import { trpc } from '@/lib/trpc/client';
import { User2 } from 'lucide-react';
import { MultiSelect } from './multi-select';

type Props = {
    members: string[];
    setMembers: (val: string[]) => void;
};

export const MembersFilter = ({ members, setMembers }: Props) => {
    const { orgId, member } = useMember();

    const { data } = trpc.members.useQuery({ orgId });
    return (
        <MultiSelect
            options={(data || []).map(({ User, id }) => ({
                label: `${User.name} ${member.id === id ? '(You)' : ''}`,
                value: id,
                icon: User2,
            }))}
            setValues={(val) => setMembers(val)}
            values={members}
            title="Members"
        />
    );
};
