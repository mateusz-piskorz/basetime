'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/use-auth';
import { cn } from '@/lib/utils/common';
import { ACCEPTED_IMAGE_EXT } from '@/lib/zod/profile-schema';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import z from 'zod';

const ACCEPTED_IMAGE_TYPES = ['image/svg+xml', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const SectionAvatar = () => {
    const updateAvatarSchema = useMemo(
        () =>
            z.object({
                profile_img: z
                    .instanceof(File)
                    .refine((file) => file.size < 15000000, 'max file size is 15mb')
                    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), `Allowed file extensions: ${ACCEPTED_IMAGE_EXT.join(', ')}`)
                    .nullable(),
            }),
        [],
    );

    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [img, setImg] = useState<File | null | undefined>(undefined);

    const imgSrc = useMemo(() => {
        return img ? URL.createObjectURL(img) : img === null ? null : user?.avatar ? user.avatar : null;
    }, [img, user]);

    const handleSubmit = async () => {
        if (img === undefined) return;
        setLoading(true);
        let res;
        if (img) {
            const formData = new FormData();
            formData.set('file', img);

            res = await fetch('/api/user-avatar', {
                method: 'POST',
                body: formData,
            });
        } else {
            res = await fetch('/api/user-avatar', {
                method: 'DELETE',
            });
        }

        if (!res.ok) {
            toast.error('something went wrong');
        }

        setImg(undefined);
        setLoading(false);
        router.refresh();
        toast.success('Avatar updated successfully');
    };

    return (
        <div className="space-y-8 px-4 md:px-8">
            <DashboardHeading className="mb-8" title="Update avatar" description="Choose a clear, distinctive image to help others recognize you." />
            <Card className="h-[280px] w-[350px] border-2 border-dashed p-0 shadow-none">
                {imgSrc && (
                    <div>
                        <Image
                            src={imgSrc}
                            className="mx-auto mt-4 h-[180px] w-[300px] bg-center object-cover"
                            alt="uploaded image"
                            width={340}
                            height={180}
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
                                    toast.error(validated.error.errors[0]?.message ?? 'Invalid image file');
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
