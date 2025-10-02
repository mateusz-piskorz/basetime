'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { ImgInput } from '@/components/common/img-input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMember } from '@/lib/hooks/use-member';
import { removeLogo, updateLogo } from '@/lib/logo';
import { trpc } from '@/lib/trpc/client';
import { updateOrgLogoSchema } from '@/lib/zod/organization-schema';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export const SectionOrganizationLogo = () => {
    const trpcUtils = trpc.useUtils();
    const { logo, organizationId } = useMember();
    const [loading, setLoading] = useState(false);
    const [img, setImg] = useState<File | undefined | null>(undefined);

    const imgSrc = useMemo(() => {
        return img ? URL.createObjectURL(img) : img === null ? null : logo ? logo : null;
    }, [img, logo]);

    const handleSubmit = async () => {
        if (img === undefined) return;
        setLoading(true);
        const res = img ? await updateLogo({ img, organizationId }) : await removeLogo(organizationId);

        if (!res.success) {
            toast.error('something went wrong');
            setLoading(false);
            return;
        }

        await trpcUtils.organizations.refetch();
        setImg(undefined);
        setLoading(false);
        toast.success('Logo updated successfully');
    };

    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading
                className="mb-8"
                title="Update logo"
                description="Choose a clear, distinctive image to help others recognize your organization."
            />
            <Card className="h-[280px] w-[350px] border-2 border-dashed p-0 shadow-none">
                {imgSrc && (
                    <div>
                        <Image
                            src={imgSrc}
                            className="mx-auto mt-4 h-[180px] w-[200px] bg-center object-cover"
                            alt="uploaded image"
                            height={180}
                            width={200}
                        />
                    </div>
                )}

                <ImgInput imgSrc={imgSrc} schema={updateOrgLogoSchema} setImg={setImg} />
            </Card>
            <Button
                disabled={loading}
                onClick={async () => {
                    await handleSubmit();
                }}
            >
                Save
            </Button>
        </div>
    );
};
