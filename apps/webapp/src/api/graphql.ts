import { initGraphQLTada } from 'gql.tada';
import { introspection } from './graphql-env';

export const graphql = initGraphQLTada<{
  introspection: typeof introspection;
  scalars: {
    Date: string;
    DateTime: string;
    Json: unknown;
  };
}>();

export type { FragmentOf, ResultOf, VariablesOf } from 'gql.tada';
export { readFragment } from 'gql.tada';
export { introspection } from './graphql-env';
