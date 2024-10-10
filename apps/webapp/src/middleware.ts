import * as Sentry from '@sentry/nextjs';
import { sendRefreshRequest } from 'api/auth';
import { serialize } from 'cookie-es';
import { NextResponse } from 'next/server';
import { JWT } from 'util/auth/jwt';

import type { NextRequest } from 'next/server';

export const config = {
  matcher: ['/((?!_next/static|_next/image|font|favicon.ico|favicon|p/).*)'],
};

const l = <T>(obj: T): T => {
  // console.dir(obj, { depth: 5 });
  return obj;
};

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  if (
    /\.(png|jpg|jpeg|gif|svg|webp|ico|woff|woff2|ttf|eot)$/.test(request.url) ||
    /\/(api|backend)\/?$/.test(request.url)
  ) {
    // do not execute on static files
    return NextResponse.next({ request });
  }

  const authInfo = {
    refreshToken: null as string | null,
    accessToken: request.cookies.get('SignInAccessToken')?.value ?? null,
  };

  l({ authInfo });

  const incomingRefreshToken = request.cookies.get('SignInRefreshToken')?.value;
  const authHeader = request.headers.get('Authorization');

  if (!authInfo.accessToken && authHeader?.startsWith('Bearer ')) {
    const accessToken = authHeader.slice(7);

    let accessTokenJwt = null;
    try {
      accessTokenJwt = JWT.parse(accessToken);
    } catch (e) {
      console.error('Error parsing access token', e);
    }

    l({ accessTokenJwt });

    if (!accessTokenJwt?.isValid()) {
      console.warn('Access token is not valid!', accessTokenJwt);
    } else if (accessTokenJwt.isExpired(0)) {
      console.warn('Access token is expired!', accessTokenJwt);
    } else {
      authInfo.accessToken = accessToken;
    }
  }

  l({ authInfoX1: authInfo });

  if (incomingRefreshToken) {
    let refreshTokenJwt = null;
    try {
      refreshTokenJwt = JWT.parse(incomingRefreshToken);
    } catch (e) {
      console.error('Error parsing refresh token', e);
    }

    l({ refreshTokenJwt });

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

        l({ updateRefreshTokenResult });

        if (updateRefreshTokenResult) {
          const { accessToken, refreshToken: updatedRefreshToken } =
            updateRefreshTokenResult;

          authInfo.refreshToken = updatedRefreshToken;
          authInfo.accessToken = accessToken;

          l({ authInfoX2: authInfo });
        }
      } else {
        authInfo.refreshToken = incomingRefreshToken;
        l({ authInfoX3: authInfo });
      }
    } else if (authHeader) {
      console.warn('User does not have a refresh token');
      const accessToken = authHeader.slice(7);
      let accessTokenJwt = null;
      try {
        accessTokenJwt = JWT.parse(accessToken);
      } catch (e) {
        console.error('Error parsing access token', e);
      }

      l({ accessTokenJwt });

      if (accessTokenJwt?.isValid() && !accessTokenJwt.isExpired(0)) {
        authInfo.accessToken = accessToken;
      }
      l({ authInfoX4: authInfo });
    }
  }

  l({ authInfoX5: authInfo });

  const requestHeaders = new Headers(request.headers);
  if (authInfo.accessToken) {
    requestHeaders.set('Authorization', `Bearer ${authInfo.accessToken}`);
    l({ requestHeaderSet: requestHeaders });
  }

  l({ requestHeaders });

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  l({ authInfoX6: authInfo });
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

      l({ responseCookies: response.cookies });

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
        l({ responseCookies2: response.cookies });
      }
    } catch (e) {
      Sentry.captureException(e);
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
    l({ responseCookies3: response.cookies });
  }

  return response;
}
