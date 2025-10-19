'use client';

export const addPublicBlogImg = async ({ img }: { img: File }) => {
    const formData = new FormData();
    formData.set('file', img);

    const res = await fetch('/api/public-blog-img', {
        method: 'POST',
        body: formData,
    });
    const data = await res.json();

    return { success: data.success as boolean };
};

export const removePublicBlogImg = async ({ imgPath }: { imgPath: string }) => {
    const formData = new FormData();
    formData.set('filePath', imgPath);

    const res = await fetch('/api/public-blog-img', {
        method: 'DELETE',
        body: formData,
    });
    const data = await res.json();

    return { success: data.success as boolean };
};
