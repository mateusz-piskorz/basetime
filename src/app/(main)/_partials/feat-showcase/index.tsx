import { FeatShowcaseList } from './_feat-showcase-list';
import { FeatShowcaseText } from './_feat-showcase-text';

export const FeatShowcase = () => {
    return (
        <section className="bg-sidebar items-start space-y-24 py-24 lg:flex lg:space-y-0 lg:py-0 2xl:mx-auto 2xl:max-w-[1920px]" id="feat-showcase">
            <FeatShowcaseText />
            <FeatShowcaseList />
        </section>
    );
};
