import { headers } from 'next/headers';
import { loadTenant } from '../loader';
import { cache } from 'react';
import { appConfig } from 'config';

export const getBaseUrlString = cache(async () => {
  const forcedBaseUrl = appConfig.get('FORCE_BASE_URL');
  if (forcedBaseUrl) {
    return forcedBaseUrl;
  }
  const headerValues = await headers();
  const tenant = await loadTenant();
  const host = headerValues.get('host') || tenant.host;
  const protocol = headerValues.get('x-forwarded-proto') || 'https';

  return [protocol, '://', host].join('');
});

export const getBaseUrl = cache(
  async (
    params: Partial<
      Omit<URL, 'searchParams'> & { searchParams: Record<string, string> }
    > = {}
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
