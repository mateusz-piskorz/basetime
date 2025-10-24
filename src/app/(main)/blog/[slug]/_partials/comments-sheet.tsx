/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { BlogPostComment } from '@/components/common/blog-post-comment';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';
import { trpc } from '@/lib/trpc/client';
import { BlogPost } from '@prisma/client';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { AddCommentForm } from './add-comment-form';
import { CommentListCollapsibleInfiniteScroll } from './comment-list-collapsible-infinite-scroll';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
    post: BlogPost;
};

export const CommentsSheet = ({ open, setOpen, post }: Props) => {
    const { reset, activeCommentThread, goBack } = useBlogCommentsSheet();
    const { data: activeComment } = trpc.blogPostComment.useQuery({ commentId: activeCommentThread! }, { enabled: Boolean(activeCommentThread) });

    const [sorting, setSorting] = useState('featured');

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
                        <SheetTitle className="text-2xl">{activeCommentThread ? 'Replies' : `Responses (304)`}</SheetTitle>
                    </div>
                    <SheetDescription className="sr-only">responses to this blog post, added by other users</SheetDescription>
                </SheetHeader>
                {activeCommentThread ? (
                    <>{activeComment && <BlogPostComment initialDisplayResponses nestLevel={0} comment={activeComment} className="px-6" />}</>
                ) : (
                    <>
                        <AddCommentForm blogPostId={post.id} />

                        <Select onValueChange={setSorting} value={sorting}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {['featured', 'latest'].map((elem) => (
                                    <SelectItem key={elem} value={elem}>
                                        {elem}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <CommentListCollapsibleInfiniteScroll sorting={sorting as any} nestLevel={0} blogPostId={post.id} parentId={null} />
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
};
