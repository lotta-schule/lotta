import * as Sentry from '@sentry/nextjs';
import { sendRefreshRequest } from 'api/auth';
import { serialize } from 'cookie-es';
import { NextResponse } from 'next/server';
import { JWT } from 'util/auth/jwt';
import { Logger } from 'util/logger';

import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|font|favicon.ico|favicon|p/|stry/).*)',
  ],
};

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  if (
    /\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/.test(
      request.nextUrl.pathname
    ) ||
    /^\/(api|backend|auth|storage)/.test(request.nextUrl.pathname)
  ) {
    // do not execute on static files
    return NextResponse.next({ request });
  }

  const authInfo = {
    refreshToken: null as string | null,
    accessToken: request.cookies.get('SignInAccessToken')?.value ?? null,
  };

  const incomingRefreshToken = request.cookies.get('SignInRefreshToken')?.value;
  const authHeader = request.headers.get('Authorization');

  if (!authInfo.accessToken && authHeader?.startsWith('Bearer ')) {
    const accessToken = authHeader.slice(7);

    let accessTokenJwt = null;
    try {
      accessTokenJwt = JWT.parse(accessToken);
    } catch (error) {
      Logger.error('Error parsing access token', { error });
    }

    if (!accessTokenJwt?.isValid()) {
      Logger.warn('Access token is not valid!', { accessTokenJwt });
    } else if (accessTokenJwt.isExpired(0)) {
      Logger.warn('Access token is expired!');
    } else {
      authInfo.accessToken = accessToken;
    }
  }

  if (incomingRefreshToken) {
    let refreshTokenJwt = null;
    try {
      refreshTokenJwt = JWT.parse(incomingRefreshToken);
    } catch (error) {
      Logger.error('Error parsing refresh token', { error });
    }

    if (
      refreshTokenJwt?.isValid() &&
      // we do not need to check if the refresh token is expired (or will expire in the next seconds)
      !refreshTokenJwt.isExpired(0)
    ) {
      if (
        // refresh the token if it expires in the next 5 minutes or if the access token is not set
        refreshTokenJwt.body.expires.getTime() - Date.now() < 1000 * 60 * 5 ||
        !authInfo.accessToken
      ) {
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
          const { accessToken, refreshToken: updatedRefreshToken } =
            updateRefreshTokenResult;

          authInfo.refreshToken = updatedRefreshToken;
          authInfo.accessToken = accessToken;
        }
      } else {
        authInfo.refreshToken = incomingRefreshToken;
      }
    } else if (authHeader) {
      Logger.warn('User does not have a refresh token');
      const accessToken = authHeader.slice(7);
      let accessTokenJwt = null;
      try {
        accessTokenJwt = JWT.parse(accessToken);
      } catch (error) {
        Logger.error('Error parsing access token', { error });
      }

      if (accessTokenJwt?.isValid() && !accessTokenJwt.isExpired(0)) {
        authInfo.accessToken = accessToken;
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

      // TODO:
      // I do not think saving the access token in a cookie is a good idea
      // I think a better approach would be passing it along from server components to
      // the Apollo client WITHOUT passing via a cookie
      // We only want to set the access token cookie if a new access token was
      // generated.
      // This is the case when a new refresh token (authInfo.refreshToken !== null) was
      // issued
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
      Sentry.captureException(e);
      Logger.error('Error parsing new token', { e });
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
