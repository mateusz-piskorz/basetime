'use client';

import { INVITATION_STATUS } from '@prisma/client';
import { MultiSelect } from './multi-select';

type Props = {
    status: INVITATION_STATUS[];
    setStatus: (val: INVITATION_STATUS[]) => void;
};

export const InvitationStatusFilter = ({ setStatus, status }: Props) => {
    return (
        <MultiSelect
            options={Object.values(INVITATION_STATUS).map((val) => ({
                label: val,
                value: val,
            }))}
            setValues={(val) => setStatus(val as INVITATION_STATUS[])}
            values={status}
            title="Status"
        />
    );
};
