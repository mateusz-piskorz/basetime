'use client';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { trpc } from '@/lib/trpc/client';
import { BlogPost } from '@prisma/client';
import { ChevronLeft } from 'lucide-react';
import React from 'react';
import { AddCommentForm } from './_add-comment-form';
import { ListInfiniteScroll } from './_list-infinite-scroll';
import { SelectSorting } from './_select-sorting';
import { Comment } from './comment';

type Props = {
    post: {
        _count: {
            Comments: number;
            Upvotes: number;
        };
    } & BlogPost;
};

export const CommentsSheet = ({ post }: Props) => {
    const { reset, activeCommentThread, goBack, limit, sorting, sheetOpen, setSheetOpen } = useBlogCommentsSheet();

    const { data } = trpc.blogPostComments.useInfiniteQuery(
        {
            parentId: activeCommentThread?.parentId ?? null,
            postId: post.id,
            sorting: 'oldest',
            limit,
        },
        {
            enabled: Boolean(activeCommentThread),
            getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
            initialCursor: 1,
        },
    );

    const activeComment = React.useMemo(() => {
        if (!activeCommentThread) return null;
        return data?.pages.flatMap(({ data }) => data).find((comment) => comment.id === activeCommentThread.id);
    }, [data, activeCommentThread]);

    React.useEffect(() => {
        if (activeCommentThread && !activeComment) goBack();
    }, [activeComment, activeCommentThread, goBack]);

    return (
        <Sheet
            open={sheetOpen}
            onOpenChange={(val) => {
                setSheetOpen(val);
                if (val === false) reset();
            }}
            modal={false}
        >
            <SheetContent side="right" className="bg-card h-screen w-full max-w-full overflow-auto pt-6 pb-12 sm:max-w-md" useNonModalOverlay>
                <SheetHeader className="px-6">
                    <div className="flex items-center">
                        {activeCommentThread && (
                            <Button onClick={goBack} variant="ghost" className="mr-2 px-1 pl-0">
                                <span className="sr-only">go back</span>
                                <ChevronLeft className="size-6" />
                            </Button>
                        )}
                        <SheetTitle className="text-2xl">{activeCommentThread ? 'Replies' : `Responses (${post._count.Comments})`}</SheetTitle>
                    </div>
                    <SheetDescription className="sr-only">responses to this blog post, added by other users</SheetDescription>
                </SheetHeader>

                {activeCommentThread && activeComment ? (
                    <Comment
                        infiniteQueryArgs={{ postId: post.id, limit, parentId: activeCommentThread.parentId, sorting: 'oldest' }}
                        initialDisplayResponses
                        nestLevel={0}
                        comment={activeComment}
                        className="px-6"
                    />
                ) : (
                    <>
                        <AddCommentForm infiniteQueryArgs={{ postId: post.id, limit, parentId: null, sorting }} />
                        <SelectSorting />
                        <ListInfiniteScroll nestLevel={0} parentId={null} />
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};
