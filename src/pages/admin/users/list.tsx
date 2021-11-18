import * as React from 'react';
import { AccountCircle } from '@material-ui/icons';
import { AdminPage } from 'administration/AdminPage';
import { UserList } from 'administration/users/UserList';
import { GetServerSidePropsContext } from 'next';

const ListRoute = () => {
    return (
        <AdminPage
            title={
                <>
                    <AccountCircle /> Nutzer
                </>
            }
            hasHomeLink
            component={UserList}
        />
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default ListRoute;
