// Basic GA4 event helper. Safe no-op if gtag missing.
export interface GAEventParams {
  [key: string]: unknown;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    // eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
    dataLayer?: Object[]; // GA pushes plain objects; upstream may declare
  }
}

export function trackEvent(eventName: string, params: GAEventParams = {}): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}
