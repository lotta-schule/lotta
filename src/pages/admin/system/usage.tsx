import * as React from 'react';
import { BarChart } from '@material-ui/icons';
import { getApolloClient } from 'api/client';
import { AdminPage } from 'layouts/administration/AdminPage';
import { Usage } from 'layouts/administration/system/Usage';
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
                    <BarChart /> Nutzung
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
