export const DEFAULT_DISPLAYED_DATES_COUNT = 7;
export const FALLBACK_DATES_COUNT = 5;

export const IMAGE_PROTOCOLS = ['http://', 'https://'];

export const isExternalImage = (url: string): boolean => {
  return IMAGE_PROTOCOLS.some((protocol) => url.startsWith(protocol));
};

export const clampProgress = (progress: number | undefined): number => {
  return Math.max(0, Math.min(100, Math.round(progress ?? 0)));
};
