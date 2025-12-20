'use client';
import * as React from 'react';
import { useSuspenseQuery } from '@apollo/client/react';
import { Box } from '@lotta-schule/hubert';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { formatDate } from '../_util';
import { de } from 'date-fns/locale';
import { Period } from '../Analytics';
import { gqlCompatibleMetricType, MetricType } from './MetricType';
import { GET_TENANT_TIMESERIES_ANALYTICS } from '../_graphql';
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import styles from './MetricsChart.module.scss';

export type MetricsChartProps = {
  period: Period;
  metric: MetricType;
};

type DailyMetric = {
  date: string;
  value: number | null;
};

export const MetricsChart = React.memo(
  ({ period, metric: metricType }: MetricsChartProps) => {
    const { t } = useTranslation();
    const metric = React.useMemo(
      () => gqlCompatibleMetricType(metricType),
      [metricType]
    );

    const {
      data: { metrics },
    } = useSuspenseQuery(GET_TENANT_TIMESERIES_ANALYTICS, {
      variables: {
        date: formatDate(period.type === '30d' ? new Date() : period.date),
        metric,
        period: period.type,
      },
    });

    const series: { label: string; data: DailyMetric[] }[] = React.useMemo(
      () => [
        {
          label: t(metric),
          data:
            metrics.map((m) => ({
              date: format(new Date(m.date), 'doMM', { locale: de }),
              value: m.value,
            })) ?? [],
        },
      ],
      [metric, metrics, t]
    );

    console.log(series);

    return (
      <Box className={styles.root}>
        <div className={styles.chartWrapper} data-testid="ChartWrapper">
          <ResponsiveContainer>
            <AreaChart
              data={series.at(0)?.data ?? []}
              margin={{
                top: 40,
                right: 40,
                bottom: 40,
                left: 40,
              }}
            >
              <XAxis dataKey="date" angle={-45} textAnchor="end" />
              <YAxis label={series.at(0)?.label} />
              <Tooltip active />
              <Area
                type="monotone"
                dataKey="value"
                stroke="rgb(var(--lotta-primary-color))"
                fill="rgba(var(--lotta-primary-color), 0.5)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Box>
    );
  }
);
MetricsChart.displayName = 'MetricsChart';
