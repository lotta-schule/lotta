import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faSliders } from '@fortawesome/free-solid-svg-icons';
import { AdminPage } from 'administration/AdminPage';
import { GeneralSettings } from 'administration/system/GeneralSettings';
import { GetServerSidePropsContext } from 'next';

const GeneralRoute = () => {
    return (
        <AdminPage
            title={
                <>
                    <Icon icon={faSliders} /> Grundeinstellungen
                </>
            }
            component={GeneralSettings}
            hasHomeLink
        />
    );
};

export const getServerSideProps = async ({}: GetServerSidePropsContext) => {
    return {
        props: {},
    };
};

export default GeneralRoute;
