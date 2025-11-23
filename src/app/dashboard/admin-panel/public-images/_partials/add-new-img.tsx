'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
import { NewImgDialog } from './new-img-dialog';

export const AddNewImg = () => {
    const [open, setOpen] = React.useState(false);
    return (
        <div>
            <Button onClick={() => setOpen(true)}>Add new img</Button>
            <NewImgDialog open={open} setOpen={setOpen} />
        </div>
    );
};
