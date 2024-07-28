import * as React from 'react';
import { useSuspenseQuery } from '@apollo/client';
import { Box, Option, Select, Toolbar } from '@lotta-schule/hubert';
import { type AxisOptions } from 'react-charts';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { formatDate } from '../_util';
import { de } from 'date-fns/locale';
import { Period } from '../Analytics';
import dynamic from 'next/dynamic';

import styles from './MetricsChart.module.scss';

import GetTenantTimeseriesAnalyticsQuery from 'api/query/analytics/GetTenantTimeseriesAnalyticsQuery.graphql';

const Chart = dynamic(
  () => import('react-charts').then((mod) => mod.Chart),
  {}
);

export type MetricsChartProps = {
  period: Period;
};

type DailyMetric = {
  date: Date;
  value: number;
};

export const MetricsChart = React.memo(({ period }: MetricsChartProps) => {
  const { t } = useTranslation();

  const [selectedMetric, setSelectedMetric] = React.useState('visits');

  const {
    data: { metrics },
  } = useSuspenseQuery<
    {
      metrics: { date: string; value: number }[];
    },
    { date: string; metric: string; period: 'month' | '30d' }
  >(GetTenantTimeseriesAnalyticsQuery, {
    variables: {
      date: formatDate(period.type === '30d' ? new Date() : period.date),
      metric: selectedMetric.replace(/([A-Z])/g, '_$1').toUpperCase(),
      period: period.type,
    },
  });

  const primaryAxis = React.useMemo<AxisOptions<any>>(
    () => ({
      getValue: (datum) => datum.date,
      formatters: {
        tooltip: (datum: Date) =>
          datum && format(datum, 'EEEE', { locale: de }),
        scale: (value: Date) => value && format(value, 'doMM', { locale: de }),
        showGrid: false,
      },
    }),
    []
  );

  const secondaryAxes = React.useMemo(
    (): AxisOptions<any>[] => [
      {
        getValue: (datum) => datum.value,
        elementType: 'area',
      },
    ],
    []
  );

  const series: { label: string; data: DailyMetric[] }[] = React.useMemo(
    () => [
      {
        label: t(selectedMetric),
        data:
          metrics.map((m) => ({
            date: new Date(m.date),
            value: m.value,
          })) ?? [],
      },
    ],
    [metrics]
  );

  return (
    <Box className={styles.root}>
      <Toolbar className={styles.toolbar}>
        <Select
          title={t('Select metric')}
          value={selectedMetric}
          onChange={(value) => {
            React.startTransition(() => {
              setSelectedMetric(value);
            });
          }}
          className={styles.metricSelect}
        >
          <Option key={'visits'} value={'visits'}>
            {t('visits')}
          </Option>
          <Option key={'visitors'} value={'visitors'}>
            {t('visitors')}
          </Option>
          <Option key={'pageviews'} value={'pageviews'}>
            {t('pageviews')}
          </Option>
          <Option key={'bounceRate'} value={'bounceRate'}>
            {t('bounceRate')}
          </Option>
          <Option key={'visitDuration'} value={'visitDuration'}>
            {t('visitDuration')}
          </Option>
          <Option key={'viewsPerVisit'} value={'viewsPerVisit'}>
            {t('viewsPerVisit')}
          </Option>
        </Select>
      </Toolbar>
      <div className={styles.chartWrapper} data-testid="ChartWrapper">
        <Chart
          options={{
            data: series,
            primaryAxis,
            secondaryAxes,
            padding: {
              top: 40,
              right: 40,
              bottom: 40,
              left: 40,
            },
            defaultColors: ['rgb(var(--lotta-primary-color))'],
          }}
        />
      </div>
    </Box>
  );
});
MetricsChart.displayName = 'MetricsChart';
