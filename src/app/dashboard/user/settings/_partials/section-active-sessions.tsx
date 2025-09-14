'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { SpinLoader } from '@/components/common/spin-loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/use-auth';
import { useDayjs } from '@/lib/hooks/use-dayjs';
import { logout } from '@/lib/server-actions/auth';
import { trpc } from '@/lib/trpc/client';
import { Monitor, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { UAParser } from 'ua-parser-js';

export const SectionActiveSessions = () => {
    const { dayjs } = useDayjs();
    const { data, isLoading, error, refetch } = trpc.getUserActiveSessions.useQuery();
    const { user } = useAuth();

    const handleLogoutSession = async (sessionId: string) => {
        const res = await logout({ sessionId });
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('Logged out successfully');
        refetch();
    };
    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading className="mb-8" title="Active sessions" description="View and manage devices currently signed in to your account." />
            <div className="space-y-4">
                {error && <p className="text-red-500">Error loading active sessions</p>}
                {!error && isLoading && <SpinLoader />}
                {!error &&
                    !isLoading &&
                    data?.map((session) => {
                        const useragent = new UAParser(session.userAgent).getResult();
                        const isMobileDevice = ['mobile', 'tablet'].includes(useragent.device.type || '');
                        const deviceName = isMobileDevice ? useragent.device.model : useragent.browser.name;
                        const isCurrentSession = session.id === user?.sessionId;
                        return (
                            <Card key={session.id}>
                                <CardContent className="space-y-2 md:flex md:items-center md:justify-between">
                                    <div>
                                        <div className="mb-4 flex items-center gap-4">
                                            {isCurrentSession && <span className="flex h-3 w-3 rounded-full bg-green-500" />}
                                            {isMobileDevice ? <Smartphone /> : <Monitor />}
                                            {deviceName}, {useragent.os.name}
                                            {isCurrentSession && <p className="text-muted-foreground">(current session)</p>}
                                        </div>
                                        <p className="text-muted-foreground">{`End of session: ${dayjs(session.expiresAt).fromNow()} (${dayjs(session.expiresAt).format('DD-MM-YYYY HH:mm:ss')})`}</p>
                                        <p className="text-muted-foreground">{`Last activity: ${dayjs(session.updatedAt).fromNow()} (${dayjs(session.updatedAt).format('DD-MM-YYYY HH:mm:ss')})`}</p>
                                    </div>
                                    <Button disabled={isCurrentSession} onClick={() => handleLogoutSession(session.id)}>
                                        Log out
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
            </div>
        </div>
    );
};
