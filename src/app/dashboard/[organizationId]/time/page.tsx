import { SectionTimeTracker } from '@/components/common/section-time-tracker';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { TableTimeEntry } from './_partials/table-time-entry';

export default async function TimePage() {
    const user = await getSession();
    if (!user) {
        return redirect('/');
    }

    return (
        <div className="pt-8">
            <SectionTimeTracker className="mb-14" />
            <TableTimeEntry />
        </div>
    );
}
