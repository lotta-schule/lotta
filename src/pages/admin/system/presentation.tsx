import * as React from 'react';
import { Palette } from '@material-ui/icons';
import { Presentation } from 'administration/system/Presentation';
import { AdminPage } from 'administration/AdminPage';
import { GetServerSidePropsContext } from 'next';

const PresentationRoute = () => {
    return (
        <AdminPage
            title={
                <>
                    <Palette /> Darstellung
                </>
            }
            component={Presentation}
            hasHomeLink
        />
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default PresentationRoute;
