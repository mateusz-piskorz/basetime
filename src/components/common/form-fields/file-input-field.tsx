/* eslint-disable @typescript-eslint/no-unused-vars */

'use client';

import { Card } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { resizeImage } from '@/lib/server-actions/resize-image';
import { Nullable, TypedFieldPath } from '@/lib/types/common';
import { cn } from '@/lib/utils/common';
import { ACCEPTED_IMAGE_EXT } from '@/lib/zod/profile-schema';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import { Input } from '../../ui/input';

type FieldType = Nullable<File>;

type Props<T extends FieldValues> = {
    form: UseFormReturn<T>;
    name: TypedFieldPath<T, FieldType>;
    onFocus?: () => void;
    errorMessage?: boolean;
    placeholder?: string;
    disabled?: boolean;
};

// this make no sense
export const FileInputField = <T extends FieldValues>({ onFocus, form, name: propsName, placeholder, errorMessage = true, disabled }: Props<T>) => {
    const [imgString64, setImgString64] = useState<string | null>(null);
    const name = propsName as string;
    const { control } = form as unknown as UseFormReturn<{ [x: string]: FieldType }>;

    const resizeImgHandler = async (file: File) => {
        const { data, success, message } = await resizeImage({ image: file });
        if (!data || !success) {
            toast.error(message);
            return;
        }
        setImgString64(data.base64);
    };

    return (
        <FormField
            control={control}
            name={name}
            render={({ field }) => {
                const { value, ...fieldRest } = field;
                return (
                    <Card className="h-[200px] w-[350px] border-2 border-dashed p-0 shadow-none">
                        {imgString64 && <Image src={imgString64} alt="uploaded image" width={200} height={200} />}
                        <FormItem className="relative flex h-full justify-center border-none">
                            <FormLabel className="flex-col justify-center">
                                <Upload className="size-11" />
                                <p className="font-medium">Choose File</p>
                                <p className="text-muted-foreground font-normal">{ACCEPTED_IMAGE_EXT.join(', ')}</p>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    className={cn('cursor-pointer', !imgString64 && 'absolute h-full w-full opacity-0')}
                                    {...fieldRest}
                                    disabled={disabled}
                                    onFocus={onFocus}
                                    placeholder={placeholder}
                                    type="file"
                                    accept="image/*"
                                    onChange={async (event) => {
                                        const file = event.target.files && event.target.files[0];
                                        field.onChange(file);
                                        if (file) {
                                            await resizeImgHandler(file);
                                        } else {
                                            setImgString64(null);
                                        }
                                    }}
                                />
                            </FormControl>
                            {errorMessage && <FormMessage />}
                        </FormItem>
                    </Card>
                );
            }}
        />
    );
};
