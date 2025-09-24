import 'server-only';
import sharp from 'sharp';

export const resizeImageUtil = async ({ image }: { image: File }) => {
    const buffer = await image.arrayBuffer();
    const img = sharp(buffer);

    const meta = await sharp(await img.toBuffer()).metadata();

    if (!meta?.height || !meta?.width) {
        throw 'Error with an image - uploadImage';
    }

    const imgString = (await img.resize(200, 200, { fit: 'cover', position: 'center' }).png({ quality: 100 }).toBuffer()).toString('base64');

    return `data:image/png;base64,${imgString}`;
};
