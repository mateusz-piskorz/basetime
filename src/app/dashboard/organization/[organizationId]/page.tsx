import { SectionTimeTracker } from '@/components/common/section-time-tracker';
import { TableTimeEntry } from '@/components/common/table-time-entry';
import { getSession } from '@/lib/session';
import { Separator } from '@radix-ui/react-separator';
import { redirect } from 'next/navigation';

export default async function OrganizationPage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }
    return (
        <div className="space-y-8 py-8">
            <SectionTimeTracker />
            <Separator />
            <TableTimeEntry />
        </div>
    );
}
