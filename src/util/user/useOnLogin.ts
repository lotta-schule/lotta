import { useApolloClient, useMutation, MutationTuple } from '@apollo/client';
import { LoginMutation } from 'api/mutation/LoginMutation';
import { RegisterMutation } from 'api/mutation/RegisterMutation';
import { ResetPasswordMutation } from 'api/mutation/ResetPasswordMutation';
import useRouter from 'use-react-router';

export const useOnLogin = (fn: 'login' | 'register' | 'resetPassword', options?: { redirect?: string, onCompleted?(data?: unknown): void }): MutationTuple<any, any> => {
    const { history } = useRouter();
    const apolloClient = useApolloClient();
    const mutation = fn === 'register' ? RegisterMutation :
        fn === 'login' ? LoginMutation : ResetPasswordMutation;
    const [login, { error, loading, called }] = useMutation(mutation, {
        errorPolicy: 'all',
        onCompleted: data => {
            if (data[fn]) {
                apolloClient.resetStore();
                localStorage.setItem('id', data[fn].accessToken);
                options?.onCompleted?.(data);
                if (options?.redirect) {
                    history.push(options.redirect);
                }
            }
        }
    });
    return [login, { error, loading, called }];
};
