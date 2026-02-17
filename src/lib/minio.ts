import dayjs from 'dayjs';
import * as Minio from 'minio';
import 'server-only';

type BucketName = 'public' | 'private';

const bucketMap = {
    public: process.env.MINIO_BUCKET_PUBLIC ?? '',
    private: process.env.MINIO_BUCKET_PRIVATE ?? '',
};

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: Number(process.env.MINIO_PORT),
    useSSL: process.env.MINIO_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY,
});

export const uploadFile = async (args: { bucketName: BucketName; fileName: string; file: Buffer; contentType?: string }) => {
    const { bucketName, file, fileName, contentType } = args;
    await minioClient.putObject(bucketMap[bucketName], fileName, file, undefined, contentType ? { 'Content-Type': contentType } : undefined);
};

export const deleteFile = async ({ bucketName, fileName }: { bucketName: BucketName; fileName: string }) => {
    await minioClient.removeObject(bucketMap[bucketName], fileName);
};

export const listObjects = async ({ bucketName, fileName }: { bucketName: BucketName; fileName: string }) => {
    try {
        const data: Minio.BucketItem[] = [];
        const stream = minioClient.listObjectsV2(bucketMap[bucketName], fileName);

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

export const getStatObject = async ({ bucketName, fileName }: { bucketName: BucketName; fileName: string }) => {
    try {
        return await minioClient.statObject(bucketMap[bucketName], fileName);
    } catch {
        return undefined;
    }
};

const getPresignedUrl = async ({ bucketName, fileName }: { bucketName: BucketName; fileName: string }) => {
    try {
        const { lastModified } = await minioClient.statObject(bucketMap[bucketName], fileName);

        const midnight = dayjs().startOf('day').toDate();
        const isDateNewer = dayjs(lastModified).diff(midnight) > 0;
        const responseDate = isDateNewer ? lastModified : midnight;

        return await minioClient.presignedGetObject(
            bucketMap[bucketName],
            fileName,
            24 * 60 * 60,
            { 'response-content-type': 'image/png' },
            responseDate,
        );
    } catch {
        return undefined;
    }
};

export const getOrgLogoUrl = async ({ organizationId }: { organizationId: string }) => {
    return await getPresignedUrl({ bucketName: 'private', fileName: `organization/${organizationId}/logo.png` });
};

export const clearBucket = async (bucketName: BucketName) => {
    try {
        const exists = await minioClient.bucketExists(bucketMap[bucketName]);
        if (!exists) return;

        const objectsList: string[] = [];
        const stream = minioClient.listObjects(bucketMap[bucketName], '', true);

        for await (const obj of stream) {
            if (obj.name) objectsList.push(obj.name);
        }

        if (objectsList.length > 0) {
            await minioClient.removeObjects(bucketMap[bucketName], objectsList);
        }
    } catch (error) {
        console.error(`error - clearBucket: ${bucketMap[bucketName]}:`, error);
    }
};
