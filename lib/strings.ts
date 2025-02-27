export const cleanHandle = (handle: string): string => {
    return handle.replace("@", "").trim().toLowerCase();
};

export const goodTwitterImage = (url?: string): string | undefined => {
    if (!url) return undefined;
    return url.replace("_normal", "_400x400");
};