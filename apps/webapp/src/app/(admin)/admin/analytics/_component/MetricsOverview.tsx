import * as React from 'react';
import { useSuspenseQuery } from '@apollo/client';
import { Box } from '@lotta-schule/hubert';
import { MetricType } from './MetricType';
import { formatDate } from '../_util';
import { Period } from '../Analytics';
import { t } from 'i18next';

import styles from './MetricsOverview.module.scss';

import GetTenantAggregateAnalyticsQuery from 'api/query/analytics/GetTenantAggregateAnalyticsQuery.graphql';

export type MetricsOverviewProps = {
  period: Period;
};

export const MetricsOverview = React.memo(
  ({ period }: MetricsOverviewProps) => {
    const {
      data: {
        analytics: {
          visits,
          visitors,
          pageviews,
          bounceRate,
          visitDuration,
          viewsPerVisit,
        },
      },
    } = useSuspenseQuery<
      {
        analytics: Record<MetricType, number>;
      },
      { date: string; period: '30d' | 'month' }
    >(GetTenantAggregateAnalyticsQuery, {
      variables: {
        date: formatDate(period.type === '30d' ? new Date() : period.date),
        period: period.type,
      },
    });

    return (
      <Box className={styles.root}>
        <div>
          <span>{t('visits')}:</span>
          <span>{visits}</span>
        </div>
        <div>
          <span>{t('visitors')}:</span>
          <span>{visitors}</span>
        </div>
        <div>
          <span>{t('pageviews')}:</span>
          <span>{pageviews}</span>
        </div>
        <div>
          <span>{t('bouncerate')}:</span>
          <span>{bounceRate}%</span>
        </div>
        <div>
          <span>⌀ {t('visitDuration')}:</span>
          <span>
            {Math.floor(visitDuration / 60)}m {visitDuration % 60}s
          </span>
        </div>
        <div>
          <span>{t('pageviews per visit')}:</span>
          <span>{viewsPerVisit}</span>
        </div>
      </Box>
    );
  }
);
MetricsOverview.displayName = 'MetricsOverview';
