'use client';

import { DashboardHeading } from '@/components/common/dashboard-heading';
import { useState } from 'react';
import { Kanban } from './_kanban';
import { ActionButton } from './common/action-button';
import { UpsertStatusColumnDialog } from './common/upsert-status-column-dialog';
import { UpsertTaskDialog } from './common/upsert-task-dialog';

export const SectionKanban = () => {
    const [open, setOpen] = useState(false);
    const [openColumnDialog, setOpenColumnDialog] = useState(false);

    return (
        <>
            <UpsertStatusColumnDialog open={openColumnDialog} setOpen={setOpenColumnDialog} />
            <UpsertTaskDialog open={open} setOpen={setOpen} />

            <div className="space-y-8 px-4 py-8 md:px-8">
                <div className="flex flex-wrap items-center justify-between gap-x-10">
                    <DashboardHeading className="mb-0" title="Tasks" description="Preview and Manage organization Tasks" />
                    <ActionButton onTaskClick={() => setOpen(true)} onStatusClick={() => setOpenColumnDialog(true)} />
                </div>
                <Kanban />
            </div>
        </>
    );
};
