import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { TableTask } from './_partials/table-task';

export default async function OrgTasksPage() {
    if (!(await getSession())) return redirect('/');

    return (
        <div className="space-y-8 py-8">
            <TableTask />
        </div>
    );
}
