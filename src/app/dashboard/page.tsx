'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) return redirect('/login');

    const org = await prisma.organization.findFirst({ where: { Members: { some: { userId: session.userId } } } });
    if (org) return redirect(`/dashboard/${org.id}/overview`);

    return redirect('/dashboard/user/organizations');
}
