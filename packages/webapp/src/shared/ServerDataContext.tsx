'use client';

import * as React from 'react';

const ServerDataContext = React.createContext({
  baseUrl: null! as string,
});

export type ServerDataContextProviderProps = React.PropsWithChildren<{
  baseUrl: string;
}>;
export const ServerDataContextProvider = ({
  baseUrl,
  children,
}: ServerDataContextProviderProps) => {
  return (
    <ServerDataContext.Provider value={{ baseUrl }}>
      {children}
    </ServerDataContext.Provider>
  );
};

export const useServerData = () => React.useContext(ServerDataContext);
