import * as React from 'react';

const ServerDataContext = React.createContext({
    baseUrl: typeof window === 'undefined' ? '/' : window.location.href,
});

export const ServerDataContextProvider = ServerDataContext.Provider;

export const useServerData = () => React.useContext(ServerDataContext);
