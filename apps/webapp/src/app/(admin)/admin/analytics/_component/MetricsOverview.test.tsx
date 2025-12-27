import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from 'test/util';
import { MetricsOverview } from './MetricsOverview';
import { Period } from '../Analytics';
import { GET_TENANT_AGGREGATE_ANALYTICS } from '../_graphql';
import { MockLink } from '@apollo/client/testing';

vi.useFakeTimers({
  shouldAdvanceTime: true,
  advanceTimeDelta: 1,
  now: new Date('2024-03-16').getTime(),
});

const mocks: MockLink.MockedResponse[] = [
  {
    request: {
      query: GET_TENANT_AGGREGATE_ANALYTICS,
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
    const screen = await React.act(() =>
      render(
        <MetricsOverview period={monthPeriod} />,
        {},
        { additionalMocks: mocks }
      )
    );

    await waitFor(() => {
      expect(screen.queryByLabelText('loading')).toBeNull();
    });
  });

  it('renders metrics when data is fetched', async () => {
    const screen = await React.act(() =>
      render(
        <MetricsOverview period={monthPeriod} />,
        {},
        { additionalMocks: mocks }
      )
    );

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.getByText('Besuche:')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Besucher:')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('Seitenaufrufe:')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
      expect(screen.getByText('Absprungrate:')).toBeInTheDocument();
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('⌀ Besuchsdauer:')).toBeInTheDocument();
      expect(screen.getByText('30m 0s')).toBeInTheDocument();
      expect(screen.getByText('Seiten pro Besuch:')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});
