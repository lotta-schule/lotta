import { sendRefreshRequest } from 'api/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JWT } from 'util/auth/jwt';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|font|favicon.ico|p/).*)',
    '/(.*).svg',
  ],
};

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const authInfo = {
    refreshToken: null as string | null,
    accessToken: null as string | null,
  };

  const incomingRefreshToken = request.cookies.get('SignInRefreshToken')?.value;
  const authHeader = request.headers.get('Authorization');
  if (incomingRefreshToken) {
    let refreshTokenJwt = null;
    try {
      refreshTokenJwt = JWT.parse(incomingRefreshToken);
    } catch (e) {
      console.error('Error parsing refresh token', e);
    }

    if (
      refreshTokenJwt?.isValid() &&
      (refreshTokenJwt.body.expires.getTime() - Date.now() < 1000 * 60 * 5 ||
        !authInfo.accessToken)
    ) {
      const updateRefreshTokenResult = await sendRefreshRequest(
        incomingRefreshToken,
        {
          'x-lotta-originary-host': request.headers.get('host'),
        }
      );

      if (updateRefreshTokenResult) {
        const { accessToken, refreshToken: updatedRefreshToken } =
          updateRefreshTokenResult;

        authInfo.refreshToken = updatedRefreshToken;
        authInfo.accessToken = accessToken;
      }
    }

    if (!authInfo.accessToken && authHeader?.startsWith('Bearer ')) {
      const accessToken = authHeader.slice(7);

      let accessTokenJwt = null;
      try {
        accessTokenJwt = JWT.parse(accessToken);
      } catch (e) {
        console.error('Error parsing access token', e);
      }

      if (!accessTokenJwt?.isValid()) {
        console.log('Access token is not valid!', accessTokenJwt);
      } else if (accessTokenJwt.isExpired()) {
        console.log('Access token is expired!', accessTokenJwt);
      } else {
        console.log('Access token is valid!');
        authInfo.accessToken = accessToken;
      }
    }
  } else if (authHeader) {
    console.log('User does not have a refresh token');
    const accessToken = authHeader.slice(7);
    console.log('User has an access token', accessToken);

    const accessTokenJwt = JWT.parse(accessToken);

    if (accessTokenJwt.isValid() && !accessTokenJwt.isExpired(0)) {
      console.log('Access token is valid!');

      authInfo.accessToken = accessToken;
    }
  }

  const requestHeaders = new Headers(request.headers);
  if (authInfo.accessToken) {
    requestHeaders.set('Authorization', `Bearer ${authInfo.accessToken}`);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  if (authInfo.refreshToken) {
    response.cookies.set('SigninRefreshToken', authInfo.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });

    // We only want to set the access token cookie if a new access token was
    // generated.
    // This is the case when a new refresh token (authInfo.refreshToken !== null) was
    // issued
    if (authInfo.accessToken) {
      response.cookies.set('SigninAccessToken', authInfo.accessToken, {
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
      });
    }
  }

  return response;
}
