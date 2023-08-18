import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faExpand } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from 'administration/AdminPage';
import { ConstraintList } from 'administration/users/ConstraintsList';
import { GetServerSidePropsContext } from 'next';

const ConstraintsRoute = () => {
    return (
        <AdminPage
            title={
                <>
                    <Icon icon={faExpand} /> Beschränkungen
                </>
            }
            component={ConstraintList}
            hasHomeLink
        />
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default ConstraintsRoute;
