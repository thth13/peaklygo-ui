// Basic GA4 event helper. Safe no-op if gtag missing.
export interface GAEventParams {
  [key: string]: unknown;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    // keep dataLayer compatible with any existing declaration
    dataLayer?: Object[]; // GA pushes plain objects
  }
}

export function trackEvent(eventName: string, params: GAEventParams = {}): void {
  if (typeof window === 'undefined') return;
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, params);
}
