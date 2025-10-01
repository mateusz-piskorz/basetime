'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useMember } from '@/lib/hooks/use-member';
import { removeLogo, updateLogo } from '@/lib/logo';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { ACCEPTED_IMAGE_EXT, updateAvatarSchema } from '@/lib/zod/profile-schema';
import { Upload } from 'lucide-react';
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
                description="Choose a clear, distinctive image to help others recognize you'r organization."
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

                <div className={cn(imgSrc ? 'space-x-4 text-center' : 'h-full')}>
                    <label className={cn('relative mx-auto', !imgSrc && 'flex h-full w-full flex-col items-center justify-center')}>
                        {imgSrc ? (
                            <Button>Choose different</Button>
                        ) : (
                            <>
                                <Upload className="size-11" />
                                <p className="font-medium">Choose File</p>
                                <p className="text-muted-foreground font-normal">{ACCEPTED_IMAGE_EXT.join(', ')}</p>
                            </>
                        )}
                        <Input
                            className={cn('absolute top-0 left-0 h-full w-full cursor-pointer opacity-0')}
                            type="file"
                            accept="image/*"
                            onChange={async (event) => {
                                const file = event.target.files && event.target.files[0];
                                const validated = updateAvatarSchema.safeParse({ profile_img: file });
                                if (validated.success) {
                                    setImg(file);
                                } else {
                                    toast.error(validated.error.errors[0]?.message || 'Invalid image file');
                                }
                            }}
                        />
                    </label>
                    {imgSrc && (
                        <Button
                            className="mx-auto"
                            variant="destructive"
                            onClick={() => {
                                setImg(null);
                            }}
                        >
                            Remove
                        </Button>
                    )}
                </div>
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
