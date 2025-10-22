'use client';

import { BlogPostComment } from '@/components/common/blog-post-comment';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { trpc } from '@/lib/trpc/client';
import { BlogPost } from '@prisma/client';
import { AddCommentForm } from './add-comment-form';

type Props = {
    open: boolean;
    setOpen: (val: boolean) => void;
    post: BlogPost;
};

export const CommentsSheet = ({ open, setOpen, post }: Props) => {
    const { data } = trpc.blogPostComments.useQuery({ blogPostId: post.id, limit: 50 });
    return (
        <Sheet open={open} onOpenChange={setOpen} modal={false}>
            <SheetHeader className="sr-only">
                <SheetTitle>Comments</SheetTitle>
                <SheetDescription>Comments description</SheetDescription>
            </SheetHeader>

            <SheetContent side="right" className="bg-card w-full max-w-full px-8 py-12 sm:max-w-md" useNonModalOverlay>
                <AddCommentForm blogPostId={post.id} />
                <ul>
                    {data?.data.map((comment) => (
                        <li key={comment.id}>
                            <BlogPostComment comment={comment} />
                        </li>
                    ))}
                </ul>
                Here comments
            </SheetContent>
        </Sheet>
    );
};
