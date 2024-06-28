declare module 'apollo-v3-absinthe-upload-link' {
  import { ApolloLink } from '@apollo/client';

  export type LinkOptions = {
    uri: string;
    fetch: typeof fetch;
  };

  export function createLink(options: CreateLinkOptions): ApolloLink;
}
