'use client';
import React, { createContext, ReactNode } from 'react';
import { TrpcRouterInput } from '../trpc/client';

type BlogCommentsSheetContextType = {
    activeCommentThread: { parentId: string | null; id: string } | null;
    limit: number;
    setActiveCommentThread: (val: { parentId: string | null; id: string }) => void;
    goBack: () => void;
    reset: () => void;
    postId: string;
    sorting: TrpcRouterInput['blogPostComments']['sorting'];
    setSorting: (val: TrpcRouterInput['blogPostComments']['sorting']) => void;
    sheetOpen: boolean;
    setSheetOpen: (val: boolean) => void;
} | null;

const BlogCommentsSheetContext = createContext<BlogCommentsSheetContextType>(null);

export const BlogCommentsSheetProvider = ({ children, postId }: { children: ReactNode; postId: string }) => {
    const [sheetOpen, setSheetOpen] = React.useState(false);
    const [activeCommentThreadPath, setActiveCommentThreadPath] = React.useState<{ parentId: string | null; id: string }[]>([]);
    const [sorting, setSorting] = React.useState<TrpcRouterInput['blogPostComments']['sorting']>('featured');

    return (
        <BlogCommentsSheetContext.Provider
            value={{
                sheetOpen,
                setSheetOpen,
                sorting,
                setSorting,
                postId,
                limit: 30,
                activeCommentThread: activeCommentThreadPath[activeCommentThreadPath.length - 1] || null,
                goBack: () => setActiveCommentThreadPath((prevPath) => prevPath.slice(0, -1)),
                setActiveCommentThread: (val: { parentId: string | null; id: string }) => setActiveCommentThreadPath((prev) => [...prev, val]),
                reset: () => setActiveCommentThreadPath([]),
            }}
        >
            {children}
        </BlogCommentsSheetContext.Provider>
    );
};

export const useBlogCommentsSheet = () => {
    const context = React.useContext(BlogCommentsSheetContext);

    if (!context) {
        throw new Error('useBlogCommentsSheet must be used within a <BlogCommentsSheetProvider />');
    }

    return context;
};
