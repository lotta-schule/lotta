import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc';
import { createRSCClient } from './apollo/client-rsc';

export const { getClient } = registerApolloClient(createRSCClient);
