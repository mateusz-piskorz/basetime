import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(__filename);

export function loadTestNonSharedBuffer() {
    const pngPath = path.join(__dirname, 'example.png');
    return fs.readFileSync(pngPath);
}

export function loadTestFile(fileName?: string) {
    const pngPath = path.join(__dirname, 'example.png');
    const buffer = fs.readFileSync(pngPath);
    return new File([buffer], fileName || 'example.png', { type: 'image/png' });
}

export function getTestFileFormData(fileName?: string) {
    const img = loadTestFile(fileName);
    const formData = new FormData();
    formData.set('file', img);
    return formData;
}

export function getTestBase64String() {
    return 'data:image/png;base64,/9j/4AAQSkZJRgABAgEASABIAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAANAAgDAREAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD+erx98CviD+3d4P8A+GjfA/xQ+BFzN47/AGon+C+lfAnQPDdt8I/GGp/H34h/CDwN4rN/p3h7wt4K0b4V6b4e+I9t4DvYPCPiLUNVg1b4g+J9M1DS9Pu/iB8SdZk/tXGtlWEw2a5pnVTE4Z47EZXho47FYnF0sPSnhMsqZhjIOeOxzw+GhO+ZYmpKpXxSoVXOlThP2soRlrTx2I/sLLMmwmGnTyzL8xrf2dl+AwEpOlWx1DL8G6OHyzL4VKqpU6OW4ejSo0aHtKKpzdRRpKcl6J8PfhLN+zJr3h7xB8KNT0iy8aeGdC8RR+HfFWtW3xEv28PX/wAQvC2oeFdW1zQtBsPixpGgWGsXPh+e60zW5XsLmx8R2jW1rqOniyiu7W/9XPMNl+Ky6rktXB+3oTlRqueMrSxkKbnWo4moqGCqx/s+M6v1aFGVerha+IpRVOthKuGxdGliY8OQ4nMcBmtDPqWLp061GNanGjhMN9T9tKOHxOGoTxWNp1p5lUWGliXiadDD4zC4WvVVShjqOLwGIr4OYP/Z';
}
