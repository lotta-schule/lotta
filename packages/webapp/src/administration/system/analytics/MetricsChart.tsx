import * as React from 'react';
import { useQuery } from '@apollo/client';
import {
  Box,
  CircularProgress,
  ErrorMessage,
  Option,
  Select,
  Toolbar,
} from '@lotta-schule/hubert';
import { type AxisOptions } from 'react-charts';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import dynamic from 'next/dynamic';

import styles from './MetricsChart.module.scss';

import GetTenantTimeseriesAnalyticsQuery from 'api/query/analytics/GetTenantTimeseriesAnalyticsQuery.graphql';

const Chart = dynamic(
  () => import('react-charts').then((mod) => mod.Chart),
  {}
);

export type MetricsChartProps = {
  date: string;
};

type DailyMetric = {
  date: Date;
  value: number;
};

export const MetricsChart = React.memo(({ date }: MetricsChartProps) => {
  const { t } = useTranslation();

  const [selectedMetric, setSelectedMetric] = React.useState('visits');

  const { data, loading, error } = useQuery<
    {
      metrics: { date: string; value: number }[];
    },
    { date: string; metric: string }
  >(GetTenantTimeseriesAnalyticsQuery, {
    variables: {
      date,
      metric: selectedMetric.replace(/([A-Z])/g, '_$1').toUpperCase(),
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

  const series: { label: string; data: DailyMetric[] }[] = [
    {
      label: t(`analytics.${selectedMetric}`),
      data:
        data?.metrics.map((m) => ({
          date: new Date(m.date),
          value: m.value,
        })) ?? [],
    },
  ];

  return (
    <Box className={styles.root}>
      <Toolbar>
        {loading && (
          <CircularProgress
            isIndeterminate
            aria-label={'Statistiken werden geladen'}
          />
        )}
        <Select
          title="Metrik wählen"
          value={selectedMetric}
          onChange={(value) => setSelectedMetric(value)}
          className={styles.metricSelect}
        >
          {[
            'visits',
            'visitors',
            'pageviews',
            'bounceRate',
            'visitDuration',
            'viewsPerVisit',
          ].map((metric) => (
            <Option key={metric} value={metric}>
              {t(`analytics.${metric}`)}
            </Option>
          ))}
        </Select>
      </Toolbar>
      {error && <ErrorMessage error={error} />}
      {data?.metrics && (
        // The chart must be wrapped in a div with a known size when chart begins rendering.
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
      )}
    </Box>
  );
});
MetricsChart.displayName = 'MetricsChart';
