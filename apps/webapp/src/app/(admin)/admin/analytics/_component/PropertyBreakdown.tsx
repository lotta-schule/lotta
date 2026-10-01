import * as React from 'react';
import { useSuspenseQuery } from '@apollo/client/react';
import { Table } from '@lotta-schule/hubert';
import { formatDate } from '../_util';
import { Period } from '../Analytics';
import { gqlCompatibleMetricType, MetricType } from './MetricType';
import { PropertyIcon } from './PropertyIcon';
import { t } from 'i18next';

import styles from './PropertyBreakdown.module.scss';

import { GET_TENANT_BREAKDOWN_ANALYTICS } from '../_graphql';

export type PropertyBreakdownProps = {
  period: Period;
  properties: { name: string; label: string }[];
  metric: MetricType;
};

export const PropertyBreakdown = React.memo(
  ({
    period,
    properties: possibleProperties,
    metric,
  }: PropertyBreakdownProps) => {
    const [selectedProperty, setSelectedProperty] = React.useState(
      possibleProperties[0]
    );

    const metrics = React.useMemo(
      () =>
        (metric === 'viewsPerVisit' ? (['visits'] as const) : [metric]).map(
          gqlCompatibleMetricType
        ),
      [metric]
    );

    const {
      data: { properties },
    } = useSuspenseQuery(GET_TENANT_BREAKDOWN_ANALYTICS, {
      variables: {
        date: formatDate(period.type === '30d' ? new Date() : period.date),
        period: period.type,
        property: selectedProperty.name as any,
        metrics,
      },
    });

    return (
      <Table className={styles.root}>
        <thead>
          <tr>
            <td className={styles.propertySelectionCell}>
              {possibleProperties.map((property, i, arr) => (
                <React.Fragment key={property.name}>
                  {property.name === selectedProperty.name ? (
                    <span className={styles.selectedProperty}>
                      {property.label}
                    </span>
                  ) : (
                    <a
                      key={property.name}
                      href="#"
                      onClick={() => {
                        React.startTransition(() => {
                          setSelectedProperty(property);
                        });
                      }}
                    >
                      {property.label}
                    </a>
                  )}
                  {i < arr.length - 1 && (
                    <span className={styles.propertySelectionDevider}>|</span>
                  )}
                </React.Fragment>
              ))}
            </td>
            <td align="right">{t(metric.toLowerCase())}</td>
          </tr>
        </thead>
        <tbody>
          {properties.map(
            ({ property, metrics: [{ metric: _metricName, value }] }) => (
              <tr key={property}>
                <td>
                  <PropertyIcon
                    name={selectedProperty.name as any}
                    value={property}
                  />
                  {property}
                </td>
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
