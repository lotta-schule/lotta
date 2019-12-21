import { set } from 'js-cookie';
import { useDispatch } from 'react-redux';
import { createCloseDrawerAction } from 'store/actions/layout';
import { CookieParams } from 'util/path/CookieParams';
import { useApolloClient, useMutation, MutationTuple } from '@apollo/react-hooks';
import { LoginMutation } from 'api/mutation/LoginMutation';
import { RegisterMutation } from 'api/mutation/RegisterMutation';
import { ResetPasswordMutation } from 'api/mutation/ResetPasswordMutation';
import useRouter from 'use-react-router';

export const useOnLogin = (fn: 'login' | 'register' | 'resetPassword', options?: { redirect?: string, onCompleted?(data?: unknown): void }): MutationTuple<any, any> => {
    const dispatch = useDispatch();
    const { history } = useRouter();
    const apolloClient = useApolloClient();
    const mutation = fn === 'register' ? RegisterMutation :
        fn === 'login' ? LoginMutation : ResetPasswordMutation;
    const [login, { error, loading, called }] = useMutation(mutation, {
        errorPolicy: 'all',
        onCompleted: data => {
            dispatch(createCloseDrawerAction());
            set(process.env.REACT_APP_AUTHENTICATION_TOKEN_NAME, data[fn].token, CookieParams.getCookieParams());
            apolloClient.resetStore();
            options?.onCompleted?.(data);
            if (options?.redirect) {
                history.push(options.redirect);
            }

        }
    });
    return [login, { error, loading, called }];
};