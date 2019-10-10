import { RegisteredUser } from 'test/fixtures/User';
import { TestTenant } from 'test/fixtures/Tenant';
import { UeberSuedamerika, VivaLaRevolucion } from 'test/fixtures/Article';
import { GetTenantQuery } from 'api/query/GetTenantQuery';
import { GetCurrentUserQuery } from 'api/query/GetCurrentUser';
import { GetArticleQuery } from 'api/query/GetArticleQuery';

export const apolloMocks = [
    {
        request: {
            query: GetTenantQuery,
            variables: {}
        },
        result: {
            data: {
                tenant: TestTenant
            }
        }
    },
    {
        request: {
            query: GetCurrentUserQuery,
            variables: {}
        },
        result: {
            data: {
                user: RegisteredUser
            }
        }
    },
    {
        request: {
            query: GetArticleQuery,
            variables: {
                id: UeberSuedamerika.id
            }
        },
        result: {
            data: {
                article: UeberSuedamerika
            }
        }
    },
    {
        request: {
            query: GetArticleQuery,
            variables: {
                id: VivaLaRevolucion.id
            }
        },
        result: {
            data: {
                article: VivaLaRevolucion
            }
        }
    }
];