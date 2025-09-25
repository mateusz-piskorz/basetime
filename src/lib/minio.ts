console.log('DEBUG: MINIO_ENDPOINT:', process.env.MINIO_ENDPOINT);

import 'server-only';

import * as Minio from 'minio';

type Bucket = 'main';

if (!process.env.MINIO_ENDPOINT) {
    throw new Error('MINIO_ENDPOINT var undefined');
}

const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT!,
    port: 9000,
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
    if (!exists) return null;

    const rawUrl = await minioClient.presignedGetObject(bucket, fileName, 60 * 24 * 24);
    const publicUrl = rawUrl.replace(`http://${process.env.MINIO_ENDPOINT}:9000/`, process.env.MINIO_PUBLIC_ENDPOINT!);

    return publicUrl;
};

export const getUserAvatarUrl = async ({ userId }: { userId: string }) => {
    return await getPresignedUrl({ bucket: 'main', fileName: `user/${userId}/avatar.png` });
};
