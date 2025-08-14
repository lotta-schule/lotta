import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, waitFor } from 'test/util';
import { adminGroup, SomeUser, tenant } from 'test/fixtures';
import { ConstraintList } from './ConstraintsList';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

const adminUser = { ...SomeUser, groups: [adminGroup] };

describe('pages/admin/users/constraints', () => {
  describe('should not impose limit', () => {
    it('should have "no limit" checkbox checked when limit is null', async () => {
      const screen = render(
        <ConstraintList
          tenant={{
            ...tenant,
            configuration: {
              ...tenant.configuration,
              userMaxStorageConfig: null,
            },
          }}
        />,
        {},
        {
          currentUser: adminUser,
        }
      );
      await waitFor(() => {
        expect(
          screen.getByRole('checkbox', { name: /nicht begrenzen/i })
        ).toBeChecked();
        expect(
          screen.getByRole('checkbox', { name: /begrenzen auf/i })
        ).not.toBeChecked();
      });
    });

    it('should set a limit when clicking corresponding checkbox', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <ConstraintList
          tenant={{
            ...tenant,
            configuration: {
              ...tenant.configuration,
              userMaxStorageConfig: '-1',
            },
          }}
        />,
        {},
        {
          currentUser: adminUser,
        }
      );
      await fireEvent.click(
        screen.getByRole('checkbox', { name: /begrenzen auf:/i })
      );
      expect(
        screen.getByRole('spinbutton', { name: /begrenzung/i })
      ).toHaveValue(1024);
    });
  });

  describe('should impose limit', () => {
    it('should have "no limit" checkbox checked when limit is 20', () => {
      const screen = render(
        <ConstraintList tenant={tenant} />,
        {},
        { currentUser: adminUser }
      );
      expect(
        screen.getByRole('checkbox', { name: /begrenzen auf/i })
      ).toBeChecked();
      expect(
        screen.getByRole('checkbox', { name: /nicht begrenzen/i })
      ).not.toBeChecked();
    });

    it('should remember the limit set when disabling and reenabling the limit', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <ConstraintList tenant={tenant} />,
        {},
        { currentUser: adminUser }
      );
      await fireEvent.type(
        screen.getByRole('spinbutton', {
          name: /begrenzung/i,
        }),
        '123'
      );
      await fireEvent.tab();
      await fireEvent.click(
        screen.getByRole('checkbox', { name: /nicht begrenzen/i })
      );
      await fireEvent.click(
        screen.getByRole('checkbox', { name: /begrenzen auf/i })
      );
      expect(
        screen.getByRole('spinbutton', { name: /begrenzung/i })
      ).toHaveValue(20123);
    });

    it('have the tenant value prefilled', () => {
      const screen = render(
        <ConstraintList tenant={tenant} />,
        {},
        { currentUser: adminUser }
      );
      expect(
        screen.getByRole('spinbutton', { name: /begrenzung/i })
      ).toHaveValue(20);
    });

    describe('update the value', () => {
      it('should send correct request when setting to no limit', async () => {
        const fireEvent = userEvent.setup();
        const updateFn = vi.fn(() => ({
          data: {
            tenant: {
              ...tenant,
              configuration: {
                ...tenant.configuration,
                userMaxStorageConfig: null,
              },
            },
          },
        }));

        const mocks = [
          {
            request: {
              query: UpdateTenantMutation,
              variables: {
                tenant: {
                  configuration: {
                    ...tenant.configuration,
                    userMaxStorageConfig: null,
                  },
                },
              },
            },
            result: updateFn,
          },
        ];

        const screen = render(
          <ConstraintList
            tenant={{
              ...tenant,
              configuration: {
                ...tenant.configuration,
                userMaxStorageConfig: null,
              },
            }}
          />,
          {},
          { additionalMocks: mocks, currentUser: adminUser }
        );
        await fireEvent.click(
          screen.getByRole('button', { name: /speichern/i })
        );
        await waitFor(() => {
          expect(updateFn).toHaveBeenCalled();
        });
      });

      it('should send correct request when changing via input field', async () => {
        const fireEvent = userEvent.setup();
        const updateFn = vi.fn(() => ({
          data: {
            tenant: {
              ...tenant,
              configuration: {
                ...tenant.configuration,
                userMaxStorageConfig: '20123',
              },
            },
          },
        }));
        const mocks = [
          {
            request: {
              query: UpdateTenantMutation,
              variables: {
                tenant: {
                  configuration: {
                    ...tenant.configuration,
                    userMaxStorageConfig: '21100494848',
                  },
                },
              },
            },
            result: updateFn,
          },
        ];
        const screen = render(
          <ConstraintList tenant={tenant} />,
          {},
          { additionalMocks: mocks, currentUser: adminUser }
        );
        await fireEvent.type(
          screen.getByRole('spinbutton', {
            name: /begrenzung/i,
          }),
          '123'
        );
        await fireEvent.tab();
        expect(
          screen.getByRole('spinbutton', { name: /begrenzung/i })
        ).not.toHaveFocus();
        await fireEvent.click(
          screen.getByRole('button', { name: /speichern/i })
        );
        await waitFor(() => {
          expect(updateFn).toHaveBeenCalled();
        });
      });
    });
  });
});
