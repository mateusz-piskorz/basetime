'use client';

import { ProgressBar } from '@/components/common/progress-bar';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { dayjs } from '@/lib/dayjs';
import { trpc } from '@/lib/trpc/client';
import { formatMinutes } from '@/lib/utils/common';
import { X } from 'lucide-react';
import { DescriptionForm } from './_description_form';
import { DetailsForm } from './_details_form';
import { TitleForm } from './_title_form';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
    taskId: string | null | undefined;
};

export const TaskSheet = ({ open, setOpen, taskId }: Props) => {
    const { data: task } = trpc.task.useQuery({ taskId: taskId! }, { enabled: Boolean(taskId) });

    return (
        <Sheet open={open} onOpenChange={setOpen} modal={false}>
            <SheetContent
                hideCloseIcon
                side="right"
                className="bg-card h-screen w-full max-w-full space-y-5 overflow-auto pt-6 pb-12 sm:max-w-md"
                useNonModalOverlay
            >
                <SheetHeader className="my-0 px-4 py-0">
                    <div className="flex justify-between">
                        <SheetClose>
                            <X />
                            <span className="sr-only">Close</span>
                        </SheetClose>
                        <SheetTitle className="mr-2 font-normal italic">Task-{task?.taskNumber}</SheetTitle>
                    </div>
                    <SheetDescription className="sr-only">Preview and Manage organization Task-{task?.taskNumber}</SheetDescription>
                </SheetHeader>
                <Separator />
                {task && (
                    <>
                        <div className="space-y-6 px-4 text-sm">
                            <TitleForm task={task} />
                            <ProgressBar percentCompleted={task.percentCompleted ?? 0} />
                            <div className="flex justify-between">
                                <div className="flex gap-2">
                                    <p>Created time</p>
                                </div>
                                <p>{dayjs(task?.createdAt).format('MMMM D, YYYY h:m a')}</p>
                            </div>

                            <div className="flex justify-between">
                                <div className="flex gap-2">
                                    <p>Logged Time</p>
                                </div>
                                <p>{formatMinutes(task.loggedMinutes)}</p>
                            </div>
                        </div>

                        <Separator />

                        <DetailsForm task={task} />

                        <Separator />

                        <DescriptionForm task={task} />
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};
