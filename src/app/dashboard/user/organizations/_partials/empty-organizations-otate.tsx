import { Button } from '@/components/ui/button';
import { Rabbit } from 'lucide-react';
import Link from 'next/link';

type Props = {
    openCreateOrganizationDialog: () => void;
};

export const EmptyOrganizationsState = ({ openCreateOrganizationDialog }: Props) => {
    return (
        <div className="mx-auto mt-[40px] flex flex-col items-center space-y-4 text-center">
            <Rabbit size={90} strokeWidth={1} className="mx-auto" />
            {/* <h1 className="text-2xl"></h1> */}
            <p className="text-muted-foreground max-w-[500px]">
                It looks like you don&apos;t belong to any organization yet. Consider checking for pending invitations or create a new organization.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline">
                    <Link href="/dashboard/user/invitations">check your invitations</Link>
                </Button>

                <Button onClick={openCreateOrganizationDialog}>create organization</Button>
            </div>
        </div>
    );
};
