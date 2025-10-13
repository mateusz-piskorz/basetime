'use client';

import { BlogSectionDesktop } from './desktop';
import { BlogSectionMobile } from './mobile';

export const BlogSection = () => {
    return (
        <>
            <BlogSectionMobile />
            <BlogSectionDesktop />
        </>
    );
};
