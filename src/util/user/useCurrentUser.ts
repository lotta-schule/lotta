import { UserModel } from 'model';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { useQuery, QueryResult } from '@apollo/client';
import { useEffect } from 'react';
import { configureScope } from '@sentry/react';
import Matomo from 'matomo-ts';

export const useCurrentUser = (): [UserModel | null, Omit<QueryResult, 'data'>] => {
    const { data, ...otherOps } = useQuery<{ currentUser: UserModel | null }>(GetCurrentUserQuery);
    const currentUser = data?.currentUser ?? null;

    const currentUserId = currentUser?.id;

    useEffect(() => {
        // Sentry Error tracking
        configureScope(scope => {
            scope.setUser(currentUser ? {
                id: currentUser.id,
                username: currentUser.nickname ?? currentUser.name
            } : null);
        });

        // Matomo Site Analytics
        if (window._paq) {
            if (currentUser) {
                Matomo.default().setUserId(currentUser.id);
            } else {
                Matomo.default().resetUserId();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserId]);

    return [currentUser, otherOps];
}
