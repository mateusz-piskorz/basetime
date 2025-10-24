'use client';

import { AddCommentForm } from '@/app/(main)/blog/[slug]/_partials/add-comment-form';
import { BlogUpvoteButton } from '@/app/(main)/blog/[slug]/_partials/blog-upvote-button';
import { CommentList } from '@/app/(main)/blog/[slug]/_partials/comment-list';
import { dayjs } from '@/lib/dayjs';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';
import { MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { UserInfo } from '../../../../../components/common/user-info';
import { Button } from '../../../../../components/ui/button';

type Props = {
    comment: NonNullable<TrpcRouterOutput['blogPostComments']>['data'][number];
    nestLevel: number;
    className?: string;
    initialDisplayResponses?: boolean;
};

const maxLength = 225;

export const BlogPostComment = ({ comment, nestLevel, className, initialDisplayResponses }: Props) => {
    const { setActiveCommentThread } = useBlogCommentsSheet();
    const [displayResponses, setDisplayResponses] = useState(initialDisplayResponses);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const isTooLong = comment.content.length > maxLength;
    const displayedText = !isTooLong ? comment.content : isExpanded ? comment.content : `${comment.content.substring(0, maxLength)}...`;

    return (
        <div className={cn('flex flex-col gap-6 rounded py-6', className)}>
            <div className="flex gap-2">
                <UserInfo
                    name={comment.User.name}
                    avatarId={comment.User.avatarId}
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
                <BlogUpvoteButton upvotes={comment._count.Upvotes} voteType="comment" entityId={comment.id} />

                <Button
                    variant="ghost"
                    onClick={() => {
                        if (comment._count.Replies === 0) return;

                        if (nestLevel >= 2) {
                            setActiveCommentThread(comment.id);
                            return;
                        }

                        setDisplayResponses(true);
                    }}
                >
                    <MessageCircle /> {comment._count.Replies}
                </Button>

                <Button variant="ghost" onClick={() => setShowReplyForm((prev) => !prev)}>
                    Reply
                </Button>
            </div>

            {showReplyForm && <AddCommentForm blogPostId={comment.blogPostId} parentId={comment.id} />}
            {displayResponses && <CommentList sorting="oldest" nestLevel={nestLevel + 1} blogPostId={comment.blogPostId} parentId={comment.id} />}
        </div>
    );
};
