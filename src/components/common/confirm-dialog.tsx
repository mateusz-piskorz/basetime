'use client';

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ComponentProps, useState } from 'react';

type Props = {
    title: string;
    description?: string;
    continueButtonText?: string;
    onContinue: () => Promise<void> | void;
    open: boolean;
    setOpen: (open: boolean) => void;
    buttonVariant?: ComponentProps<typeof Button>['variant'];
};

const ConfirmDialog = ({ title, description, open, continueButtonText, setOpen, onContinue, buttonVariant }: Props) => {
    const [loading, setLoading] = useState(false);
    const continueHandler = async () => {
        setLoading(true);
        await onContinue();
        setLoading(false);
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                    <Button variant={buttonVariant} disabled={loading} onClick={continueHandler}>
                        {continueButtonText || 'Continue'}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default ConfirmDialog;
