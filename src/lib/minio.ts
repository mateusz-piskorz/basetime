import 'server-only';

import * as Minio from 'minio';

type Bucket = 'main';

const minioClient = new Minio.Client({
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

const getPresignedUrl = async ({ bucket, fileName }: { bucket: Bucket; fileName: string }) => {
    let exists;
    try {
        await minioClient.statObject(bucket, fileName);
        exists = true;
    } catch {
        exists = false;
    }
    if (!exists) return undefined;

    return await minioClient.presignedGetObject(bucket, fileName, 60 * 24 * 24);
};

export const getUserAvatarUrl = async ({ userId }: { userId: string }) => {
    return await getPresignedUrl({ bucket: 'main', fileName: `user/${userId}/avatar.png` });
};
