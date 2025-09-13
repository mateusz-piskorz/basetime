import { permanentRedirect } from 'next/navigation';

export default function DashboardPage() {
    permanentRedirect('/dashboard/user/organizations');
}
