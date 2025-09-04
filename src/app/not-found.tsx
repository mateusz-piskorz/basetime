import { NotFound } from '@/components/common/not-found';

export default async function Custom404() {
    return <NotFound title="This page could not be found" />;
}
