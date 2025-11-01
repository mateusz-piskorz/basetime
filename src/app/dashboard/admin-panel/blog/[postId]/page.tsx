import { NotFound } from '@/components/common/not-found';
import { prisma } from '@/lib/prisma';
import { getAppEnv } from '@/lib/utils/common';
import { Editor } from './_partials/editor';
import { SeedBlogPostComments } from './_partials/seed-blog-post-comments';

type Props = { params: Promise<{ postId: string }> };

const PostPage = async ({ params }: Props) => {
    const { postId } = await params;
    const post = await prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) {
        return <NotFound title="Blog post not found" buttonText="Return to blog posts list" href={`/dashboard/admin-panel/blog`} />;
    }

    return (
        <div className="space-y-8 py-8">
            {getAppEnv() !== 'production' && <SeedBlogPostComments postId={post.id} />}

            <Editor post={post} />
        </div>
    );
};

export default PostPage;
