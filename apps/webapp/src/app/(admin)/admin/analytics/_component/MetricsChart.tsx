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
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title);

import styles from './MetricsChart.module.scss';

export type MetricsChartProps = {
  period: Period;
  metric: MetricType;
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

    const chartData = React.useMemo(
      () => ({
        labels:
          metrics.map((m) =>
            format(new Date(m.date), 'doMM', { locale: de })
          ) ?? [],
        datasets: [
          {
            data: metrics.map((m) => m.value) ?? [],
            borderColor: 'rgb(var(--lotta-primary-color))',
            backgroundColor: 'rgba(var(--lotta-primary-color), 0.5)',
            fill: true,
            tension: 0.4,
          },
        ],
      }),
      [metrics]
    );

    return (
      <Box className={styles.root}>
        <div className={styles.chartWrapper} data-testid="ChartWrapper">
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                title: { display: true, text: t(metric) },
                legend: {
                  display: true,
                  position: 'top' as const,
                },
              },
            }}
          />
        </div>
      </Box>
    );
  }
);
MetricsChart.displayName = 'MetricsChart';
