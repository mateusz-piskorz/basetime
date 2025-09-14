import { SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbItem } from './breadcrumbs';

type Props = { breadcrumbs?: BreadcrumbItem[] };

export function AppHeader({ breadcrumbs = [] }: Props) {
    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear md:px-6 lg:hidden lg:px-8">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                {/* <Breadcrumbs breadcrumbs={breadcrumbs} /> */}
            </div>
        </header>
    );
}
