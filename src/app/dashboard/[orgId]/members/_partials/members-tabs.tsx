'use client';
import React from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMember } from '@/lib/hooks/use-member';
import { TableInvitations } from './invitations';
import { MemberList } from './members';

export const MembersTabs = () => {
    const { role } = useMember().member;
    const [value, setValue] = React.useState('members');
    const [openInvitationsDialog, setOpenInvitationsDialog] = React.useState(false);

    return (
        <div className="space-y-8 px-4 py-8 md:px-8">
            <Tabs value={value}>
                <TabsList className="gap-4 rounded bg-transparent">
                    <TabsTrigger
                        onClick={() => setValue('members')}
                        value="members"
                        className="dark:data-[state=active]:bg-secondary/80 data-[state=active]:bg-secondary/80 border-border p-4"
                    >
                        Members
                    </TabsTrigger>
                    {role !== 'EMPLOYEE' && (
                        <TabsTrigger
                            onClick={() => setValue('invitations')}
                            value="invitations"
                            className="dark:data-[state=active]:bg-secondary/80 data-[state=active]:bg-secondary/80 border-border p-4"
                        >
                            Invitations
                        </TabsTrigger>
                    )}
                </TabsList>
                <TabsContent value="members">
                    <MemberList
                        openInvitationDialog={() => {
                            setOpenInvitationsDialog(true);
                            setValue('invitations');
                        }}
                    />
                </TabsContent>
                {role !== 'EMPLOYEE' && (
                    <TabsContent value="invitations">
                        <TableInvitations open={openInvitationsDialog} setOpen={setOpenInvitationsDialog} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
};
