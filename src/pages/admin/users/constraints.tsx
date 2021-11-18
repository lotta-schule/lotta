import * as React from 'react';
import { CropFree } from '@material-ui/icons';
import { AdminPage } from 'administration/AdminPage';
import { ConstraintList } from 'administration/users/ConstraintsList';
import { GetServerSidePropsContext } from 'next';

const ConstraintsRoute = () => {
    return (
        <AdminPage
            title={
                <>
                    <CropFree /> Beschränkungen
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
