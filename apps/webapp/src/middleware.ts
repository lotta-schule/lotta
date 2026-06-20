import { sendRefreshRequest } from '#/api/auth';
import { appConfig } from '#/config';
import { type NextRequest, NextResponse } from 'next/server.js';
import { JWT } from './util/auth/jwt';

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

  const incomingAccessToken =
    request.cookies.get('SignInAccessToken')?.value ?? null;

  const incomingRefreshToken =
    request.cookies.get('SignInRefreshToken')?.value ?? null;

  const parsedIncomingAccessToken = incomingAccessToken
    ? JWT.parse(incomingAccessToken)
    : null;

  const modifiedHeaders = new Headers(request.headers);

  // Refresh when: refresh token exists AND (access token missing OR expired) AND not a hisec token.
  // Hisec tokens are intentionally short-lived and must not be auto-refreshed.
  // RFC 6749 §6: only the refresh token is needed; the access token is used only as an expiry signal.
  const shouldRefresh =
    !!incomingRefreshToken &&
    (!parsedIncomingAccessToken || parsedIncomingAccessToken.isExpired()) &&
    parsedIncomingAccessToken?.body.type !== 'hisec';

  if (!shouldRefresh) {
    if (incomingAccessToken) {
      modifiedHeaders.set('Authorization', `Bearer ${incomingAccessToken}`);
    }
    return NextResponse.next({
      request: {
        headers: modifiedHeaders,
      },
    });
  }

  const currentHost =
    request.headers.get('x-forwarded-host') ||
    request.headers.get('host') ||
    request.nextUrl.host;

  const { accessToken, refreshToken, tenant } = await sendRefreshRequest(
    incomingAccessToken,
    incomingRefreshToken,
    {
      baseURL: appConfig.get('API_URL'),
      originaryHost: currentHost,
    }
  );

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
      secure: process.env.NODE_ENV === 'production',
      maxAge: 14 * 24 * 60 * 60, // 14 days (reduced from 21)
      sameSite: 'lax', // Changed from 'lax' for better security
      path: '/',
    });
  }
  if (refreshToken) {
    response.cookies.set('SignInRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 14 * 24 * 60 * 60, // 14 days (reduced from 21)
      sameSite: 'lax', // Changed from 'lax' for better security
      path: '/',
    });
  }

  return response;
}
