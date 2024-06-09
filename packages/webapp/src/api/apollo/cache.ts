import { InMemoryCache, makeVar } from '@apollo/client';

export const isMobileDrawerOpenVar = makeVar(false);

export const createCache = () => {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          isMobileDrawerOpen: {
            read() {
              return isMobileDrawerOpenVar();
            },
          },
        },
      },
    },
  });
};
