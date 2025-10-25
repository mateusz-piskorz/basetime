'use client';

import { BlogPostComment } from '@/app/(main)/blog/[slug]/_partials/blog-post-comment';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { trpc, TrpcRouterInput } from '@/lib/trpc/client';
import { BlogPost } from '@prisma/client';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { AddCommentForm } from './add-comment-form';
import { CommentListInfiniteScroll } from './comment-list-infinite-scroll';

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
    const { reset, activeCommentThread, goBack } = useBlogCommentsSheet();
    const { data: activeComment } = trpc.blogPostComment.useQuery({ commentId: activeCommentThread! }, { enabled: Boolean(activeCommentThread) });
    const [sorting, setSorting] = useState<TrpcRouterInput['blogPostComments']['sorting']>('featured');

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

                {activeCommentThread ? (
                    <>{activeComment && <BlogPostComment initialDisplayResponses nestLevel={0} comment={activeComment} className="px-6" />}</>
                ) : (
                    <>
                        <AddCommentForm postId={post.id} />

                        <Select onValueChange={(val) => setSorting(val as typeof sorting)} value={sorting}>
                            <SelectTrigger className="mx-6 border-none bg-transparent dark:bg-transparent">
                                <SelectValue className="bg-transparent" />
                            </SelectTrigger>
                            <SelectContent>
                                {['featured', 'latest'].map((elem) => (
                                    <SelectItem key={elem} value={elem}>
                                        {elem}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <CommentListInfiniteScroll sorting={sorting} nestLevel={0} postId={post.id} parentId={null} />
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};
