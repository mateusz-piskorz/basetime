'use client';

export const updateLogo = async ({ img, organizationId }: { img: File; organizationId: string }) => {
    const formData = new FormData();
    formData.set('file', img);

    const res = await fetch(`/api/org/${organizationId}/logo`, {
        method: 'POST',
        body: formData,
    });
    const data = await res.json();

    return { success: data.success as boolean, message: data.message as string };
};

export const removeLogo = async (organizationId: string) => {
    const res = await fetch(`/api/org/${organizationId}/logo`, {
        method: 'DELETE',
    });
    const data = await res.json();

    return { success: data.success as boolean, message: data.message as string };
};
