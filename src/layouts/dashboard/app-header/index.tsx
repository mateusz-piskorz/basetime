import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function AppHeader() {
    return (
        <>
            <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear md:px-6 lg:hidden lg:px-8">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                </div>
            </header>
            <Separator className="lg:hidden" />
        </>
    );
}
