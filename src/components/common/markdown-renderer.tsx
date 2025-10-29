/* eslint-disable @next/next/no-img-element */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
    content: string;
}

export const MarkdownRenderer = ({ content }: Props) => {
    return (
        <div className="">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => <h1 className="font-heading mt-2 scroll-m-20 text-4xl font-bold">{children}</h1>,
                    h2: ({ children }) => (
                        <h2 className="font-heading mt-12 scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">{children}</h2>
                    ),
                    h3: ({ children }) => <h3 className="font-heading mt-8 scroll-m-20 text-xl font-semibold tracking-tight">{children}</h3>,
                    p: ({ children }) => <p className="font-mono leading-7 [&:not(:first-child)]:mt-6">{children}</p>,
                    ul: ({ children }) => <ul className="my-6 ml-6 list-disc space-y-2">{children}</ul>,
                    ol: ({ children }) => <ol className="my-6 ml-6 list-decimal space-y-2">{children}</ol>,
                    blockquote: ({ children }) => <blockquote className="mb-4 border-l-4 border-gray-300 pl-4 italic">{children}</blockquote>,
                    code: ({ children }) => <code className="rounded bg-gray-100 px-1 py-0.5 text-sm dark:bg-gray-800">{children}</code>,
                    pre: ({ children }) => <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-100 p-4 dark:bg-gray-800">{children}</pre>,
                    img: ({ alt, src }) => <img alt={alt} src={src} className="object-cover grayscale-25 dark:opacity-95" />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
