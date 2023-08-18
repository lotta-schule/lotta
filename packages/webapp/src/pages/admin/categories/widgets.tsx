import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faSquareCaretRight } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from 'administration/AdminPage';
import { WidgetList } from 'administration/categories/WidgetList';
import { GetServerSidePropsContext } from 'next';

const WidgetsRoute = () => {
    return (
        <AdminPage
            title={
                <>
                    <Icon icon={faSquareCaretRight} /> Marginalen
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
