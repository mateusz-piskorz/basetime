'use client';

import { KanbanBoard, KanbanCards, KanbanHeader, KanbanProvider } from '@/components/ui/kanban';
import { useState } from 'react';
import { columns, exampleFeatures } from './_constant';
import { KanbanCard } from './_kanban-card';

export const Kanban = () => {
    const [features, setFeatures] = useState(exampleFeatures);

    console.log(features);

    return (
        <KanbanProvider columns={columns} data={features} onDataChange={setFeatures}>
            {(column) => (
                <KanbanBoard id={column.id} key={column.id}>
                    <KanbanHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
                            <span>{column.name}</span>
                        </div>
                    </KanbanHeader>
                    <KanbanCards id={column.id}>
                        {(feature: (typeof features)[number]) => {
                            return <KanbanCard key={feature.id} feature={feature} columnId={column.id} />;
                        }}
                    </KanbanCards>
                </KanbanBoard>
            )}
        </KanbanProvider>
    );
};
