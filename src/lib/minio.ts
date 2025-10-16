import dayjs from 'dayjs';
import * as Minio from 'minio';
import 'server-only';

type Bucket = 'main' | 'public';

export const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: process.env.MINIO_PORT ? Number(process.env.MINIO_PORT) : undefined,
    accessKey: process.env.MINIO_USER,
    secretKey: process.env.MINIO_PASSWORD,
    useSSL: process.env.MINIO_SSL === 'true',
});

export const uploadFile = async ({ bucket, file, fileName }: { bucket: Bucket; fileName: string; file: Buffer }) => {
    await minioClient.putObject(bucket, fileName, file);
};

export const deleteFile = async ({ bucket, fileName }: { bucket: Bucket; fileName: string }) => {
    await minioClient.removeObject(bucket, fileName);
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

export const getUserAvatarUrl = async ({ userId }: { userId: string }) => {
    return await getPresignedUrl({ bucket: 'main', fileName: `user/${userId}/avatar.png` });
};

export const getOrgLogoUrl = async ({ organizationId }: { organizationId: string }) => {
    return await getPresignedUrl({ bucket: 'main', fileName: `organization/${organizationId}/logo.png` });
};
