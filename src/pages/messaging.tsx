import * as React from 'react';
import { MessagingPage } from 'layouts/messaging/MessagingPage';
import { GetServerSidePropsContext } from 'next';

const MessagingRoute = () => {
    return <MessagingPage />;
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default MessagingRoute;
