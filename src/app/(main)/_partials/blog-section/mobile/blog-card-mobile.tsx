import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { dayjs } from '@/lib/dayjs';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
    badges: string[];
    date: Date;
    readTime: string;
    title: string;
    description: string;
    imgSrc: string;
    href: string;
};

export const BlogCardMobile = ({ badges, date, description, readTime, title, imgSrc, href }: Props) => {
    return (
        <Link href={href} className="cursor-pointer">
            <Card className="w-full max-w-[400px] min-w-[400px] overflow-hidden rounded-md py-0">
                <Image src={imgSrc} width={540} height={280} alt={title} />
                <div className="space-y-4 px-4 pb-4">
                    <div className="mb-8 flex flex-wrap gap-4">
                        {badges.map((b) => (
                            <Badge variant="outline" key={b}>
                                {b}
                            </Badge>
                        ))}
                    </div>
                    <span className="text-muted-foreground text-sm">
                        {dayjs(date).format('MMMM D, YYYY')} - {readTime}
                    </span>
                    <h1 className="text-xl">{title}</h1>
                    <p className="text-muted-foreground font-mono">{description}</p>
                </div>
            </Card>
        </Link>
    );
};
