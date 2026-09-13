// Polyfill for crypto.randomUUID for browser compatibility
export function setupCryptoPolyfill() {
  if (typeof window !== 'undefined' && window.crypto && !window.crypto.randomUUID) {
    (window.crypto as any).randomUUID = () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };
  }
}