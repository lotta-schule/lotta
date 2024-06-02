import * as React from 'react';
import { render, waitFor } from 'test/util';
import { Analytics } from './Analytics';
import userEvent from '@testing-library/user-event';

import GetTenantRealtimeAnalyticsQuery from 'api/query/analytics/GetTenantRealtimeAnalyticsQuery.graphql';
import GetTenantAggregateAnalyticsQuery from 'api/query/analytics/GetTenantAggregateAnalyticsQuery.graphql';
import GetTenantTimeseriesAnalyticsQuery from 'api/query/analytics/GetTenantTimeseriesAnalyticsQuery.graphql';

vi.useFakeTimers({
  shouldAdvanceTime: true,
  now: new Date('2025-08-16T12:00:00.000Z'),
});

const mocks = [
  {
    request: {
      query: GetTenantRealtimeAnalyticsQuery,
    },
    result: {
      data: {
        currentUserCount: 50,
      },
    },
  },
  {
    request: {
      query: GetTenantAggregateAnalyticsQuery,
      variables: { date: '2025-08-01' },
    },
    result: vi.fn(() => ({
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
    })),
  },
  {
    request: {
      query: GetTenantTimeseriesAnalyticsQuery,
      variables: {
        date: '2025-08-01',
        metric: 'VISITS',
      },
    },
    result: vi.fn(() => ({
      data: {
        metrics: [
          { date: '2025-08-01', value: 100 },
          { date: '2025-08-02', value: 150 },
          { date: '2025-08-03', value: 200 },
        ],
      },
    })),
  },
  {
    request: {
      query: GetTenantAggregateAnalyticsQuery,
      variables: { date: '2025-04-01' },
    },
    result: vi.fn(() => ({
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
    })),
  },
  {
    request: {
      query: GetTenantTimeseriesAnalyticsQuery,
      variables: {
        date: '2025-04-01',
        metric: 'VISITS',
      },
    },
    result: vi.fn(() => ({
      data: {
        metrics: [
          { date: '2025-04-01', value: 100 },
          { date: '2025-04-02', value: 150 },
          { date: '2025-04-03', value: 200 },
        ],
      },
    })),
  },
];

describe('Analytics', () => {
  it('renders with default date and user count', async () => {
    const { getByText } = render(<Analytics />, {}, { additionalMocks: mocks });

    await waitFor(() => {
      expect(getByText('Aktuell online')).toBeInTheDocument();
      expect(getByText('50 Besucher')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mocks[1].result).toHaveBeenCalled();
      expect(mocks[2].result).toHaveBeenCalled();
    });
  });

  describe('month selector', () => {
    it('shows the correct amount of months in the selection', async () => {
      const fireEvent = userEvent.setup();

      const screen = render(<Analytics />, {}, { additionalMocks: mocks });

      expect(
        screen.getByRole('button', {
          name: 'August 2025 Monat wählen',
        })
      ).toBeVisible();

      await fireEvent.click(
        screen.getByRole('button', {
          name: 'August 2025 Monat wählen',
        })
      );

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Juli 2025' })).toBeVisible();
      });
      expect(screen.getByRole('option', { name: 'Juni 2025' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'Mai 2025' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'April 2025' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'März 2025' })).toBeVisible();
      expect(
        screen.getByRole('option', { name: 'Februar 2025' })
      ).toBeVisible();
      expect(screen.getByRole('option', { name: 'Januar 2025' })).toBeVisible();
      expect(
        screen.getByRole('option', { name: 'Dezember 2024' })
      ).toBeVisible();
      expect(
        screen.getByRole('option', { name: 'November 2024' })
      ).toBeVisible();
      expect(
        screen.getByRole('option', { name: 'Oktober 2024' })
      ).toBeVisible();
      expect(
        screen.getByRole('option', { name: 'September 2024' })
      ).toBeVisible();
      expect(screen.getByRole('option', { name: 'August 2024' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'Juli 2024' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'Juni 2024' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'Mai 2024' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'April 2024' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'März 2024' })).toBeVisible();
      expect(screen.queryByRole('option', { name: 'Februar 2024' })).toBeNull();

      await new Promise((resolve) => setTimeout(resolve, 400));

      await fireEvent.click(screen.getByRole('option', { name: 'April 2025' }));

      await waitFor(() => {
        expect(mocks[3].result).toHaveBeenCalled();
        expect(mocks[4].result).toHaveBeenCalled();
      });
    }, 20_000);
  });
});
