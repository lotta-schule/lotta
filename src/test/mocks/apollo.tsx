import { GetUserQuery } from 'api/query/GetUserQuery';
import { RegisteredUser } from 'test/fixtures/User';

export const apolloMocks = [
    {
        request: {
            query: GetUserQuery
        },
        result: {
            data: {
                user: RegisteredUser
            }
        }
    }
];