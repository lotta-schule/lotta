import * as React from 'react';
import { Group } from '@material-ui/icons';
import { AdminPage } from 'administration/AdminPage';
import { GroupList } from 'administration/users/GroupList';
import { GetServerSidePropsContext } from 'next';

const GroupsRoute = () => {
    return (
        <AdminPage
            title={
                <>
                    <Group /> Gruppen
                </>
            }
            component={GroupList}
            hasHomeLink
        />
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default GroupsRoute;
