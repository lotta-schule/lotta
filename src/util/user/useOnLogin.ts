import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { set } from 'js-cookie';
import { useApolloClient } from 'react-apollo';
import { UserModel } from 'model';
import { useDispatch } from 'react-redux';
import { createCloseDrawerAction } from 'store/actions/layout';
import { CookieParams } from 'util/path/CookieParams';
import Matomo from 'matomo-ts';

export const useOnLogin = () => {
    const dispatch = useDispatch();
    const apolloClient = useApolloClient();

    return (user: UserModel, token: string, options?: { redirect?: string }) => {
        set(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME, token, CookieParams.getCookieParams());
        if (window._paq) {
            Matomo.default().setUserId(String(user.id));
        }
        dispatch(createCloseDrawerAction());
        apolloClient.writeQuery({
            query: GetCurrentUserQuery,
            data: {
                currentUser: user
            }
        });
        setTimeout(() => {
            if (options && options.redirect) {
                window.location.href = options.redirect;
            } else {
                window.location.reload();
            }
        }, 500);
    };
};