'use client';

import ConfirmDialog from '@/components/common/confirm-dialog';
import { UserInfo } from '@/components/common/user-info';
import { Button } from '@/components/ui/button';
import { dayjs } from '@/lib/dayjs';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { deleteBlogPostComment } from '@/lib/server-actions/blog-post';
import { trpc, TrpcRouterOutput } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { MessageCircle } from 'lucide-react';
import { ComponentProps, useRef, useState } from 'react';
import { toast } from 'sonner';
import { AddCommentForm } from '../../common/add-comment-form';
import { CommentContent } from './_comment-content';
import { CommentList } from './_comment-list';
import { CommentUpvotesButton } from './_comment-upvotes-button';

type Props = {
    comment: NonNullable<TrpcRouterOutput['blogPostComments']>['data'][number];
    nestLevel: number;
    className?: string;
    initialDisplayResponses?: boolean;
    infiniteQueryArgs: ComponentProps<typeof CommentUpvotesButton>['infiniteQueryArgs'];
};

export const Comment = ({ comment, nestLevel, className, initialDisplayResponses, infiniteQueryArgs }: Props) => {
    const trpcUtils = trpc.useUtils();
    const { setActiveCommentThread, activeCommentThread } = useBlogCommentsSheet();
    const [displayResponses, setDisplayResponses] = useState(initialDisplayResponses);
    const [showReplyForm, setShowReplyForm] = useState(activeCommentThread?.id === comment.id);

    const [confirmOpen, setConfirmOpen] = useState(false);

    const listRef = useRef<HTMLUListElement | null>(null);
    const onCommentAdded = () => {
        setShowReplyForm(false);
        const node = listRef.current;
        if (node) {
            node.scrollIntoView({
                block: 'end',
                behavior: 'smooth',
            });
        }
    };

    return (
        <div className={cn('flex flex-col gap-6 rounded py-6', className)}>
            <ConfirmDialog
                onContinue={async () => {
                    const res = await deleteBlogPostComment({ commentId: comment.id });
                    if (res.success) {
                        await trpcUtils.blogPostComments.refetch();
                        setConfirmOpen(false);
                        toast.success('comment removed successfully', { duration: 1500 });
                    } else {
                        toast.error(res.message || 'something went wrong - deleteBlogPostComment');
                    }
                }}
                open={confirmOpen}
                setOpen={setConfirmOpen}
                title="Do you really want to remove comment"
                description='"This action cannot be undone. Comment will be removed permanently"'
            />

            <div className="flex gap-2">
                <UserInfo
                    currentUserIndicator={comment.isOwner}
                    name={comment.Author.name}
                    avatarId={comment.Author.avatarId}
                    textUnder={
                        <time className="text-muted-foreground" title="Commented at" dateTime={dayjs(comment.updatedAt).format('YYYY-MM-DD')}>
                            {dayjs(comment.updatedAt).format('MMMM D, YYYY')}
                        </time>
                    }
                />
            </div>

            <CommentContent comment={comment} />

            <div className="flex items-center">
                <CommentUpvotesButton
                    upvotes={comment._count.Upvotes}
                    commentId={comment.id}
                    upvoted={comment.upvotedByUser}
                    infiniteQueryArgs={infiniteQueryArgs}
                />

                <Button
                    variant="ghost"
                    onClick={() => {
                        if (comment._count.Replies === 0) return;

                        if (nestLevel >= 2) {
                            setActiveCommentThread({ id: comment.id, parentId: comment.parentId });
                            return;
                        }

                        setDisplayResponses((prev) => !prev);
                    }}
                >
                    <MessageCircle /> {comment._count.Replies}
                </Button>

                <Button
                    disabled={Boolean(comment.deleted)}
                    variant="ghost"
                    onClick={() => {
                        if (nestLevel >= 2) {
                            setActiveCommentThread({ id: comment.id, parentId: comment.parentId });
                            return;
                        }
                        if (showReplyForm) {
                            setShowReplyForm(false);
                        } else {
                            setShowReplyForm(true);
                            setDisplayResponses(true);
                        }
                    }}
                >
                    Reply
                </Button>
                {comment.isOwner && !comment.deleted && (
                    <Button className="ml-4" variant="destructive" onClick={() => setConfirmOpen(true)}>
                        remove
                    </Button>
                )}
            </div>

            {showReplyForm && (
                <AddCommentForm
                    onCancel={() => setShowReplyForm(false)}
                    onCommentAdded={onCommentAdded}
                    parentComment={comment}
                    infiniteQueryArgs={{ ...infiniteQueryArgs, parentId: comment.id, sorting: 'oldest' }}
                />
            )}

            {displayResponses && <CommentList listRef={listRef} sorting="oldest" nestLevel={nestLevel + 1} parentId={comment.id} />}
        </div>
    );
};
