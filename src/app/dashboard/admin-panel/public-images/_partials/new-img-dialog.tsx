'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { ImgInput } from '@/components/common/img-input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { addPublicBlogImg } from '@/lib/public-blog-img';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
};

export const NewImgDialog = ({ open, setOpen }: Props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [img, setImg] = useState<File | null>(null);

    const imgSrc = useMemo(() => {
        return img ? URL.createObjectURL(img) : null;
    }, [img]);

    const handleSubmit = async () => {
        if (!img) return;
        setLoading(true);
        const res = await addPublicBlogImg({ img });

        if (!res.success) {
            toast.error('something went wrong');
            setLoading(false);
            return;
        }

        setImg(null);
        setLoading(false);
        toast.success('public image created successfully');
        router.refresh();
        setOpen(false);
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogTitle>Create new img</DialogTitle>

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

                        <ImgInput btnState={Boolean(imgSrc)} setImg={setImg} />
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
            </DialogContent>
        </Dialog>
    );
};
