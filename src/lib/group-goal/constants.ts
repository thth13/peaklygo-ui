export const HERO_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80';

export const DEFAULT_DISPLAYED_DATES_COUNT = 7;
export const FALLBACK_DATES_COUNT = 5;

export const IMAGE_PROTOCOLS = ['http://', 'https://'];

export const isExternalImage = (url: string): boolean => {
  return IMAGE_PROTOCOLS.some((protocol) => url.startsWith(protocol));
};

export const resolveImageUrl = (image: string | null | undefined, baseUrl: string): string | null => {
  if (!image) return null;
  return isExternalImage(image) ? image : `${baseUrl}/${image}`;
};

export const clampProgress = (progress: number | undefined): number => {
  return Math.max(0, Math.min(100, Math.round(progress ?? 0)));
};
