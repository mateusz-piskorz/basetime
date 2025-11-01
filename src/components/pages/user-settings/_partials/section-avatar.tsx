'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { CropDialog } from '@/components/common/crop-dialog';
import { DashboardHeading } from '@/components/common/dashboard-heading';
import { ImgInput } from '@/components/common/img-input';
import { UserInfo } from '@/components/common/user-info';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/hooks/use-auth';
import { updateProfileAvatar } from '@/lib/server-actions/profile';
import { getUserAvatarUrl } from '@/lib/utils/common';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export const SectionAvatar = () => {
    const [confirm, setConfirm] = useState(false);
    const { user } = useAuth();
    const userAvatar = user.avatarId ? getUserAvatarUrl({ avatarId: user.avatarId }) : null;
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    return (
        <>
            <ConfirmDialog
                onContinue={async () => {
                    const res = await updateProfileAvatar({ avatarBase64: null });
                    if (res.success) toast.success('Avatar updated successfully');
                    else toast.error('something went wrong - updateProfileAvatar');
                    router.refresh();
                    setConfirm(false);
                }}
                open={confirm}
                setOpen={setConfirm}
                title="Do you really want to remove Your avatar"
                description='"This action cannot be undone. Avatar will be removed permanently"'
            />

            {selectedFile && (
                <CropDialog
                    selectedFile={selectedFile}
                    onCrop={async (croppedImg) => {
                        const res = await updateProfileAvatar({ avatarBase64: croppedImg });
                        if (res.success) toast.success('Avatar updated successfully');
                        else toast.error('something went wrong - updateProfileAvatar');
                        router.refresh();
                        setSelectedFile(null);
                    }}
                    onCancel={() => {
                        setSelectedFile(null);
                    }}
                />
            )}

            <div className="space-y-12 px-4 md:px-8">
                <DashboardHeading title="Update avatar" description="Choose a clear, distinctive image to help others recognize you." />

                {userAvatar && (
                    <Card variant="outline-light-theme" className="flex max-w-[400px] items-center justify-center gap-8 text-center">
                        <UserInfo size="lg" avatarSrc={userAvatar} name={user.name} textUnder={user.email} />
                    </Card>
                )}
                <div className="flex gap-4">
                    {userAvatar && (
                        <Button onClick={() => setConfirm(true)} variant="destructive">
                            Remove
                        </Button>
                    )}
                    <ImgInput
                        setImg={(file) => {
                            setSelectedFile(file);
                        }}
                        btnState={Boolean(userAvatar)}
                    />
                </div>
            </div>
        </>
    );
};
