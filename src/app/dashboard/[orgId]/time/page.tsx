import { SectionTimeTracker } from '@/components/common/section-time-tracker';
import { Separator } from '@/components/ui/separator';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { TableTimeEntry } from './_partials/table-time-entry';

export default async function TimePage() {
    if (!(await getSession())) return redirect('/');

    return (
        <div className="space-y-12 pt-8">
            <SectionTimeTracker className="mb-12" />
            <Separator />
            <TableTimeEntry />
        </div>
    );
}
