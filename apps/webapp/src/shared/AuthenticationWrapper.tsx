'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

const DynamicAuthentication = dynamic(() => import('shared/Authentication'), {
  ssr: false,
});

const DynamicUpdatePasswordDialog = dynamic(
  () =>
    import('shared/dialog/UpdatePasswordDialog').then(
      (mod) => mod.UpdatePasswordDialog
    ),
  {
    ssr: false,
  }
);

export const AuthenticationWrapper = () => {
  const [isPasswordChangeOpen, setIsPasswordChangeOpen] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';').reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          acc[key] = value;
          return acc;
        },
        {} as Record<string, string>
      );

      if (cookies['request_pw_reset'] === '1') {
        setIsPasswordChangeOpen(true);
      }
    }
  }, []);

  const handlePasswordChangeClose = React.useCallback(() => {
    setIsPasswordChangeOpen(false);
    if (typeof window !== 'undefined') {
      document.cookie = 'request_pw_reset=; Max-Age=0; path=/; SameSite=Lax';
    }
  }, []);

  return (
    <>
      <DynamicAuthentication />
      {isPasswordChangeOpen && (
        <DynamicUpdatePasswordDialog
          isFirstPasswordChange
          isOpen={isPasswordChangeOpen}
          onRequestClose={handlePasswordChangeClose}
        />
      )}
    </>
  );
};
