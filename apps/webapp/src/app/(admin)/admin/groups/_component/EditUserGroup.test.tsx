import * as React from 'react';
import {
  adminGroup,
  eduplacesGroup,
  elternGroup,
  lehrerGroup,
  schuelerGroup,
} from 'test/fixtures';
import { render, waitFor, within } from 'test/util';
import { EditUserGroup } from './EditUserGroup';
import { GET_USER_GROUPS, UPDATE_USER_GROUP } from '../_graphql';
import userEvent from '@testing-library/user-event';

const additionalMocks = [
  {
    request: { query: GET_USER_GROUPS },
    result: {
      data: { groups: [adminGroup, lehrerGroup, elternGroup, schuelerGroup] },
    },
  },
];

describe('shared/layouts/adminLayouts/userManagment/EditUserGroup', () => {
  describe('form', () => {
    it('should show the form when a group is passed', async () => {
      const screen = render(
        <EditUserGroup group={lehrerGroup} />,
        {},
        { additionalMocks }
      );
      await waitFor(() => {
        expect(
          screen.getByRole('form', {
            name: 'Gruppe "Lehrer" bearbeiten',
          })
        ).toBeVisible();
      });
    });
  });

  describe('Form', () => {
    it('should be showing the title in a textbox', async () => {
      const screen = render(
        <EditUserGroup group={lehrerGroup} />,
        {},
        { additionalMocks }
      );
      expect(
        await screen.findByRole('textbox', { name: /gruppenname/i })
      ).toHaveValue('Lehrer');
    });

    it('should have the admin checkbox checked for a group which can read full name', async () => {
      const screen = render(
        <EditUserGroup group={lehrerGroup} />,
        {},
        { additionalMocks }
      );
      expect(
        await screen.findByRole('checkbox', {
          name: /vollständigen Namen/i,
        })
      ).toBeChecked();
    });

    it('should disable the can read full name checkbox if the group is an admin group', async () => {
      const screen = render(
        <EditUserGroup group={adminGroup} />,
        {},
        { additionalMocks }
      );

      await waitFor(() => {
        expect(screen.queryByRole('progressbar')).toBeNull();
      });

      await waitFor(() => {
        expect(
          screen.getByRole('checkbox', {
            name: /vollständigen namen/i,
          })
        ).toBeDisabled();
      });
    });

    describe('admin setting', () => {
      it('should have the admin checkbox checked for a admin group', async () => {
        const screen = render(
          <EditUserGroup group={adminGroup} />,
          {},
          { additionalMocks }
        );
        expect(
          await screen.findByRole('checkbox', {
            name: /administratorrecht/i,
          })
        ).toBeChecked();
        expect(
          screen.getByRole('checkbox', {
            name: /administratorrecht/i,
          })
        ).toBeDisabled();
      });

      it('should not show the admin checkbox if group is not an admin group', async () => {
        const screen = render(
          <EditUserGroup group={lehrerGroup} />,
          {},
          { additionalMocks }
        );

        await waitFor(() => {
          expect(screen.queryByRole('progressbar')).toBeNull();
        });

        expect(
          screen.queryByRole('checkbox', {
            name: /administratorrecht/i,
          })
        ).toBeNull();
      });
    });

    describe('updating', () => {
      it('should disable the save button when no changes are made', async () => {
        const fireEvent = userEvent.setup();
        const screen = render(
          <EditUserGroup group={lehrerGroup} />,
          {},
          { additionalMocks }
        );

        await waitFor(() => {
          expect(screen.queryByRole('progressbar')).toBeNull();
        });

        expect(
          screen.getByRole('button', { name: /speichern/i })
        ).toBeDisabled();

        await fireEvent.type(
          screen.getByRole('textbox', { name: /gruppenname/i }),
          ' '
        );

        expect(
          screen.getByRole('button', { name: /speichern/i })
        ).not.toBeDisabled();

        await fireEvent.type(
          screen.getByRole('textbox', { name: /gruppenname/i }),
          '{backspace}'
        );

        expect(
          screen.getByRole('button', { name: /speichern/i })
        ).toBeDisabled();

        await fireEvent.click(
          screen.getByRole('checkbox', { name: /vollständigen namen/i })
        );

        expect(
          screen.getByRole('button', { name: /speichern/i })
        ).not.toBeDisabled();

        await fireEvent.click(
          screen.getByRole('checkbox', { name: /vollständigen namen/i })
        );

        expect(
          screen.getByRole('button', { name: /speichern/i })
        ).toBeDisabled();

        await fireEvent.type(
          screen.getByPlaceholderText(/einschreibeschlüssel/i),
          'NeuerToken{enter}'
        );

        expect(
          screen.getByRole('button', { name: /speichern/i })
        ).not.toBeDisabled();

        await fireEvent.click(
          screen.getByRole('button', {
            name: /tag NeuerToken löschen/i,
          })
        );

        expect(
          screen.getByRole('button', { name: /speichern/i })
        ).toBeDisabled();
      });

      it('make changes and save them', async () => {
        const user = userEvent.setup();
        const saveMock = {
          request: {
            query: UPDATE_USER_GROUP,
            variables: {
              id: lehrerGroup.id,
              group: {
                name: 'Lehrer umbenannt',
                isAdminGroup: false,
                canReadFullName: false,
                enrollmentTokens: ['uhfhurehwuehf', 'NeuerToken'],
              },
            },
          },
          result: vi.fn(() => ({
            data: {
              group: {
                ...lehrerGroup,
                name: 'Lehrer umbenannt',
                isAdminGroup: false,
                canReadFullName: false,
                enrollmentTokens: ['uhfhurehwuehf', 'NeuerToken'],
              },
            },
          })),
        };
        const screen = render(
          <EditUserGroup group={lehrerGroup} />,
          {},
          { additionalMocks: [...additionalMocks, saveMock] }
        );
        await waitFor(() => {
          expect(screen.queryByRole('progressbar')).toBeNull();
        });

        // Change the group name
        await user.type(
          await screen.findByRole('textbox', { name: /gruppenname/i }),
          'Lehrer umbenannt',
          {
            initialSelectionStart: 0,
            initialSelectionEnd: lehrerGroup.name.length,
          }
        );

        // allow read full name
        await user.click(
          await screen.findByRole('checkbox', {
            name: /vollständigen Namen/i,
          })
        );

        // add a new token
        await user.type(
          await screen.findByPlaceholderText(/einschreibeschlüssel/i),
          'NeuerToken{enter}'
        );

        expect(
          screen.getByRole('button', { name: /speichern/i })
        ).not.toBeDisabled();

        await user.click(screen.getByRole('button', { name: /speichern/i }));

        await waitFor(() => {
          expect(saveMock.result).toHaveBeenCalledTimes(1);
        });

        await waitFor(() => {
          expect(
            within(
              screen.getByRole('button', { name: /speichern/i })
            ).getByTestId('SuccessIcon')
          ).toBeVisible();
        });
      });
    });
  });

  describe('delete group', () => {
    it('should show a delete button for a group and show dialog', async () => {
      const user = userEvent.setup();
      const screen = render(
        <EditUserGroup group={lehrerGroup} />,
        {},
        { additionalMocks }
      );
      await user.click(
        await screen.findByRole('button', { name: /"lehrer" löschen/i })
      );

      expect(screen.getByRole('dialog', { name: /löschen/i })).toBeVisible();
    });

    it('delete button should be disabled when group is sole admin group', async () => {
      const screen = render(
        <EditUserGroup group={adminGroup} />,
        {},
        { additionalMocks }
      );
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(/einschreibeschlüssel/i)
        ).toBeVisible();
      });
      expect(screen.queryByRole('button', { name: /löschen/i })).toBeNull();
    });
  });

  describe('Eduplaces-managed groups', () => {
    it('should show Eduplaces notice for groups with eduplacesId', async () => {
      const screen = render(
        <EditUserGroup group={eduplacesGroup} />,
        {},
        { additionalMocks }
      );

      await waitFor(() => {
        expect(
          screen.getByText(/diese gruppe wird von eduplaces verwaltet/i)
        ).toBeVisible();
      });

      const notice = screen.getByText(
        /diese gruppe wird von eduplaces verwaltet/i
      ).parentElement;
      const icon = notice?.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should hide all form sections for Eduplaces-managed groups', async () => {
      const screen = render(
        <EditUserGroup group={eduplacesGroup} />,
        {},
        { additionalMocks }
      );

      await waitFor(() => {
        expect(
          screen.getByText(/diese gruppe wird von eduplaces verwaltet/i)
        ).toBeVisible();
      });

      expect(
        screen.queryByRole('textbox', { name: /gruppenname/i })
      ).toBeNull();
      expect(
        screen.queryByRole('checkbox', { name: /vollständigen namen/i })
      ).toBeNull();
      expect(screen.queryByPlaceholderText(/einschreibeschlüssel/i)).toBeNull();
      expect(screen.queryByRole('button', { name: /speichern/i })).toBeNull();
      expect(screen.queryByRole('button', { name: /löschen/i })).toBeNull();
    });

    it('should not show Eduplaces notice for regular groups', async () => {
      const screen = render(
        <EditUserGroup group={lehrerGroup} />,
        {},
        { additionalMocks }
      );

      await waitFor(() => {
        expect(screen.getByRole('form')).toBeVisible();
      });

      expect(
        screen.queryByText(/diese gruppe wird von eduplaces verwaltet/i)
      ).toBeNull();
    });
  });
});
