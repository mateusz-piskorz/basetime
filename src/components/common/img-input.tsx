import { ACCEPTED_IMAGE_EXT } from '@/lib/constants/accepted-image-ext';
import { cn } from '@/lib/utils/common';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

import { imgSchema } from '@/lib/zod/img-schema';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type Props = {
    imgSrc: string | null;
    setImg: (arg: File | null) => void;
};

export const ImgInput = ({ imgSrc, setImg }: Props) => {
    return (
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
                        const validated = imgSchema.safeParse({ img: file });
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
    );
};
