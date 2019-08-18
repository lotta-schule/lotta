import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { remove } from 'js-cookie';
import { useApolloClient } from 'react-apollo';
import { UserModel } from 'model';
import Matomo from 'matomo-ts';
import { useDispatch } from 'react-redux';
import { createCloseDrawerAction } from 'store/actions/layout';

export const useOnLogout = () => {
    const apolloClient = useApolloClient();
    const dispatch = useDispatch();

    return () => {
        apolloClient.writeQuery<{ currentUser: UserModel | null }>({
            query: GetCurrentUserQuery,
            data: {
                currentUser: null
            }
        });
        remove(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME, {
            domain: process.env.REACT_APP_APP_BASE_DOMAIN
        });
        Matomo.default().resetUserId();
        apolloClient.clearStore();
        dispatch(createCloseDrawerAction());
    }
};