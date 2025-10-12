import { BlogCard } from './blog-card';

const arr = [
    {
        badges: ['UI/UX', 'Inspiration', 'Graphic Design'],
        date: new Date(),
        readTime: '9min read',
        title: 'Why Dogs Make Great CompanionsWith Humans',
        description:
            'Dogs offer loyalty, friendship, and unconditional love. Their playful energy and protective instincts make them wonderful additions to any family.',
        imgSrc: '/dog-blog-post.png',
        href: '#',
    },
    {
        badges: ['UI/UX', 'Inspiration', 'Graphic Design'],
        date: new Date(),
        readTime: '9min read',
        title: 'Why Dogs Make Great CompanionsWith Humans',
        description:
            'Dogs offer loyalty, friendship, and unconditional love. Their playful energy and protective instincts make them wonderful additions to any family.',
        imgSrc: '/dog-blog-post.png',
        href: '#',
    },
    {
        badges: ['UI/UX', 'Inspiration', 'Graphic Design'],
        date: new Date(),
        readTime: '9min read',
        title: 'Why Dogs Make Great CompanionsWith Humans',
        description:
            'Dogs offer loyalty, friendship, and unconditional love. Their playful energy and protective instincts make them wonderful additions to any family.',
        imgSrc: '/dog-blog-post.png',
        href: '#',
    },
    {
        badges: ['UI/UX', 'Inspiration', 'Graphic Design'],
        date: new Date(),
        readTime: '9min read',
        title: 'Why Dogs Make Great CompanionsWith Humans',
        description:
            'Dogs offer loyalty, friendship, and unconditional love. Their playful energy and protective instincts make them wonderful additions to any family.',
        imgSrc: '/dog-blog-post.png',
        href: '#',
    },
];

export const BlogCardsList = () => {
    return (
        <div className="flex gap-6 overflow-x-auto pb-4 pl-5 sm:pl-6 md:pl-8 lg:pl-10 2xl:pl-20">
            {arr.map((args, index) => (
                <BlogCard key={index} {...args} />
            ))}
        </div>
    );
};
