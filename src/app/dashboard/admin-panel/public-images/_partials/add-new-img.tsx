'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { NewImgDialog } from './new-img-dialog';

export const AddNewImg = () => {
    const [open, setOpen] = useState(false);
    return (
        <div>
            <Button onClick={() => setOpen(true)}>Add new img</Button>
            <NewImgDialog open={open} setOpen={setOpen} />
        </div>
    );
};
