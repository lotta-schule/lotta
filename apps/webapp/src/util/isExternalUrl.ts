/**
 * Checks if a URL is external (not relative or on the same host).
 * @param url - The URL to check
 * @returns true if the URL is external, false otherwise
 */
export const isExternalUrl = (url: string): boolean => {
  // Relative URLs starting with / are internal
  if (url.startsWith('/')) {
    return false;
  }

  // Check if it's an absolute URL
  try {
    const urlObj = new URL(url);
    // If we're in a browser context, check if the host is different
    if (typeof window !== 'undefined') {
      return window.location.host !== urlObj.host;
    }
    // On server-side, any absolute URL is considered external
    return true;
  } catch {
    // If URL parsing fails, treat it as an internal relative URL
    return false;
  }
};
