'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { CreateNewPostDialog } from './create-new-post-dialog';

export const CreateNewPost = () => {
    const [open, setOpen] = useState(false);
    return (
        <>
            <CreateNewPostDialog open={open} setOpen={setOpen} />

            <Button size="lg" variant="secondary" onClick={() => setOpen(true)}>
                Create new post
            </Button>
        </>
    );
};
