'use client';

import { cn } from '@/lib/utils/common';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';
import { DocCardText } from './doc-card-text';

type Props = {
    imgDarkSrc: string;
    imgLightSrc: string;
    heading: string;
    Icon: LucideIcon;
    description: string;
    badges: string[];
    className?: string;
};

export const DocCard = ({ className, badges, description, heading, Icon, imgDarkSrc, imgLightSrc }: Props) => {
    return (
        <div className={cn('bg-background space-y-10 rounded-md px-5 py-10 lg:pr-0 xl:pl-10 2xl:px-10', className)}>
            <div className="relative aspect-video min-h-[350px] w-full overflow-hidden rounded-md sm:min-h-[400px] lg:rounded-s-none">
                <Image
                    src={imgLightSrc}
                    alt="product"
                    width={1920}
                    height={1080}
                    className="min-h-[410px] object-cover object-left sm:min-h-[590px] dark:hidden"
                />
                <Image
                    src={imgDarkSrc}
                    alt="product"
                    width={1920}
                    height={1080}
                    className="hidden min-h-[410px] object-cover object-left sm:min-h-[590px] dark:block"
                />
                <div
                    className={cn(
                        'absolute top-0 left-0 h-full w-full',
                        'dark:bg-[linear-gradient(to_top,_rgba(17,14,17,1),_rgba(17,14,17,.12)_35%,_rgba(17,14,17,0)_75%,_rgba(17,14,17,0))]',
                        'bg-[linear-gradient(to_top,_rgba(241,238,241,1),_rgba(241,238,241,.12)_35%,_rgba(241,238,241,0)_75%,_rgba(241,238,241,0))]',
                    )}
                />
            </div>
            <DocCardText Icon={Icon} badges={badges} description={description} heading={heading} />
        </div>
    );
};
