import { UserModel } from 'model';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { useQuery } from '@apollo/react-hooks';

export const useCurrentUser = () => {
    return useQuery<{ currentUser: UserModel | null }>(GetCurrentUserQuery);
}