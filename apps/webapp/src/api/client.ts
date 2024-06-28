import { cache } from 'react';
import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc';
import { createRSCClient } from './apollo/client-rsc';

const registeredApolloClient = registerApolloClient(createRSCClient);

export const getClient = cache(() => registeredApolloClient.getClient());
