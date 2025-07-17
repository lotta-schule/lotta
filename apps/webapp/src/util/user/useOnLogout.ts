import { useApolloClient, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { graphql } from 'api/graphql';

const clearStorage = () => {
  document.cookie = 'SignInAccessToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
  localStorage.clear();
};

export const useOnLogout = () => {
  const apolloClient = useApolloClient();
  const router = useRouter();

  const [logout] = useMutation(
    graphql(`
      mutation Logout {
        logout {
          accessToken
        }
      }
    `),
    {
      onCompleted: () => {
        clearStorage();
        apolloClient.resetStore();
        router.push('/');
      },
    }
  );

  return logout;
};
