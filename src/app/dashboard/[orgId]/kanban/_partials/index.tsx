'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Kanban } from './_kanban';
import { UpsertTaskDialog } from './_upsert-task-dialog';
import { UpsertColumnDialog } from './common/upsert-column-dialog';

export const SectionKanban = () => {
    const [open, setOpen] = useState(false);
    const [openColumnDialog, setOpenColumnDialog] = useState(false);

    return (
        <div className="space-y-8 px-4 py-8 md:px-8">
            <UpsertColumnDialog open={openColumnDialog} setOpen={setOpenColumnDialog} />
            <UpsertTaskDialog open={open} setOpen={setOpen} />
            <div className="flex flex-wrap items-center justify-between gap-x-10">
                <DashboardHeading className="mb-0" title="Tasks" description="Preview and Manage organization Tasks" />
                <Button onClick={() => setOpen(true)}>Add new Task</Button>
                <Button onClick={() => setOpenColumnDialog(true)}>Add new Column</Button>
            </div>
            <Kanban />
        </div>
    );
};
