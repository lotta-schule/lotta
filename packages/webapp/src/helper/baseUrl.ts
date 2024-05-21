import { headers } from 'next/headers';
import { loadTenant } from '../loader';

export const getBaseUrl = async (
  params: Partial<URL & { searchParams: Record<string, string> }> = {}
) => {
  const tenant = await loadTenant();
  const host = headers().get('host') || tenant.host;
  const protocol = headers().get('x-forwarded-proto') || 'https';

  const stringUrl =
    process.env.FORCE_BASE_URL ?? [protocol, '://', host].join('');
  const url = new URL(stringUrl);

  for (const [key, value] of Object.entries(params)) {
    if (key === 'searchParams' && !!params.searchParams) {
      for (const [searchParam, searchValue] of Object.entries(
        params.searchParams
      )) {
        url.searchParams.append(searchParam, searchValue);
      }
    } else {
      url[key] = value;
    }
  }

  return url.toString();
};
