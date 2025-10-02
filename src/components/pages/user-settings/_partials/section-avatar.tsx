'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { ImgInput } from '@/components/common/img-input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { removeAvatar, updateAvatar } from '@/lib/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

export const SectionAvatar = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [img, setImg] = useState<File | undefined | null>(undefined);

    const imgSrc = useMemo(() => {
        return img ? URL.createObjectURL(img) : img === null ? null : user?.avatar ? user.avatar : null;
    }, [img, user]);

    const handleSubmit = async () => {
        if (img === undefined) return;
        setLoading(true);
        const res = img ? await updateAvatar(img) : await removeAvatar();

        if (!res.success) {
            toast.error('something went wrong');
            setLoading(false);
            return;
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
                            className="mx-auto mt-4 h-[180px] w-[200px] bg-center object-cover"
                            alt="uploaded image"
                            height={180}
                            width={200}
                        />
                    </div>
                )}

                <ImgInput imgSrc={imgSrc} setImg={setImg} />
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
