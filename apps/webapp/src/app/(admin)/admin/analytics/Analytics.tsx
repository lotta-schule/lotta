'use client';

import * as React from 'react';
import { LinearProgress, Option, Select, Toolbar } from '@lotta-schule/hubert';
import { addMonths, format, isSameMonth } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { de } from 'date-fns/locale';
import { AdminPageSection } from '../_component/AdminPageSection';
import {
  MetricsOverview,
  MetricsChart,
  PropertyBreakdown,
  CurrentOnlineUserCounter,
} from './_component';
import { formatDate } from './_util';

import styles from './Analytics.module.scss';

export type Period = ({ type: 'month'; date: Date } | { type: '30d' }) & {
  key: string;
};

export const Analytics = React.memo(() => {
  const { t } = useTranslation();

  const THIRTYDAYS_PERIOD = React.useMemo(
    () => ({ type: '30d', key: '30d' }) as Period,
    []
  );

  const availableMonths = React.useMemo(() => {
    const months = [new Date('2024-03-01')];
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
    [t, availableMonths]
  );

  const [currentPeriod, setCurrentPeriod] = React.useState(possiblePeriods[0]);

  const changePeriod = React.useCallback(
    (key: string) => {
      const p = possiblePeriods.find(({ period }) => period.key === key);
      if (p) {
        React.startTransition(() => {
          setCurrentPeriod(p);
        });
      }
    },
    [possiblePeriods]
  );

  return (
    <div className={styles.root}>
      <Toolbar hasScrollableParent className={styles.toolbar}>
        <Select
          title="Monat wählen"
          value={currentPeriod.period.key}
          onChange={changePeriod}
        >
          {possiblePeriods.map(({ period, label }) => (
            <Option key={period.key} value={period.key}>
              {label}
            </Option>
          ))}
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
          <MetricsChart period={currentPeriod.period} />
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
            <PropertyBreakdown period={currentPeriod.period} type="device" />
            <PropertyBreakdown period={currentPeriod.period} type="source" />
          </div>
        </React.Suspense>
      </AdminPageSection>
    </div>
  );
});
Analytics.displayName = 'AdminSystemAnalytics';
