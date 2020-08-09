import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { UserModel } from 'model';
import { LogoutMutation } from 'api/mutation/LogoutMutation';
import { useApolloClient, useMutation } from '@apollo/client';
import { useHistory } from 'react-router-dom';
import Matomo from 'matomo-ts';

export const useOnLogout = () => {
    const apolloClient = useApolloClient();
    const history = useHistory();
    const [logout] = useMutation(LogoutMutation, {
        onCompleted: () => {
            history.push('/');
            if (window._paq) {
                Matomo.default().resetUserId();
            }
            localStorage.clear();
            apolloClient.clearStore().then(() => {
                apolloClient.resetStore();
            });
        }
    });

    return logout;
};
