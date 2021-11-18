import * as React from 'react';
import { Slideshow } from '@material-ui/icons';
import { AdminPage } from 'administration/AdminPage';
import { WidgetList } from 'administration/categories/WidgetList';
import { GetServerSidePropsContext } from 'next';

const WidgetsRoute = () => {
    return (
        <AdminPage
            title={
                <>
                    <Slideshow /> Marginalen
                </>
            }
            component={WidgetList}
            hasHomeLink
        />
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default WidgetsRoute;
