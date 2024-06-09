'use client';
import * as React from 'react';

export type NoSsrProps = {
  children: React.ReactNode;
};

export const NoSsr = ({ children }: NoSsrProps) => {
  const [hasRendered, setHasRendered] = React.useState(false);
  React.useEffect(() => {
    setHasRendered(true);
  }, []);

  return hasRendered ? (children as React.ReactElement) : null;
};
