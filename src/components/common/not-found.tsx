import { Rabbit } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

type Props = {
    title: string;
    description?: string;
    href?: string;
    buttonText?: string;
};

export const NotFound = ({ title, description, href, buttonText }: Props) => {
    return (
        <div className="mx-auto mt-30 flex flex-col items-center space-y-4 text-center">
            <Rabbit size={90} strokeWidth={1} className="mx-auto" />
            <h1 className="text-2xl">{title}</h1>
            {description && <p className="text-muted-foreground max-w-[500px]">{description}</p>}
            <Button>
                <Link href={href || '/'}>{buttonText || 'Return to homepage'}</Link>
            </Button>
        </div>
    );
};
