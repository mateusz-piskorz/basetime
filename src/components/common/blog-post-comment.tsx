import { dayjs } from '@/lib/dayjs';
import { Card, CardContent } from '../ui/card';
import { UserInfo } from './user-info';

type Props = {
    author: {
        name: string;
        email: string;
    };
    content: string;
    updatedAt: Date;
};

export const BlogPostComment = ({ author, content, updatedAt }: Props) => {
    return (
        <Card>
            <CardContent>
                <div>
                    <UserInfo onlyAvatar user={author} />
                    <div>
                        <p>{author.name}</p>
                        <time className="text-muted-foreground" title="Commented at" dateTime={dayjs(updatedAt).format('YYYY-MM-DD')}>
                            {dayjs(updatedAt).format('MMMM D, YYYY')}
                        </time>
                    </div>
                </div>

                <p>{content}</p>
            </CardContent>
        </Card>
    );
};
