import { headers } from 'next/headers';
import { loadTenant } from '../loader';
import { cache } from 'react';

export const getBaseUrlString = cache(async () => {
  if (process.env.FORCE_BASE_URL) {
    return process.env.FORCE_BASE_URL;
  }
  const tenant = await loadTenant();
  const host = headers().get('host') || tenant.host;
  const protocol = headers().get('x-forwarded-proto') || 'https';

  console.log([protocol, '://', host].join(''));
  return [protocol, '://', host].join('');
});

export const getBaseUrl = cache(
  async (
    params: Partial<URL & { searchParams: Record<string, string> }> = {}
  ) => {
    const stringUrl = await getBaseUrlString();
    const url = new URL(stringUrl);

    for (const [key, value] of Object.entries(params)) {
      if (key === 'searchParams' && !!params.searchParams) {
        for (const [searchParam, searchValue] of Object.entries(
          params.searchParams
        )) {
          url.searchParams.append(searchParam, searchValue);
        }
      } else {
        (url as any)[key] = value;
      }
    }

    return url.toString();
  }
);
