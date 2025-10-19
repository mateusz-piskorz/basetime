import { permanentRedirect } from 'next/navigation';

export default function AdminPanelPage() {
    permanentRedirect('/dashboard/admin-panel/blog');
}
