import * as React from 'react';
import { render, waitFor } from 'test/util';
import { MetricsOverview } from './MetricsOverview';

import GetTenantAggregateAnalyticsQuery from 'api/query/analytics/GetTenantAggregateAnalyticsQuery.graphql';

jest
  .useFakeTimers({ advanceTimers: 1 })
  .setSystemTime(new Date('2024-03-16').getTime());

const mocks = [
  {
    request: {
      query: GetTenantAggregateAnalyticsQuery,
      variables: { date: '2024-03-16' },
    },
    result: {
      data: {
        analytics: {
          visits: 100,
          visitors: 50,
          pageviews: 200,
          bounceRate: 30,
          visitDuration: 1800,
          viewsPerVisit: 3,
        },
      },
    },
  },
];

describe('MetricsOverview', () => {
  it('renders loading state initially', async () => {
    const screen = render(
      <MetricsOverview date="2024-03-16" />,
      {},
      { additionalMocks: mocks }
    );

    expect(
      screen.getByLabelText('Metriken werden geladen')
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByLabelText('Metriken werden geladen')).toBeNull();
    });
  });

  it('renders metrics when data is fetched', async () => {
    const { getByText } = render(
      <MetricsOverview date="2024-03-16" />,
      {},
      { additionalMocks: mocks }
    );

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(getByText('Besuche:')).toBeInTheDocument();
      expect(getByText('100')).toBeInTheDocument();
      expect(getByText('Besucher:')).toBeInTheDocument();
      expect(getByText('50')).toBeInTheDocument();
      expect(getByText('Seitenaufrufe:')).toBeInTheDocument();
      expect(getByText('200')).toBeInTheDocument();
      expect(getByText('Absprungrate:')).toBeInTheDocument();
      expect(getByText('30%')).toBeInTheDocument();
      expect(getByText('⌀ Besuchsdauer:')).toBeInTheDocument();
      expect(getByText('30m 0s')).toBeInTheDocument();
      expect(getByText('Seiten pro Besuch:')).toBeInTheDocument();
      expect(getByText('3')).toBeInTheDocument();
    });
  });
});
