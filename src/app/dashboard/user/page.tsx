import { permanentRedirect } from 'next/navigation';

export default function DashboardUserPage() {
    permanentRedirect('/dashboard/user/organizations');
}
