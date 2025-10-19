import { NotFound } from '@/components/common/not-found';
import { prisma } from '@/lib/prisma';
import { Editor } from './_partials/editor';

type Props = { params: Awaited<{ postId: string }> };

const PostPage = async ({ params }: Props) => {
    const { postId } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
        return <NotFound title="Blog post not found" buttonText="Return to blog posts list" href={`/dashboard/admin-panel/blog`} />;
    }

    return (
        <div className="space-y-8 py-8">
            <Editor post={post} />
        </div>
    );
};

export default PostPage;
