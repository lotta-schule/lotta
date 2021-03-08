import { UserModel } from 'model';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { configureScope } from '@sentry/react';
import Matomo from 'matomo-ts';

export const useCurrentUser = () => {
    const { data, loading, called } = useQuery<{
        currentUser: UserModel | null;
    }>(GetCurrentUserQuery);
    const currentUser = data?.currentUser ?? null;

    useEffect(() => {
        // Sentry Error tracking
        configureScope((scope) => {
            scope.setUser(
                currentUser
                    ? {
                          id: currentUser.id,
                          username: currentUser.nickname ?? currentUser.name,
                      }
                    : null
            );
        });

        // Matomo Site Analytics
        if (window._paq) {
            if (currentUser) {
                Matomo.default().setUserId(currentUser.id);
            } else {
                Matomo.default().resetUserId();
            }
        }
    }, [currentUser]);

    if (loading || !called) {
        return undefined;
    }
    return data?.currentUser || null;
};
