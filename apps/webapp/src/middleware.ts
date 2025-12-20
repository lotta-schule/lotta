import { sendRefreshRequest } from 'api/auth';
import { serialize } from 'cookie-es';
import { NextResponse } from 'next/server';
import { JWT } from 'util/auth/jwt';

import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    {
      source:
        '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|p/|stry/|api/|backend/|auth/storage/).*)',
    },
  ],
};

export async function middleware(request: NextRequest) {
  let authInfo = {
    refreshToken: null as string | null,
    accessToken: request.cookies.get('SignInAccessToken')?.value ?? null,
  };

  const incomingRefreshToken = request.cookies.get('SignInRefreshToken')?.value;

  if (incomingRefreshToken) {
    let refreshTokenJwt = null;
    try {
      refreshTokenJwt = JWT.parse(incomingRefreshToken);
    } catch (e) {
      console.error('Error parsing refresh token', e);
    }

    if (refreshTokenJwt?.isValid() && !refreshTokenJwt.isExpired(0)) {
      const shouldRefresh =
        refreshTokenJwt.body.expires.getTime() - Date.now() < 1000 * 60 * 5 ||
        !authInfo.accessToken;

      if (shouldRefresh) {
        const updateRefreshTokenResult = await sendRefreshRequest({
          'x-lotta-originary-host': request.headers.get('host'),
          Cookie: serialize('SignInRefreshToken', incomingRefreshToken, {
            sameSite: 'strict',
            expires: refreshTokenJwt.body.expires,
            secure: false,
            httpOnly: true,
          }),
        });

        if (updateRefreshTokenResult) {
          authInfo = {
            refreshToken: updateRefreshTokenResult.refreshToken,
            accessToken: updateRefreshTokenResult.accessToken,
          };
        }
      } else {
        authInfo.refreshToken = incomingRefreshToken;
      }
    }
  }

  const requestHeaders = new Headers(request.headers);
  if (authInfo.accessToken) {
    requestHeaders.set('Authorization', `Bearer ${authInfo.accessToken}`);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (authInfo.refreshToken) {
    try {
      const parsedRefreshToken = JWT.parse(authInfo.refreshToken);
      response.cookies.set('SignInRefreshToken', authInfo.refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        expires: parsedRefreshToken.body.expires,
        path: '/',
      });

      if (authInfo.accessToken) {
        const parsedAccessToken = JWT.parse(authInfo.accessToken);
        response.cookies.set('SignInAccessToken', authInfo.accessToken, {
          httpOnly: false,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
          expires: parsedAccessToken.body.expires,
          path: '/',
        });
      }
    } catch (e) {
      console.error('Error parsing new token', e);
    }
  } else {
    // user has no valid refresh token
    // remove the refresh token cookie
    response.cookies.delete({
      name: 'SignInRefreshToken',
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  return response;
}
