import * as React from 'react';
import { MockedResponse } from '@apollo/client/testing';
import { render, waitFor } from 'test/util';
import { MetricsChart } from './MetricsChart';
import userEvent from '@testing-library/user-event';

import GetTenantTimeseriesAnalyticsQuery from 'api/query/analytics/GetTenantTimeseriesAnalyticsQuery.graphql';

jest
  .useFakeTimers({ advanceTimers: 1 })
  .setSystemTime(new Date('2024-03-16').getTime());

const mocks = [
  {
    request: {
      query: GetTenantTimeseriesAnalyticsQuery,
      variables: {
        date: '2024-03-16',
        metric: 'VISITS',
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

describe('MetricsChart', () => {
  it('renders loading state initially', async () => {
    const screen = render(
      <MetricsChart date="2024-03-16" />,
      {},
      { additionalMocks: mocks }
    );

    expect(
      screen.getByLabelText('Statistiken werden geladen')
    ).toBeInTheDocument();

    await waitFor(() => {
      // Wait for loading state to disappear
      expect(screen.queryByLabelText('Statistiken werden geladen')).toBeNull();
    });
  });

  it('renders chart when data is fetched', async () => {
    const screen = render(
      <MetricsChart date="2024-03-16" />,
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
          },
        },
        result: jest.fn(() => ({
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
        <MetricsChart date="2024-03-16" />,
        {},
        { additionalMocks: [...mocks, getPageviewsMock] }
      );
      expect(
        screen.getByRole('button', { name: 'Besuche Metrik wählen' })
      ).toBeVisible();
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
