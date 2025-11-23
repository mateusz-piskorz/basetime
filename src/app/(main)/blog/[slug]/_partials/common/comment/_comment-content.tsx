import React from 'react';
import { Button } from '@/components/ui/button';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { cn } from '@/lib/utils/common';

type Props = {
    comment: NonNullable<TrpcRouterOutput['blogPostComments']>['data'][number];
};

const maxLength = 225;

export const CommentContent = ({ comment }: Props) => {
    const [isExpanded, setIsExpanded] = React.useState(false);
    const isTooLong = comment.content.length > maxLength;

    return (
        <p className={cn('font-sm', comment.deleted && 'line-through')}>
            {comment.deleted ? '(comment removed)' : !isTooLong || isExpanded ? comment.content : `${comment.content.substring(0, maxLength)}...`}

            {isTooLong && !isExpanded && (
                <Button className="text-muted-foreground pl-1" onClick={() => setIsExpanded(true)} variant="link">
                    more
                </Button>
            )}
        </p>
    );
};
