import { UserModel } from 'model';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { useQuery, QueryResult } from '@apollo/client';

export const useCurrentUser = (): [UserModel | null, Omit<QueryResult, 'data'>] => {
    const { data, ...otherOps } = useQuery<{ currentUser: UserModel | null }>(GetCurrentUserQuery);
    return [(data ? data.currentUser : null), otherOps];
}
