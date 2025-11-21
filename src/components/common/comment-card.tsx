'use client';

import { Button } from '@/components/ui/button';
import { dayjs } from '@/lib/dayjs';
import { cn } from '@/lib/utils/common';

import { PenSquare } from 'lucide-react';
import React from 'react';
import { CommentForm } from './comment-form';
import { UserInfo } from './user-info';

export type Props = {
    content: string;
    deleted?: boolean | null;
    isOwner: boolean;
    updatedAt: string;
    author: {
        name: string;
        avatarId: string | null;
    };
    onEdit?: React.ComponentProps<typeof CommentForm>['onSubmit'];
};

const maxLength = 225;

export const CommentCard = ({ content, deleted, author, isOwner, updatedAt, onEdit }: Props) => {
    const [editing, setEditing] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const isTooLong = content.length > maxLength;

    return (
        <div className="space-y-4">
            <div>
                <div className="flex">
                    <div className="flex gap-2">
                        <UserInfo
                            currentUserIndicator={isOwner}
                            name={author.name}
                            avatarId={author.avatarId}
                            textUnder={
                                <time className="text-muted-foreground" title="Commented at" dateTime={dayjs(updatedAt).format('YYYY-MM-DD')}>
                                    {dayjs(updatedAt).format('MMMM D, YYYY')}
                                </time>
                            }
                        />
                    </div>
                    {isOwner && onEdit && (
                        <Button variant="ghost" onClick={() => setEditing((prev) => !prev)}>
                            <span className="sr-only">edit comment</span>
                            <PenSquare className="size-4" />
                        </Button>
                    )}
                </div>
            </div>
            {editing && onEdit ? (
                <CommentForm
                    autoFocus
                    initContent={content}
                    onCancel={() => {
                        setEditing(false);
                    }}
                    onSubmit={async (arg) => {
                        await onEdit(arg);
                        setEditing(false);
                    }}
                />
            ) : (
                <p className={cn('font-sm', deleted && 'line-through')}>
                    {deleted ? '(comment removed)' : !isTooLong || isExpanded ? content : `${content.substring(0, maxLength)}...`}
                    {isTooLong && !isExpanded && (
                        <Button className="text-muted-foreground pl-1" onClick={() => setIsExpanded(true)} variant="link">
                            more
                        </Button>
                    )}
                </p>
            )}
        </div>
    );
};
