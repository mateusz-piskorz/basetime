import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

type Props = {
    Icon: LucideIcon;
    text: string;
};

export const HeroCard = ({ Icon, text }: Props) => {
    return (
        <Card className="lg:w-[200px] xl:w-[250px]">
            <CardContent className="flex flex-col items-center gap-2 lg:w-[200px] xl:w-[250px]">
                <Icon className="text-accent" />
                <span className="text-muted-foreground">{text}</span>
            </CardContent>
        </Card>
    );
};
