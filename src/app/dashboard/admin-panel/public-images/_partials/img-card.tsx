'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CopyButton } from '@/components/ui/copy-button';
import { removePublicBlogImg } from '@/lib/public-blog-img';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type Props = {
    url: string;
    alt: string;
    imgPath: string;
};

export const ImgCard = ({ alt, url, imgPath }: Props) => {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    return (
        <>
            <ConfirmDialog
                open={open}
                setOpen={setOpen}
                onContinue={async () => {
                    const res = await removePublicBlogImg({ imgPath });
                    if (!res.success) toast.error('something went wrong - removePublicImg');
                    else toast.success('removed public img');
                    router.refresh();
                    setOpen(false);
                }}
                title="Are you sure you want to remove public img"
                description="This action cannot be undone. Public img will be removed permanently"
            />
            <Card className="py-0">
                <img className="h-[150px] w-[400px] object-cover" alt={alt} src={url} />
                <div className="flex gap-4">
                    <Button variant="destructive" onClick={() => setOpen(true)}>
                        Remove
                    </Button>
                    <CopyButton content={url} onCopy={() => console.log('Link copied!')} />
                </div>
            </Card>
        </>
    );
};
