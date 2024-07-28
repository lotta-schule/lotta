import * as React from 'react';
import { MockedResponse } from '@apollo/client/testing';
import { render, waitFor } from 'test/util';
import { MetricsChart } from './MetricsChart';
import { Period } from '../Analytics';
import userEvent from '@testing-library/user-event';

import GetTenantTimeseriesAnalyticsQuery from 'api/query/analytics/GetTenantTimeseriesAnalyticsQuery.graphql';

vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date('2024-03-16') });

const mocks = [
  {
    request: {
      query: GetTenantTimeseriesAnalyticsQuery,
      variables: {
        date: '2024-03-16',
        metric: 'VISITS',
        period: 'month',
      },
    },
    result: {
      data: {
        metrics: [
          { date: '2024-03-01', value: 100 },
          { date: '2024-03-02', value: 150 },
          { date: '2024-03-03', value: 200 },
        ],
      },
    },
  },
];

const monthPeriod: Period = {
  type: 'month',
  date: new Date('2024-03-16'),
  key: '2024-03-16',
};

describe('MetricsChart', () => {
  it('renders chart when data is fetched', async () => {
    const screen = render(
      <MetricsChart period={monthPeriod} />,
      {},
      { additionalMocks: mocks }
    );

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.getByTestId('ChartWrapper')).toBeVisible();
    });
  });

  describe('metric selector', () => {
    it('should show the correct metric and chose another metric', async () => {
      const fireEvent = userEvent.setup();

      const getPageviewsMock: MockedResponse = {
        request: {
          query: GetTenantTimeseriesAnalyticsQuery,
          variables: {
            date: '2024-03-16',
            metric: 'PAGEVIEWS',
            period: 'month',
          },
        },
        result: vi.fn(() => ({
          data: {
            metrics: [
              { date: '2024-03-01', value: 503 },
              { date: '2024-03-02', value: 234 },
              { date: '2024-03-03', value: 930 },
            ],
          },
        })),
      };
      const screen = render(
        <MetricsChart period={monthPeriod} />,
        {},
        { additionalMocks: [...mocks, getPageviewsMock] }
      );

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'Besuche Metrik wählen' })
        ).toBeVisible();
      });
      await fireEvent.click(
        screen.getByRole('button', { name: 'Besuche Metrik wählen' })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'Seitenaufrufe' })
        ).toBeVisible();
      });
      await new Promise((r) => setTimeout(r, 300)); // wait for the animation to finish

      await fireEvent.click(
        screen.getByRole('option', { name: 'Seitenaufrufe' })
      );

      await waitFor(() => {
        expect(getPageviewsMock.result).toHaveBeenCalled();
      });
    });
  });
});
