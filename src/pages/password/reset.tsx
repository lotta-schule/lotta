import * as React from 'react';
import { GetServerSidePropsContext } from 'next';
import { ResetPage } from 'password/ResetPage';

const ResetRoute = () => {
    return <ResetPage />;
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default ResetRoute;
