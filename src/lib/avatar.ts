'use client';

export const updateAvatar = async (img: File) => {
    const formData = new FormData();
    formData.set('file', img);

    const res = await fetch('/api/user-avatar', {
        method: 'POST',
        body: formData,
    });
    const data = await res.json();

    return { success: data.success as boolean };
};

export const removeAvatar = async () => {
    const res = await fetch('/api/user-avatar', {
        method: 'DELETE',
    });
    const data = await res.json();

    return { success: data.success as boolean };
};
