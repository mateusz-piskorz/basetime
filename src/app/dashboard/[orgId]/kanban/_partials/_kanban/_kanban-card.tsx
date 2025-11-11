import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { KanbanCard as KanbanCardUI } from '@/components/ui/kanban';
import { dateFormatter, exampleFeatures, shortDateFormatter } from './_constant';

type Props = {
    columnId: string;
    feature: (typeof exampleFeatures)[number];
};

export const KanbanCard = ({ columnId, feature }: Props) => {
    return (
        <KanbanCardUI column={columnId} id={feature.id} name={feature.name}>
            <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <p className="m-0 flex-1 text-sm font-medium">{feature.name}</p>
                </div>
                {feature.owner && (
                    <Avatar className="h-4 w-4 shrink-0">
                        <AvatarImage src={feature.owner.image} />
                        <AvatarFallback>{feature.owner.name?.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                )}
            </div>
            <p className="text-muted-foreground m-0 text-xs">
                {shortDateFormatter.format(feature.startAt)} - {dateFormatter.format(feature.endAt)}
            </p>
        </KanbanCardUI>
    );
};
