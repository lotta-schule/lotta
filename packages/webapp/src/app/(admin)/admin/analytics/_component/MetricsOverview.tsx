import * as React from 'react';
import { useQuery } from '@apollo/client';
import { Box, LinearProgress } from '@lotta-schule/hubert';
import { MetricType } from './MetricType';

import styles from './MetricsOverview.module.scss';

import GetTenantAggregateAnalyticsQuery from 'api/query/analytics/GetTenantAggregateAnalyticsQuery.graphql';

export type MetricsOverviewProps = {
  date: string;
};

export const MetricsOverview = React.memo(({ date }: MetricsOverviewProps) => {
  const { data, loading } = useQuery<
    {
      analytics: Record<MetricType, number>;
    },
    { date: string }
  >(GetTenantAggregateAnalyticsQuery, { variables: { date } });

  if (loading) {
    return (
      <LinearProgress isIndeterminate aria-label={'Metriken werden geladen'} />
    );
  }

  return (
    <Box className={styles.root}>
      {data?.analytics && (
        <>
          <div>
            <span>Besuche:</span>
            <span>{data?.analytics.visits}</span>
          </div>
          <div>
            <span>Besucher:</span>
            <span>{data?.analytics.visitors}</span>
          </div>
          <div>
            <span>Seitenaufrufe:</span>
            <span>{data?.analytics.pageviews}</span>
          </div>
          <div>
            <span>Absprungrate:</span>
            <span>{data?.analytics.bounceRate}%</span>
          </div>
          <div>
            <span>⌀ Besuchsdauer:</span>
            <span>
              {Math.floor(data.analytics.visitDuration / 60)}m{' '}
              {data.analytics.visitDuration % 60}s
            </span>
          </div>
          <div>
            <span>Seiten pro Besuch:</span>
            <span>{data?.analytics.viewsPerVisit}</span>
          </div>
        </>
      )}
    </Box>
  );
});
MetricsOverview.displayName = 'MetricsOverview';
