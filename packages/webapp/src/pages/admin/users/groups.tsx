import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faUserGroup } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from 'administration/AdminPage';
import { GroupList } from 'administration/users/GroupList';
import { GetServerSidePropsContext } from 'next';

const GroupsRoute = () => {
    return (
        <AdminPage
            title={
                <>
                    <Icon icon={faUserGroup} /> Gruppen
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
