import { ACCEPTED_IMAGE_EXT } from '@/lib/constants/accepted-image-ext';
import { cn } from '@/lib/utils/common';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

import { imgSchema } from '@/lib/zod/img-schema';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';

type Props = {
    btnState?: boolean;
    setImg: (arg: File | null) => void;
};

export const ImgInput = ({ btnState, setImg }: Props) => {
    return (
        <Card
            variant="outline-light-theme"
            className={cn(
                'border-2 border-dashed p-0',
                !Boolean(btnState) && 'h-[280px] w-[350px]',
                Boolean(btnState) && 'flex-row items-start border-0 bg-transparent dark:bg-transparent',
            )}
        >
            <div className={cn(btnState ? 'space-x-4 text-center' : 'h-full')}>
                <label className={cn('relative mx-auto', !btnState && 'flex h-full w-full flex-col items-center justify-center')}>
                    {btnState ? (
                        <Button variant="outline">Choose different</Button>
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
            </div>
        </Card>
    );
};
