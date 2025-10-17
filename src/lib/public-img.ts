'use client';

export const addPublicImg = async ({ img }: { img: File }) => {
    const formData = new FormData();
    formData.set('file', img);

    const res = await fetch('/api/public-img', {
        method: 'POST',
        body: formData,
    });
    const data = await res.json();

    return { success: data.success as boolean };
};

export const removePublicImg = async ({ imgName }: { imgName: string }) => {
    const formData = new FormData();
    formData.set('fileName', imgName);

    const res = await fetch('/api/public-img', {
        method: 'DELETE',
        body: formData,
    });
    const data = await res.json();

    return { success: data.success as boolean };
};
