import * as React from 'react';
import { GetServerSidePropsContext } from 'next';
import { AdminPage } from 'administration/AdminPage';
import { Navigation } from 'administration/Navigation';

const AdminRoute = () => {
    return <AdminPage title={'Start'} component={Navigation} />;
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default AdminRoute;
