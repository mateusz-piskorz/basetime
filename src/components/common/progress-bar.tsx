type Props = {
    percentCompleted: number;
};

export const ProgressBar = ({ percentCompleted }: Props) => {
    return (
        <div className="w-full">
            <div className="text-muted-foreground mb-1 flex justify-between text-xs">
                <span>Progress</span>
                <span>{percentCompleted ?? 0}%</span>
            </div>
            <div className="bg-muted h-2.5 w-full overflow-hidden rounded">
                <div
                    className="bg-accent-secondary h-2.5 w-full rounded"
                    style={{
                        transform: `scaleX(${Math.min(Number(percentCompleted ?? 0), 100) / 100})`,
                        transformOrigin: 'left',
                    }}
                />
            </div>
        </div>
    );
};
