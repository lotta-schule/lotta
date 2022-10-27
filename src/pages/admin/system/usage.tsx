import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { getApolloClient } from 'api/client';
import { AdminPage } from 'administration/AdminPage';
import { Usage } from 'administration/system/Usage';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';

import GetUsageQuery from 'api/query/GetUsageQuery.graphql';

const UsageRoute = ({
    usage,
    loadUsageError: error,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    return (
        <AdminPage
            title={
                <>
                    <Icon icon={faChartBar} /> Nutzung
                </>
            }
            component={() => <Usage error={error} usage={usage} />}
            hasHomeLink
        />
    );
};

export const getServerSideProps = async ({
    req,
}: GetServerSidePropsContext) => {
    const {
        data: { usage },
        error,
    } = await getApolloClient().query<{ usage: any }>({
        query: GetUsageQuery,
        context: {
            headers: req?.headers,
        },
    });

    return {
        props: {
            usage,
            loadUsageError: error ?? null,
        },
    };
};

export default UsageRoute;
