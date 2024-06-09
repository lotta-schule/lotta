import { useApolloClient, useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import LogoutMutation from 'api/mutation/LogoutMutation.graphql';

export const useOnLogout = () => {
  const apolloClient = useApolloClient();
  const router = useRouter();
  const [logout] = useMutation(LogoutMutation, {
    onCompleted: () => {
      document.cookie =
        'SignInAccessToken=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
      localStorage.clear();
      apolloClient.resetStore();
      router.push('/');
    },
  });

  return logout;
};
