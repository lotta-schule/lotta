import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { set } from 'js-cookie';
import { useApolloClient } from 'react-apollo';
import { UserModel } from 'model';
import Matomo from 'matomo-ts';
import { useDispatch } from 'react-redux';
import { createCloseDrawerAction } from 'store/actions/layout';

export const useOnLogin = () => {
    const dispatch = useDispatch();
    const apolloClient = useApolloClient();

    return (user: UserModel, token: string) => {
        set(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME, token, {
            domain: process.env.REACT_APP_APP_BASE_DOMAIN
        });
        Matomo.default().setUserId(String(user.id));
        dispatch(createCloseDrawerAction());
        apolloClient.writeQuery({
            query: GetCurrentUserQuery,
            data: {
                currentUser: user
            }
        });
        window.location.reload();
    };
};