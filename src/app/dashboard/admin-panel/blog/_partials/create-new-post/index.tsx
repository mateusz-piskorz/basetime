'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
import { CreateNewPostDialog } from './create-new-post-dialog';

export const CreateNewPost = () => {
    const [open, setOpen] = React.useState(false);
    return (
        <>
            <CreateNewPostDialog open={open} setOpen={setOpen} />

            <Button size="lg" variant="secondary" onClick={() => setOpen(true)}>
                Create new post
            </Button>
        </>
    );
};
