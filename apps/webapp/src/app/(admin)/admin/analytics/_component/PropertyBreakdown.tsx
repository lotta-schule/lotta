import * as React from 'react';
import { useSuspenseQuery } from '@apollo/client';
import { Table } from '@lotta-schule/hubert';
import { formatDate } from '../_util';
import { Period } from '../Analytics';
import { MetricType } from './MetricType';
import { t } from 'i18next';

import GetTenantBreakdownAnalytics from 'api/query/analytics/GetTenantBreakdownAnalyticsQuery.graphql';

export type PropertyBreakdownProps = {
  period: Period;
  type: 'device' | 'source';
};

export const PropertyBreakdown = React.memo(
  ({ period, type }: PropertyBreakdownProps) => {
    const metric = 'VISITORS';

    const {
      data: { properties },
    } = useSuspenseQuery<
      {
        properties: {
          property: string;
          metrics: { metric: MetricType; value: number }[];
        }[];
      },
      {
        date: string;
        period: '30d' | 'month';
        property: string;
        metric: Uppercase<MetricType>;
      }
    >(GetTenantBreakdownAnalytics, {
      variables: {
        date: formatDate(period.type === '30d' ? new Date() : period.date),
        period: period.type,
        property: type === 'device' ? 'VISIT_DEVICE' : 'VISIT_SOURCE',
        metric,
      },
    });

    const header = React.useMemo(() => {
      if (type === 'device') {
        return t('device type');
      } else {
        return t('source of visit');
      }
    }, []);

    return (
      <Table>
        <thead>
          <tr>
            <td>{header}</td>
            <td align="right">{t(metric.toLowerCase())}</td>
          </tr>
        </thead>
        <tbody>
          {properties.map(
            ({ property, metrics: [{ metric: _metricName, value }] }) => (
              <tr key={property}>
                <td>{property}</td>
                <td align="right">{value}</td>
              </tr>
            )
          )}
        </tbody>
      </Table>
    );
  }
);
PropertyBreakdown.displayName = 'PropertyBreakdown';
