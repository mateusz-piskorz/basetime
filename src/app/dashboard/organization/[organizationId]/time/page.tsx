import { SectionTimeTracker } from '@/components/common/section-time-tracker';
import { TableTimeEntry } from '@/components/common/table-time-entry';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function TimePage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }

    return (
        <div className="space-y-14 pt-8">
            <SectionTimeTracker />

            <TableTimeEntry />
        </div>
    );
}
