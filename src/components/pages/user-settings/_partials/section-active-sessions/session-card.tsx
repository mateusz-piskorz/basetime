'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dayjs } from '@/lib/dayjs';
import { useAuth } from '@/lib/hooks/use-auth';
import { logout } from '@/lib/server-actions/auth';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import { Monitor, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import { UAParser } from 'ua-parser-js';

type Props = {
    session: TrpcRouterOutput['activeSessions'][number];
};

export const SessionCard = ({ session }: Props) => {
    const trpcUtils = trpc.useUtils();
    const { user } = useAuth();

    const useragent = new UAParser(session.userAgent).getResult();
    const isMobileDevice = ['mobile', 'tablet'].includes(useragent.device.type || '');
    const deviceName = isMobileDevice ? useragent.device.model : useragent.browser.name;
    const isCurrentSession = session.id === user?.sessionId;

    const handleLogoutSession = async () => {
        const res = await logout({ sessionId: session.id });
        if (!res.success) {
            toast.error(res.message);
            return;
        }
        toast.success('Logged out successfully');
        trpcUtils.activeSessions.refetch();
    };

    return (
        <Card key={session.id}>
            <CardContent className="space-y-4 md:flex md:items-center md:justify-between">
                <div>
                    <div className="mb-5 flex items-center gap-4">
                        {isCurrentSession && <span className="flex h-3 w-3 rounded-full bg-green-500" />}
                        {isMobileDevice ? <Smartphone /> : <Monitor />}
                        {deviceName}, {useragent.os.name}
                        {isCurrentSession && <p className="text-muted-foreground">(current session)</p>}
                    </div>
                    <p className="text-muted-foreground mb-1">End of session {dayjs(session.expiresAt).fromNow()} </p>
                    <p className="text-muted-foreground">Last activity {dayjs(session.updatedAt).fromNow()} </p>
                </div>
                <Button disabled={isCurrentSession} onClick={handleLogoutSession}>
                    Log out
                </Button>
            </CardContent>
        </Card>
    );
};
