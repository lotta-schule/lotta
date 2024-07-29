import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from 'test/util';
import { MetricsOverview } from './MetricsOverview';
import { Period } from '../Analytics';

import GetTenantAggregateAnalyticsQuery from 'api/query/analytics/GetTenantAggregateAnalyticsQuery.graphql';

vi.useFakeTimers({
  shouldAdvanceTime: true,
  advanceTimeDelta: 1,
  now: new Date('2024-03-16').getTime(),
});

const mocks = [
  {
    request: {
      query: GetTenantAggregateAnalyticsQuery,
      variables: { date: '2024-03-16', period: 'month' },
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

const monthPeriod: Period = {
  type: 'month',
  date: new Date('2024-03-16'),
  key: '2024-03-16',
};

describe('MetricsOverview', () => {
  it('renders loading state initially', async () => {
    const screen = render(
      <MetricsOverview period={monthPeriod} />,
      {},
      { additionalMocks: mocks }
    );

    await waitFor(() => {
      expect(screen.queryByLabelText('loading')).toBeNull();
    });
  });

  it('renders metrics when data is fetched', async () => {
    const { getByText } = render(
      <MetricsOverview period={monthPeriod} />,
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
