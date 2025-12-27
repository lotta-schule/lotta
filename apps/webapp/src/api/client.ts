import { cache } from 'react';
import {
  ApolloClient,
  registerApolloClient,
} from '@apollo/client-integration-nextjs';
import { createRSCClient } from './apollo/client-rsc';

const registeredApolloClient = registerApolloClient(createRSCClient);

export const getClient = cache(() => registeredApolloClient.getClient());

export const query: ApolloClient['query'] = async (options) =>
  (await getClient()).query(options);
