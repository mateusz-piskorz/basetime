import { CheckCircle, Crosshair, UserCheck2, Zap } from 'lucide-react';
import { HeroCard } from './hero-card';

const arr = [
    { text: 'Modern', Icon: Zap },
    { text: 'Accurate', Icon: Crosshair },
    { text: 'Simple', Icon: CheckCircle },
    { text: 'User-Friendly', Icon: UserCheck2 },
];

export const HeroCardList = () => {
    return (
        <div className="flex flex-col gap-5 lg:flex-row lg:justify-end lg:gap-10">
            {arr.map((p) => (
                <HeroCard key={p.text} {...p} />
            ))}
        </div>
    );
};
