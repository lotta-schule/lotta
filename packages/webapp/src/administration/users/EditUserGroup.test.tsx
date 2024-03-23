import * as React from 'react';
import {
  adminGroup,
  elternGroup,
  lehrerGroup,
  schuelerGroup,
} from 'test/fixtures';
import { render, waitFor } from 'test/util';
import { EditUserGroup } from './EditUserGroup';
import userEvent from '@testing-library/user-event';

import GetGroupQuery from 'api/query/GetGroupQuery.graphql';
import GetUserGroupsQuery from 'api/query/GetUserGroupsQuery.graphql';
import UpdateUserGroupMutation from 'api/mutation/UpdateUserGroupMutation.graphql';

const additionalMocks = [
  {
    request: { query: GetGroupQuery, variables: { id: adminGroup.id } },
    result: { data: { group: adminGroup } },
  },
  {
    request: { query: GetGroupQuery, variables: { id: lehrerGroup.id } },
    result: { data: { group: lehrerGroup } },
  },
  {
    request: { query: GetUserGroupsQuery },
    result: {
      data: { groups: [adminGroup, lehrerGroup, elternGroup, schuelerGroup] },
    },
  },
];

describe('shared/layouts/adminLayouts/userManagment/EditUserGroup', () => {
  describe('form', () => {
    it('should not show the form when no group is passed', () => {
      const screen = render(
        <EditUserGroup groupId={null} onRequestDeletion={jest.fn()} />,
        {},
        { additionalMocks }
      );
      expect(
        screen.queryByRole('form', {
          name: /bearbeiten/i,
        })
      ).toBeNull();
    });

    it('should show the form when a group is passed', async () => {
      const screen = render(
        <EditUserGroup
          groupId={lehrerGroup.id}
          onRequestDeletion={jest.fn()}
        />,
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
    describe('Group Title', () => {
      it('should be showing the title in a textbox', async () => {
        const screen = render(
          <EditUserGroup
            groupId={lehrerGroup.id}
            onRequestDeletion={jest.fn()}
          />,
          {},
          { additionalMocks }
        );
        expect(
          await screen.findByRole('textbox', { name: /gruppenname/i })
        ).toHaveValue('Lehrer');
      });

      it('should update the title on blur', async () => {
        const fireEvent = userEvent.setup();
        const saveCallback = jest.fn(() => ({
          data: { group: { ...lehrerGroup, name: 'Neuer Name' } },
        }));
        const saveMock = {
          request: {
            query: UpdateUserGroupMutation,
            variables: {
              id: lehrerGroup.id,
              group: {
                name: 'Neuer Name',
                isAdminGroup: lehrerGroup.isAdminGroup,
                canReadFullName: lehrerGroup.canReadFullName,
                enrollmentTokens: lehrerGroup.enrollmentTokens,
              },
            },
          },
          result: saveCallback,
        };
        const screen = render(
          <EditUserGroup
            groupId={lehrerGroup.id}
            onRequestDeletion={jest.fn()}
          />,
          {},
          { additionalMocks: [...additionalMocks, saveMock] }
        );
        const groupNameInput = (await screen.findByRole('textbox', {
          name: /gruppenname/i,
        })) as HTMLInputElement;
        await fireEvent.type(groupNameInput, 'Neuer Name', {
          initialSelectionStart: 0,
          initialSelectionEnd: groupNameInput.value.length,
        });
        await fireEvent.tab();
        await waitFor(() => {
          expect(saveCallback).toHaveBeenCalled();
        });
      });

      it('should update the title on ENTER', async () => {
        const fireEvent = userEvent.setup();
        const saveCallback = jest.fn(() => ({
          data: { group: { ...lehrerGroup, name: 'Neuer Name' } },
        }));
        const saveMock = {
          request: {
            query: UpdateUserGroupMutation,
            variables: {
              id: lehrerGroup.id,
              group: {
                name: 'Neuer Name',
                isAdminGroup: lehrerGroup.isAdminGroup,
                canReadFullName: lehrerGroup.canReadFullName,
                enrollmentTokens: lehrerGroup.enrollmentTokens,
              },
            },
          },
          result: saveCallback,
        };
        const screen = render(
          <EditUserGroup
            groupId={lehrerGroup.id}
            onRequestDeletion={jest.fn()}
          />,
          {},
          { additionalMocks: [...additionalMocks, saveMock] }
        );
        const groupNameInput = (await screen.findByRole('textbox', {
          name: /gruppenname/i,
        })) as HTMLInputElement;
        await fireEvent.clear(groupNameInput);
        await fireEvent.type(groupNameInput, 'Neuer Name{Enter}', {
          initialSelectionStart: 0,
          initialSelectionEnd: groupNameInput.value.length,
        });
        await waitFor(() => {
          expect(saveCallback).toHaveBeenCalled();
        });
      });
    });

    describe('canReadFullName setting', () => {
      it('should have the admin checkbox checked for a group which can read full name', async () => {
        const screen = render(
          <EditUserGroup
            groupId={lehrerGroup.id}
            onRequestDeletion={jest.fn()}
          />,
          {},
          { additionalMocks }
        );
        expect(
          await screen.findByRole('checkbox', {
            name: /vollständigen Namen/i,
          })
        ).toBeChecked();
      });

      it('should update the can read full name setting', async () => {
        const fireEvent = userEvent.setup();
        const saveCallback = jest.fn(() => ({
          data: { group: { ...lehrerGroup, canReadFullName: false } },
        }));
        const saveMock = {
          request: {
            query: UpdateUserGroupMutation,
            variables: {
              id: lehrerGroup.id,
              group: {
                name: lehrerGroup.name,
                isAdminGroup: lehrerGroup.isAdminGroup,
                canReadFullName: false,
                enrollmentTokens: lehrerGroup.enrollmentTokens,
              },
            },
          },
          result: saveCallback,
        };
        const screen = render(
          <EditUserGroup
            groupId={lehrerGroup.id}
            onRequestDeletion={jest.fn()}
          />,
          {},
          {
            additionalMocks: [...additionalMocks, saveMock],
          }
        );
        await fireEvent.click(
          await screen.findByRole('checkbox', {
            name: /vollständigen namen/i,
          })
        );
        await waitFor(() => {
          expect(saveCallback).toHaveBeenCalled();
        });
      });

      it('should disable the can read full name checkbox if the group is an admin group', async () => {
        const screen = render(
          <EditUserGroup
            groupId={adminGroup.id}
            onRequestDeletion={jest.fn()}
          />,
          {},
          { additionalMocks }
        );

        await waitFor(() => {
          expect(screen.queryByRole('progressbar')).toBeNull();
        });

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
          <EditUserGroup
            groupId={adminGroup.id}
            onRequestDeletion={jest.fn()}
          />,
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
          <EditUserGroup
            groupId={lehrerGroup.id}
            onRequestDeletion={jest.fn()}
          />,
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

      //   it('should update the admin setting', async () => {
      //     const fireEvent = userEvent.setup();
      //     const saveCallback = jest.fn(() => ({
      //       data: { group: { ...adminGroup, adminGroup: false } },
      //     }));
      //     const saveMock = {
      //       request: {
      //         query: UpdateUserGroupMutation,
      //         variables: {
      //           id: adminGroup.id,
      //           group: {
      //             name: adminGroup.name,
      //             isAdminGroup: false,
      //             canReadFullName: lehrerGroup.canReadFullName,
      //             enrollmentTokens: adminGroup.enrollmentTokens,
      //           },
      //         },
      //       },
      //       result: saveCallback,
      //     };
      //     const screen = render(
      //       <EditUserGroup groupId={adminGroup.id} onDelete={jest.fn()} />,
      //       {},
      //       {
      //         additionalMocks: [...additionalMocks, saveMock],
      //         userGroups: groupsWithSecondAdmin,
      //       }
      //     );
      //     await fireEvent.click(
      //       await screen.findByRole('checkbox', {
      //         name: /administratorrechte/i,
      //       })
      //     );
      //     await waitFor(() => {
      //       expect(saveCallback).toHaveBeenCalled();
      //     });
      //   });

      //   it('should disable the admin checkbox if there is only one admin available', async () => {
      //     const screen = render(
      //       <EditUserGroup groupId={adminGroup.id} onDelete={jest.fn()} />,
      //       {},
      //       { additionalMocks }
      //     );

      //     await waitFor(() => {
      //       expect(screen.queryByRole('progressbar')).toBeNull();
      //     });

      //     expect(
      //       screen.getByRole('checkbox', {
      //         name: /administratorrecht/i,
      //       })
      //     ).toBeDisabled();
      //   });
    });

    describe('update the enrollment tokens', () => {
      it('should update the enrollment tokens', async () => {
        const fireEvent = userEvent.setup();
        const saveCallback = jest.fn(() => ({
          data: { group: { ...lehrerGroup, name: 'Lehrer' } },
        }));
        const saveMock = {
          request: {
            query: UpdateUserGroupMutation,
            variables: {
              id: lehrerGroup.id,
              group: {
                name: 'Lehrer',
                isAdminGroup: lehrerGroup.isAdminGroup,
                canReadFullName: lehrerGroup.canReadFullName,
                enrollmentTokens:
                  lehrerGroup.enrollmentTokens.concat('NeuerToken'),
              },
            },
          },
          result: saveCallback,
        };
        const screen = render(
          <EditUserGroup
            groupId={lehrerGroup.id}
            onRequestDeletion={jest.fn()}
          />,
          {},
          { additionalMocks: [...additionalMocks, saveMock] }
        );
        await fireEvent.type(
          await screen.findByPlaceholderText(/einschreibeschlüssel/i),
          'NeuerToken{enter}'
        );
        await waitFor(() => {
          expect(saveCallback).toHaveBeenCalled();
        });
      });
    });

    describe('delete group', () => {
      it('should show a delete button for a group and show dialog', async () => {
        const fireEvent = userEvent.setup();
        const onRequestDeletion = jest.fn(({ id }) => {
          expect(id).toBe(lehrerGroup.id);
        });
        const screen = render(
          <EditUserGroup
            groupId={lehrerGroup.id}
            onRequestDeletion={onRequestDeletion}
          />
        );
        await fireEvent.click(
          await screen.findByRole('button', { name: /löschen/i })
        );

        expect(onRequestDeletion).toHaveBeenCalledTimes(1);
      });

      it('delete button should be disabled when group is sole admin group', async () => {
        const screen = render(
          <EditUserGroup
            groupId={adminGroup.id}
            onRequestDeletion={jest.fn()}
          />,
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
  });
});
