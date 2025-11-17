import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { SectionKanban } from './_partials';

export default async function OrgKanbanPage() {
    if (!(await getSession())) return redirect('/');

    return <SectionKanban />;
}
