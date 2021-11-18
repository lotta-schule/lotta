import * as React from 'react';
import { GetServerSidePropsContext } from 'next';
import { ResetPage } from 'layouts/password/ResetPage';

const ResetRoute = () => {
    return <ResetPage />;
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default ResetRoute;
