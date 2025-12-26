import * as React from 'react';
import { render, waitFor } from 'test/util';
import { MetricsChart } from './MetricsChart';
import { Period } from '../Analytics';
import { GET_TENANT_TIMESERIES_ANALYTICS } from '../_graphql';

vi.useFakeTimers({ shouldAdvanceTime: true, now: new Date('2024-03-16') });

const mocks = [
  {
    request: {
      query: GET_TENANT_TIMESERIES_ANALYTICS,
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

describe.skip('MetricsChart', () => {
  it('renders chart when data is fetched', async () => {
    const screen = await React.act(() =>
      render(
        <MetricsChart period={monthPeriod} metric="visits" />,
        {},
        { additionalMocks: mocks }
      )
    );

    // Wait for loading state to disappear
    await waitFor(() => {
      expect(screen.getByTestId('ChartWrapper')).toBeVisible();
    });
  });
});
