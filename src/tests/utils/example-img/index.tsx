import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(__filename);

export function loadTestNonSharedBuffer() {
    const pngPath = path.join(__dirname, 'example.png');
    return fs.readFileSync(pngPath);
}

export function loadTestFile() {
    const pngPath = path.join(__dirname, 'example.png');
    const buffer = fs.readFileSync(pngPath);
    return new File([buffer], 'example.png', { type: 'image/png' });
}
