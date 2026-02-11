'use client';
import React from 'react';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { CropDialog } from '@/components/common/crop-dialog';
import { DashboardHeading } from '@/components/common/dashboard-heading';
import { ImgInput } from '@/components/common/img-input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMember } from '@/lib/hooks/use-member';
import { updateOrgLogo } from '@/lib/server-actions/organization';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

export const SectionOrgLogo = () => {
    const [confirm, setConfirm] = React.useState(false);
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const trpcUtils = trpc.useUtils();
    const { orgLogo, orgId, orgName } = useMember();

    console.log(orgLogo);

    return (
        <>
            <ConfirmDialog
                onContinue={async () => {
                    const res = await updateOrgLogo({ logoBase64: null, orgId });
                    if (res.success) toast.success('logo updated successfully');
                    else toast.error('something went wrong - updateOrgLogo');
                    await trpcUtils.organizations.refetch();
                    setConfirm(false);
                }}
                open={confirm}
                setOpen={setConfirm}
                title="Do you really want to remove Your organizations logo"
                description='"This action cannot be undone. Logo will be removed permanently"'
            />

            {selectedFile && (
                <CropDialog
                    selectedFile={selectedFile}
                    onCrop={async (croppedImg) => {
                        const res = await updateOrgLogo({ logoBase64: croppedImg, orgId });
                        if (res.success) toast.success('logo updated successfully');
                        else toast.error('something went wrong - updateOrgLogo');
                        await trpcUtils.organizations.refetch();
                        setSelectedFile(null);
                    }}
                    onCancel={() => {
                        setSelectedFile(null);
                    }}
                />
            )}

            <div className="space-y-12 px-4 md:px-8">
                <DashboardHeading title="Update logo" description="Choose a clear, distinctive image to help others recognize your organization." />

                {orgLogo && (
                    <div className="flex items-center gap-4">
                        <Card
                            variant="outline-light-theme"
                            className="flex w-full max-w-[300px] items-center justify-center gap-8 rounded-md text-center"
                        >
                            <img alt="organization logo" src={orgLogo} className="h-44 rounded-md" />
                            <p className="text-xl">{orgName}</p>
                        </Card>
                    </div>
                )}
                <div className="flex gap-4">
                    {orgLogo && (
                        <Button onClick={() => setConfirm(true)} variant="destructive">
                            Remove
                        </Button>
                    )}
                    <ImgInput
                        setImg={(file) => {
                            setSelectedFile(file);
                        }}
                        btnState={Boolean(orgLogo)}
                    />
                </div>
            </div>
        </>
    );
};
