import dayjs from 'dayjs';
import * as Minio from 'minio';
import 'server-only';

type Bucket = 'main' | 'public';

export const minioClient = new Minio.Client({
    endPoint: process.env.NEXT_PUBLIC_MINIO_ENDPOINT!,
    port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : undefined,
    accessKey: process.env.MINIO_USER,
    secretKey: process.env.MINIO_PASSWORD,
    useSSL: process.env.MINIO_SSL === 'true',
});

export const uploadFile = async ({
    bucket,
    file,
    fileName,
    contentType,
}: {
    bucket: Bucket;
    fileName: string;
    file: Buffer;
    contentType?: string;
}) => {
    await minioClient.putObject(bucket, fileName, file, undefined, contentType ? { 'Content-Type': contentType } : undefined);
};

export const deleteFile = async ({ bucket, fileName }: { bucket: Bucket; fileName: string }) => {
    await minioClient.removeObject(bucket, fileName);
};

export const listObjects = async ({ bucket, fileName }: { bucket: Bucket; fileName: string }) => {
    try {
        const data: Minio.BucketItem[] = [];
        const stream = minioClient.listObjectsV2(bucket, fileName);

        await new Promise<void>((resolve, reject) => {
            stream.on('data', (obj) => data.push(obj));
            stream.on('end', () => resolve());
            stream.on('error', (err) => reject(err));
        });

        return data;
    } catch {
        return undefined;
    }
};

export const getStatObject = async ({ bucket, fileName }: { bucket: Bucket; fileName: string }) => {
    try {
        return await minioClient.statObject(bucket, fileName);
    } catch {
        return undefined;
    }
};

const getPresignedUrl = async ({ bucket, fileName }: { bucket: Bucket; fileName: string }) => {
    try {
        const { lastModified } = await minioClient.statObject(bucket, fileName);

        const midnight = dayjs().startOf('day').toDate();
        const isDateNewer = dayjs(lastModified).diff(midnight) > 0;
        const responseDate = isDateNewer ? lastModified : midnight;

        return await minioClient.presignedGetObject(bucket, fileName, 24 * 60 * 60, { 'response-content-type': 'image/png' }, responseDate);
    } catch {
        return undefined;
    }
};

export const getOrgLogoUrl = async ({ organizationId }: { organizationId: string }) => {
    return await getPresignedUrl({ bucket: 'main', fileName: `organization/${organizationId}/logo.png` });
};
