import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils/common';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
    date: Date;
    readTime: string;
    title: string;
    description: string;
    imgSrc: string;
    href: string;
    variant: 'full' | 'side';
    className?: string;
};

export const BlogCardDesktop = ({ date, description, readTime, title, imgSrc, href, className, variant }: Props) => {
    return (
        <Card className={cn('flex-row gap-4 overflow-hidden rounded-md py-0', className)}>
            <Image
                src={imgSrc}
                width={910}
                height={450}
                alt={title}
                className={cn('object-cover grayscale-25 dark:opacity-90', variant === 'side' && 'absolute h-full', variant === 'full' && 'w-[60%]')}
            />
            {variant === 'full' && (
                <div className="flex w-[40%] flex-col items-start gap-4 px-4 py-8">
                    <span className="text-muted-foreground text-sm 2xl:text-base">
                        {dayjs(date).format('MMMM D, YYYY')} - {readTime}
                    </span>
                    <h1 className="text-xl xl:text-2xl 2xl:text-3xl">{title}</h1>
                    <p className="text-muted-foreground font-mono text-sm 2xl:text-base">{description}</p>
                    <Button asChild variant="link" className="mt-auto pb-0 pl-0 text-base xl:text-xl">
                        <Link href={href}>
                            Read More <ChevronRight />
                        </Link>
                    </Button>
                </div>
            )}
        </Card>
    );
};
