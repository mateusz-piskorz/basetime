'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

type BlogCommentsSheetContextType = {
    activeCommentThread: string | null;
    setActiveCommentThread: (parentId: string) => void;
    goBack: () => void;
    reset: () => void;
} | null;

const BlogCommentsSheetContext = createContext<BlogCommentsSheetContextType>(null);

export const BlogCommentsSheetProvider = ({ children }: { children: ReactNode }) => {
    const [activeCommentThreadPath, setActiveCommentThreadPath] = useState<string[]>([]);

    return (
        <BlogCommentsSheetContext.Provider
            value={{
                activeCommentThread: activeCommentThreadPath[activeCommentThreadPath.length - 1] || null,
                goBack: () => setActiveCommentThreadPath((prevPath) => prevPath.slice(0, -1)),
                setActiveCommentThread: (parentId: string) => setActiveCommentThreadPath((prev) => [...prev, parentId]),
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
