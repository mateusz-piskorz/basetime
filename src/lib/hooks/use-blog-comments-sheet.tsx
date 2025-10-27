'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

type BlogCommentsSheetContextType = {
    activeCommentThread: { parentId: string | null; id: string } | null;
    limitQuery: number;
    setActiveCommentThread: (val: { parentId: string | null; id: string }) => void;
    goBack: () => void;
    reset: () => void;
    postId: string;
} | null;

const BlogCommentsSheetContext = createContext<BlogCommentsSheetContextType>(null);

export const BlogCommentsSheetProvider = ({ children, postId }: { children: ReactNode; postId: string }) => {
    const [activeCommentThreadPath, setActiveCommentThreadPath] = useState<{ parentId: string | null; id: string }[]>([]);

    return (
        <BlogCommentsSheetContext.Provider
            value={{
                postId,
                limitQuery: 30,
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
    const context = useContext(BlogCommentsSheetContext);

    if (!context) {
        throw new Error('useBlogCommentsSheet must be used within a <BlogCommentsSheetProvider />');
    }

    return context;
};
