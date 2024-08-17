import React from 'react';
import { render } from 'test/util';
import { describe, it, expect } from 'vitest';
import {
  CurrentOnlineUserCounter,
  GET_TENANT_REALTIME_ANALYTICS,
} from './CurrentOnlineUserCounter';

describe('CurrentOnlineUserCounter', () => {
  it('renders with no users online', async () => {
    const mocks = [
      {
        request: {
          query: GET_TENANT_REALTIME_ANALYTICS,
        },
        result: {
          data: {
            currentUserCount: 0,
          },
        },
      },
    ];

    const screen = render(
      <CurrentOnlineUserCounter />,
      {},
      { additionalMocks: mocks }
    );

    expect(await screen.findByText('0 Besucher online')).toBeInTheDocument();
    expect(screen.getByText('aktuell online')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toHaveStyle(
      'color: rgb(128, 128, 128)'
    );
  });

  it('renders with some users online', async () => {
    const mocks = [
      {
        request: {
          query: GET_TENANT_REALTIME_ANALYTICS,
        },
        result: {
          data: {
            currentUserCount: 5,
          },
        },
      },
    ];

    const screen = render(
      <CurrentOnlineUserCounter />,
      {},
      { additionalMocks: mocks }
    );

    expect(await screen.findByText('5 Besucher online')).toBeInTheDocument();
    expect(screen.getByText('aktuell online')).toBeInTheDocument();
    expect(screen.getByRole('img', { hidden: true })).toHaveStyle(
      'color: rgb(0, 128, 0)'
    );
  });
});
