'use client';

import { UserInfo } from '@/components/common/user-info';
import { Button } from '@/components/ui/button';
import { dayjs } from '@/lib/dayjs';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { MessageCircle } from 'lucide-react';
import { ComponentProps, useRef, useState } from 'react';
import { AddCommentForm } from '../../common/add-comment-form';
import { CommentList } from './comment-list';
import { CommentUpvotesButton } from './comment-upvotes-button';

type Props = {
    comment: NonNullable<TrpcRouterOutput['blogPostComments']>['data'][number];
    nestLevel: number;
    className?: string;
    initialDisplayResponses?: boolean;
    infiniteQueryArgs: ComponentProps<typeof CommentUpvotesButton>['infiniteQueryArgs'];
};

const maxLength = 225;

export const Comment = ({ comment, nestLevel, className, initialDisplayResponses, infiniteQueryArgs }: Props) => {
    const { setActiveCommentThread, activeCommentThread } = useBlogCommentsSheet();
    const [displayResponses, setDisplayResponses] = useState(initialDisplayResponses);
    const [showReplyForm, setShowReplyForm] = useState(activeCommentThread?.id === comment.id);
    const [isExpanded, setIsExpanded] = useState(false);

    const isTooLong = comment.content.length > maxLength;
    const displayedText = !isTooLong ? comment.content : isExpanded ? comment.content : `${comment.content.substring(0, maxLength)}...`;

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

            <p className="font-sm">
                {displayedText}
                {isTooLong && !isExpanded && (
                    <Button className="text-muted-foreground inline-block pl-1" onClick={() => setIsExpanded(true)} variant="link">
                        more
                    </Button>
                )}
            </p>

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
            </div>

            {showReplyForm && (
                <AddCommentForm
                    onCancel={() => setShowReplyForm(false)}
                    onCommentAdded={onCommentAdded}
                    newCommentPosition="last"
                    parentId={comment.id}
                    infiniteQueryArgs={{ ...infiniteQueryArgs, parentId: comment.id, sorting: 'oldest' }}
                />
            )}
            {displayResponses && <CommentList listRef={listRef} sorting="oldest" nestLevel={nestLevel + 1} parentId={comment.id} />}
        </div>
    );
};
