import { dayjs } from '@/lib/dayjs';
import { TrpcRouterOutput } from '@/lib/trpc/client';
import { Card, CardContent } from '../ui/card';
import { UserInfo } from './user-info';

type Props = {
    comment: NonNullable<TrpcRouterOutput['blogPostComments']>['data'][number];
};

export const BlogPostComment = ({ comment }: Props) => {
    return (
        <Card>
            <CardContent>
                <div>
                    <UserInfo name={comment.User.name} avatarId={comment.User.avatarId} />
                    <div>
                        <p>{comment.User.name}</p>
                        <time className="text-muted-foreground" title="Commented at" dateTime={dayjs(comment.updatedAt).format('YYYY-MM-DD')}>
                            {dayjs(comment.updatedAt).format('MMMM D, YYYY')}
                        </time>
                    </div>
                </div>

                <p>{comment.content}</p>
            </CardContent>
        </Card>
    );
};
