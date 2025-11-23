import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Crosshair, UserCheck2, Zap } from 'lucide-react';

const arr = [
    { text: 'Modern', Icon: Zap },
    { text: 'Accurate', Icon: Crosshair },
    { text: 'Simple', Icon: CheckCircle },
    { text: 'User-Friendly', Icon: UserCheck2 },
];

export const HeroSectionCards = () => {
    return (
        <div className="flex flex-col gap-5 lg:flex-row lg:justify-end lg:gap-10">
            {arr.map(({ Icon, text }) => (
                <Card key={text} className="lg:w-[200px] xl:w-[250px]">
                    <CardContent className="flex flex-col items-center gap-2 lg:w-[200px] xl:w-[250px]">
                        <Icon className="text-accent" />
                        <span className="text-muted-foreground">{text}</span>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
