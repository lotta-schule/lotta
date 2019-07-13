declare module 'apollo-absinthe-upload-link' {

    import { ApolloLink } from 'apollo-link';

    export type LinkOptions = {
        uri: string;
        fetch: typeof fetch
    };

    export function createLink(options: CreateLinkOptions): ApolloLink;
}