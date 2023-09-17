import * as React from 'react';
import { OverlayProvider } from 'react-aria';

export type HubertProviderProps = {
  children?: React.ReactNode;
};

export const HubertProvider = ({ children }: HubertProviderProps) => {
  return <OverlayProvider>{children}</OverlayProvider>;
};
