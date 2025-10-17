import { listObjects } from '@/lib/minio';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AddNewImg } from './_partials/add-new-img';
import { ImgCard } from './_partials/img-card';

const PublicImagesPage = async () => {
    const user = await getSession();
    if (!user) return redirect('/');
    if (user.role !== 'ADMIN') return redirect('/dashboard');

    const objects = await listObjects({ bucket: 'public', fileName: 'blog/' });

    return (
        <div className="flex flex-col items-center gap-4 py-12">
            <AddNewImg />

            {objects?.map((obj) => {
                const url =
                    process.env.MINIO_ENDPOINT === 'localhost'
                        ? `http://localhost:9000/public/${obj.name}`
                        : `https://${process.env.MINIO_ENDPOINT}/public/${obj.name}`;
                return <ImgCard imgName={`${obj.name}`} alt={obj.name || ''} url={url} key={obj.etag} />;
            })}
        </div>
    );
};

export default PublicImagesPage;
