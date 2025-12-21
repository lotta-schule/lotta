import * as React from 'react';
import { MockedFunction } from 'vitest';
import { render, waitFor, userEvent } from 'test/util';
import { Analytics } from './Analytics';
import { PropertyBreakdown } from './_component';
import {
  GET_TENANT_AGGREGATE_ANALYTICS,
  GET_TENANT_BREAKDOWN_ANALYTICS,
  GET_TENANT_TIMESERIES_ANALYTICS,
} from './_graphql';
vi.useFakeTimers({
  shouldAdvanceTime: true,
  now: new Date('2025-08-16T12:00:00.000Z'),
});

vi.mock('./_component/PropertyBreakdown', () => ({
  PropertyBreakdown: vi.fn(() => <div data-testid="PropertyBreakdown"></div>),
}));

vi.mock('./_component/CurrentOnlineUserCounter', () => ({
  CurrentOnlineUserCounter: vi.fn(() => (
    <div data-testid="CurrentOnlineUserCounter"></div>
  )),
}));

const MockPropertyBreakdown = PropertyBreakdown as MockedFunction<
  typeof PropertyBreakdown
>;

const mocks = [
  {
    request: {
      query: GET_TENANT_AGGREGATE_ANALYTICS,
      variables: { date: '2025-08-16', period: '30d' },
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
      query: GET_TENANT_TIMESERIES_ANALYTICS,
      variables: {
        date: '2025-08-16',
        metric: 'VISITS',
        period: '30d',
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
      query: GET_TENANT_AGGREGATE_ANALYTICS,
      variables: { date: '2025-04-01', period: 'month' },
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
      query: GET_TENANT_TIMESERIES_ANALYTICS,
      variables: {
        date: '2025-04-01',
        metric: 'VISITS',
        period: 'month',
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
  {
    request: {
      query: GET_TENANT_TIMESERIES_ANALYTICS,
      variables: {
        date: '2025-08-16',
        metric: 'VISITORS',
        period: '30d',
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
      query: GET_TENANT_BREAKDOWN_ANALYTICS,
      variables: {
        date: '2025-08-16',
        metric: 'VISITORS',
        period: '30d',
        property: 'VISIT_DEVICE',
      },
    },
    result: vi.fn(() => ({
      data: {
        properties: [
          { property: 'mobile', metrics: [{ metric: 'VISITS', value: 100 }] },
          { property: 'tablet', metrics: [{ metric: 'VISITS', value: 100 }] },
          { property: 'desktop', metrics: [{ metric: 'VISITS', value: 100 }] },
        ],
      },
    })),
  },
  {
    request: {
      query: GET_TENANT_BREAKDOWN_ANALYTICS,
      variables: {
        date: '2025-08-16',
        metric: 'VISITORS',
        period: '30d',
        property: 'VISIT_SOURCE',
      },
    },
    result: vi.fn(() => ({
      data: {
        properties: [
          { property: 'mobile', metrics: [{ metric: 'VISITS', value: 100 }] },
          { property: 'tablet', metrics: [{ metric: 'VISITS', value: 100 }] },
          { property: 'desktop', metrics: [{ metric: 'VISITS', value: 100 }] },
        ],
      },
    })),
  },
  {
    request: {
      query: GET_TENANT_BREAKDOWN_ANALYTICS,
      variables: {
        date: '2025-04-01',
        metric: 'VISITORS',
        period: 'month',
        property: 'VISIT_DEVICE',
      },
    },
    result: vi.fn(() => ({
      data: {
        properties: [
          { property: 'mobile', metrics: [{ metric: 'VISITS', value: 100 }] },
          { property: 'tablet', metrics: [{ metric: 'VISITS', value: 100 }] },
          { property: 'desktop', metrics: [{ metric: 'VISITS', value: 100 }] },
        ],
      },
    })),
  },
  {
    request: {
      query: GET_TENANT_BREAKDOWN_ANALYTICS,
      variables: {
        date: '2025-04-01',
        metric: 'VISITORS',
        period: 'month',
        property: 'VISIT_SOURCE',
      },
    },
    result: vi.fn(() => ({
      data: {
        properties: [
          { property: 'mobile', metrics: [{ metric: 'VISITS', value: 100 }] },
          { property: 'tablet', metrics: [{ metric: 'VISITS', value: 100 }] },
          { property: 'desktop', metrics: [{ metric: 'VISITS', value: 100 }] },
        ],
      },
    })),
  },
];

describe('Analytics', () => {
  it('renders with default date and user count', async () => {
    const screen = render(<Analytics />, {}, { additionalMocks: mocks });

    await waitFor(() => {
      expect(screen.getByTestId('CurrentOnlineUserCounter')).toBeVisible();
    });

    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
      expect(mocks[1].result).toHaveBeenCalled();
    });
  });

  describe('month selector', () => {
    it('shows the correct amount of months in the selection', async () => {
      const user = userEvent.setup();

      const screen = await React.act(() =>
        render(<Analytics />, {}, { additionalMocks: mocks })
      );

      expect(
        screen.getByRole('button', {
          name: 'vergangene 30 Tage Zeitraum wählen',
        })
      ).not.toBeDisabled();

      await user.click(
        screen.getByRole('button', {
          name: 'vergangene 30 Tage Zeitraum wählen',
        })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'August 2025' })
        ).toBeVisible();
      });

      expect(screen.getByRole('option', { name: 'Juli 2025' })).toBeVisible();
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

      await React.act(() =>
        user.click(screen.getByRole('option', { name: 'April 2025' }))
      );

      await waitFor(() => {
        expect(mocks[2].result).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: /Zeitraum wählen/,
          })
        ).toHaveAccessibleName(/April 2025/);
      });

      await waitFor(() => {
        expect(mocks[2].result).toHaveBeenCalled();
        expect(mocks[3].result).toHaveBeenCalled();
      });
    }, 20_000);
  });

  describe('metric selector', () => {
    it('shows the metric and updates the PropertyBreakdown components', async () => {
      const user = userEvent.setup();

      const screen = render(<Analytics />, {}, { additionalMocks: mocks });

      await waitFor(() => {
        const props = MockPropertyBreakdown.mock.lastCall?.at(0);
        expect(props).toHaveProperty('metric', 'visits');
      });

      expect(
        screen.getByRole('button', {
          name: 'Besuche Metrik wählen',
        })
      ).toBeVisible();
      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: 'Besuche Metrik wählen',
          })
        ).not.toBeDisabled();
      });

      await user.click(
        screen.getByRole('button', {
          name: 'Besuche Metrik wählen',
        })
      );

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Besucher' })).toBeVisible();
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

      await user.click(screen.getByRole('option', { name: 'Besucher' }));
    }, 20_000);
  });
});
