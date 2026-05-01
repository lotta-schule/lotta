import { sendRefreshRequest } from '#/api/auth.js';
import { appConfig } from '#/config.js';
import { type NextRequest, NextResponse } from 'next/server.js';

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
    modifiedHeaders.set('x-lotta-originary-host', currentHost);
  }

  const response = NextResponse.next({
    request: {
      headers: modifiedHeaders,
    },
  });

  if (accessToken) {
    response.cookies.set('SignInAccessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
    });
  }
  if (refreshToken) {
    response.cookies.set('SignInRefreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
    });
  }

  return response;
}
