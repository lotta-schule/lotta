import * as React from 'react';
import { ConversationModel } from 'model';
import { getApolloClient } from 'api/client';
import { MessagingPage } from 'messaging/MessagingPage';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';

import GetConversationsQuery from 'api/query/GetConversationsQuery.graphql';

const MessagingRoute = ({
    conversations,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return <MessagingPage conversations={conversations} />;
};

export const getServerSideProps = async ({
    req,
}: GetServerSidePropsContext) => {
    const { data } = await getApolloClient().query<{
        conversations: ConversationModel[];
    }>({
        query: GetConversationsQuery,
        context: {
            headers: req?.headers,
        },
    });
    return {
        props: {
            conversations: data?.conversations,
        },
    };
};

export default MessagingRoute;
