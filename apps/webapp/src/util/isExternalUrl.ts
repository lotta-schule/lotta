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
    new URL(url);
    // If we can create a URL object, it's an external absolute URL
    return true;
  } catch {
    // If URL parsing fails, treat it as an internal relative URL
    return false;
  }
};
