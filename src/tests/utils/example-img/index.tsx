import fs from 'fs';
import path from 'path';

export function loadTestNonSharedBuffer() {
    const __dirname = path.dirname(__filename);

    const pngPath = path.join(__dirname, '..', 'example-img', 'example.png');
    return fs.readFileSync(pngPath);
}

export function loadTestFile() {
    const __dirname = path.dirname(__filename);

    const pngPath = path.join(__dirname, '..', 'example-img', 'example.png');
    const buffer = fs.readFileSync(pngPath);
    return new File([buffer], 'example.png', { type: 'image/png' });
}
