'use client';

import { DocCardList } from './doc-card-list';
import { DocText } from './doc-text';

export const DocumentsSection = () => {
    return (
        <section
            className="bg-sidebar items-start space-y-24 py-24 lg:flex lg:space-y-0 lg:py-0 2xl:mx-auto 2xl:max-w-[1920px]"
            id="documents-section"
        >
            <DocText className="lg:sticky lg:top-0 lg:w-[40%] lg:py-24 2xl:py-40" />
            <DocCardList className="lg:w-[60%]" />
        </section>
    );
};
