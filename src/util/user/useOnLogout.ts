import { LogoutMutation } from 'api/mutation/LogoutMutation';
import { useApolloClient, useMutation } from '@apollo/client';
import { useHistory } from 'react-router-dom';

export const useOnLogout = () => {
    const apolloClient = useApolloClient();
    const history = useHistory();
    const [logout] = useMutation(LogoutMutation, {
        onCompleted: () => {
            history.push('/');
            localStorage.clear();
            apolloClient.resetStore();
        }
    });

    return logout;
};
