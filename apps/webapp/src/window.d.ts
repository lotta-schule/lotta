import 'vitest/globals';

declare global {
  interface Window {
    tid?: string;
  }
}
