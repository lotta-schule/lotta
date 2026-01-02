'use client';

import * as React from 'react';
import { LinearProgress, Option, Select, Toolbar } from '@lotta-schule/hubert';
import { addMonths, format, isSameMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { de } from 'date-fns/locale';
import { AdminPageSection } from '../_component/AdminPageSection';
import {
  MetricsOverview,
  PropertyBreakdown,
  CurrentOnlineUserCounter,
  MetricType,
} from './_component';
import { formatDate } from './_util';

import styles from './Analytics.module.scss';

const MetricsChart = React.lazy(() => import('./_component/MetricsChart'));

export type Period = ({ type: 'month'; date: Date } | { type: '30d' }) & {
  key: string;
};

export const Analytics = React.memo(() => {
  const [isPending, startTransition] = React.useTransition();
  const { t } = useTranslation();

  const THIRTYDAYS_PERIOD = React.useMemo(
    () => ({ type: '30d', key: '30d' }) as Period,
    []
  );

  const availableMonths = React.useMemo(() => {
    const months = [new Date('2024-03-01T12:00:00+01:00')];
    while (
      !isSameMonth(new Date(), months.slice(-1)[0] ?? new Date()) &&
      months.length < 120
    ) {
      months.push(addMonths(months.slice(-1)[0], 1));
    }

    return months.reverse();
  }, []);

  const possiblePeriods = React.useMemo(
    () => [
      { period: THIRTYDAYS_PERIOD, label: t('last 30 days') },
      ...availableMonths.map((date) => ({
        period: {
          type: 'month',
          date,
          key: formatDate(date),
        } as Period,
        label: format(date, 'MMMM yyyy', { locale: de }),
      })),
    ],
    [THIRTYDAYS_PERIOD, t, availableMonths]
  );

  const [currentPeriod, setCurrentPeriod] = React.useState(possiblePeriods[0]);
  const [selectedMetric, setSelectedMetric] =
    React.useState<MetricType>('visits');

  const changePeriod = React.useCallback(
    (key: string) => {
      const p = possiblePeriods.find(({ period }) => period.key === key);
      if (p) {
        startTransition(() => {
          setCurrentPeriod(p);
        });
      }
    },
    [possiblePeriods, startTransition]
  );

  return (
    <div className={styles.root}>
      <Toolbar hasScrollableParent className={styles.toolbar}>
        <Select
          title={t('Select period')}
          value={currentPeriod.period.key}
          disabled={isPending}
          onChange={changePeriod}
        >
          {possiblePeriods.map(({ period, label }) => (
            <Option key={period.key} value={period.key}>
              {label}
            </Option>
          ))}
        </Select>
        <Select
          title={t('Select metric')}
          value={selectedMetric}
          disabled={isPending}
          onChange={(value) => {
            startTransition(() => {
              setSelectedMetric(value as MetricType);
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
        <CurrentOnlineUserCounter />
      </Toolbar>

      <React.Suspense
        fallback={
          <>
            <AdminPageSection title={t('overview')}>
              <div
                style={{ height: 'calc(3em + calc(2 * var(--lotta-spacing)))' }}
              />
            </AdminPageSection>
            <AdminPageSection title={t('overview')}>
              <div style={{ height: 500, width: '100%' }} />
            </AdminPageSection>
          </>
        }
      >
        <AdminPageSection title={t('overview')}>
          <MetricsOverview period={currentPeriod.period} />
        </AdminPageSection>

        <AdminPageSection title={t('development')}>
          <MetricsChart period={currentPeriod.period} metric={selectedMetric} />
        </AdminPageSection>
      </React.Suspense>

      <AdminPageSection title={t('visitor breakdown')}>
        <React.Suspense
          fallback={
            <LinearProgress
              isIndeterminate
              label={t('visitor breakdown is being loaded ...')}
            />
          }
        >
          <div className={styles.breakdownGrid}>
            <PropertyBreakdown
              period={currentPeriod.period}
              metric={selectedMetric}
              properties={[
                { name: 'VISIT_DEVICE', label: t('device type') },
                { name: 'VISIT_BROWSER', label: t('browser') },
                { name: 'VISIT_OS', label: t('OS') },
              ]}
            />
            <PropertyBreakdown
              period={currentPeriod.period}
              metric={selectedMetric}
              properties={[
                { name: 'VISIT_SOURCE', label: t('visitor source') },
                { name: 'VISIT_ENTRY_PAGE', label: t('entry page') },
                { name: 'VISIT_EXIT_PAGE', label: t('exit page') },
              ]}
            />
          </div>
        </React.Suspense>
      </AdminPageSection>
    </div>
  );
});
Analytics.displayName = 'AdminSystemAnalytics';
