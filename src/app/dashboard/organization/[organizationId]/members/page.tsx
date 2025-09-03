import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { TableInvitations } from './_partials/invitations';
import { MemberList } from './_partials/members';

export default async function OrganizationSettingsPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }

    return (
        <div className="space-y-8 px-4 py-8 md:px-8">
            {/* <DashboardHeading title="members" description="Preview members and manage invitations" /> */}
            <Tabs defaultValue="members">
                <TabsList className="gap-4 rounded bg-transparent">
                    <TabsTrigger
                        value="members"
                        className="dark:data-[state=active]:bg-secondary/80 data-[state=active]:bg-secondary/80 border-border p-4"
                    >
                        Members
                    </TabsTrigger>
                    <TabsTrigger
                        value="invitations"
                        className="dark:data-[state=active]:bg-secondary/80 data-[state=active]:bg-secondary/80 border-border p-4"
                    >
                        Invitations
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="members">
                    <MemberList />
                </TabsContent>
                <TabsContent value="invitations">
                    <TableInvitations />
                </TabsContent>
            </Tabs>
        </div>
    );
}
