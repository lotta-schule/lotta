import { set } from 'js-cookie';
import { useDispatch } from 'react-redux';
import { createCloseDrawerAction } from 'store/actions/layout';
import { CookieParams } from 'util/path/CookieParams';

export const useOnLogin = (options?: { redirect?: string }) => {
    const dispatch = useDispatch();
    return (token: string) => {
        dispatch(createCloseDrawerAction());
        set(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME, token, CookieParams.getCookieParams());
        if (options && options.redirect) {
            window.location.href = options.redirect;
        } else {
            window.location.reload();
        }
    };
};