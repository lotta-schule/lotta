import { sendRefreshRequest } from 'api/auth';
import { appConfig } from 'config';
import { type NextRequest, NextResponse } from 'next/server';

const isRequestToApi = (pathname: string) => {
  if (pathname === '/api') return true;
  if (pathname.startsWith('/auth/')) return true;
  if (pathname.startsWith('/storage/')) return true;
  if (pathname.startsWith('/data/')) return true;
  if (pathname.startsWith('/setup/')) return true;
  return false;
};

const isStaticAssetRequest = (pathname: string) => {
  return (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/p/')
  );
};

export async function middleware(request: NextRequest) {
  if (isRequestToApi(request.nextUrl.pathname)) {
    const targetUrl = request.nextUrl.clone();
    targetUrl.host = new URL(appConfig.get('API_URL')).host;
    return NextResponse.rewrite(targetUrl);
  }

  if (isStaticAssetRequest(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const incomingRefreshToken =
    request.cookies.get('SignInRefreshToken')?.value ?? null;

  if (!incomingRefreshToken) {
    // no refresh token, skip middleware
    return NextResponse.next();
  }

  const currentHost =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl.host;
  const { accessToken, refreshToken, tenant } = await sendRefreshRequest(
    {
      host: currentHost,
    },
    incomingRefreshToken,
    appConfig.get('API_URL')
  );

  const modifiedHeaders = new Headers(request.headers);
  if (accessToken) {
    modifiedHeaders.set('Authorization', `Bearer ${accessToken}`);
  }
  if (refreshToken) {
    modifiedHeaders.set('SignInRefreshToken', refreshToken);
  }
  if (tenant) {
    modifiedHeaders.set('x-lotta-tenant', tenant);
  } else {
    modifiedHeaders.set('x-lotta-originaly-host', currentHost);
  }

  if (request.headers.get('referer')) {
    // skip middleware for requests with referer (likely subsequent browser requests for assets)
    return NextResponse.next({
      request: {
        headers: modifiedHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: modifiedHeaders,
    },
  });
}
