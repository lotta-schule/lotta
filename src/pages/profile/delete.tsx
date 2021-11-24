import * as React from 'react';
import { GetServerSidePropsContext } from 'next';
import { DeletePage } from 'profile/DeletePage';

const DeleteRoute = () => {
    return <DeletePage />;
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default DeleteRoute;
