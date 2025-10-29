'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { trpc } from '@/lib/trpc/client';
import { BlogPost } from '@prisma/client';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { AddCommentForm } from '../common/add-comment-form';
import { Comment } from '../common/comment';
import { ListInfiniteScroll } from './_list-infinite-scroll';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
    post: {
        _count: {
            Comments: number;
            Upvotes: number;
        };
    } & BlogPost;
};

export const CommentsSheet = ({ open, setOpen, post }: Props) => {
    const { reset, activeCommentThread, goBack, limitQuery, sorting, setSorting } = useBlogCommentsSheet();

    const { data } = trpc.blogPostComments.useInfiniteQuery(
        {
            parentId: activeCommentThread?.parentId ?? null,
            postId: post.id,
            sorting: 'oldest',
            limit: limitQuery,
        },
        {
            enabled: Boolean(activeCommentThread),
            getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
            initialCursor: 1,
        },
    );

    const activeComment = useMemo(() => {
        if (!activeCommentThread) return null;

        const infComments = data?.pages.flatMap(({ data }) => data);

        return infComments?.find((comment) => comment.id === activeCommentThread.id);
    }, [data, activeCommentThread]);

    useEffect(() => {
        if (activeCommentThread && !activeComment) {
            goBack();
        }
    }, [activeComment, activeCommentThread, goBack]);

    return (
        <Sheet
            open={open}
            onOpenChange={(val) => {
                setOpen(val);
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
                        infiniteQueryArgs={{ postId: post.id, limit: limitQuery, parentId: activeCommentThread.parentId, sorting: 'oldest' }}
                        initialDisplayResponses
                        nestLevel={0}
                        comment={activeComment}
                        className="px-6"
                    />
                ) : (
                    <>
                        <AddCommentForm infiniteQueryArgs={{ postId: post.id, limit: limitQuery, parentId: null, sorting }} />

                        <Select onValueChange={(val) => setSorting(val as typeof sorting)} value={sorting}>
                            <SelectTrigger className="mx-6 border bg-transparent dark:bg-transparent">
                                <SelectValue className="bg-transparent" />
                            </SelectTrigger>
                            <SelectContent>
                                {['featured', 'latest', 'oldest'].map((elem) => (
                                    <SelectItem key={elem} value={elem}>
                                        {elem}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <ListInfiniteScroll nestLevel={0} parentId={null} />
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};
