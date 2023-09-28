import * as React from 'react';
import { UserGroupModel } from 'model';
import { render, waitFor } from 'test/util';
import {
  adminGroup,
  lehrerGroup,
  schuelerGroup,
  elternGroup,
  userGroups,
} from 'test/fixtures';
import { GroupSelect } from './GroupSelect';
import userEvent from '@testing-library/user-event';

describe('shared/editor/GroupSelect', () => {
  it('should render an GroupSelect without error', () => {
    render(<GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />, {});
  });

  describe('label prop', () => {
    it('should show a default label', () => {
      const screen = render(
        <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
        {}
      );
      expect(screen.getByText('Gruppe suchen')).toBeVisible();
    });

    it('should show a given label', () => {
      const screen = render(
        <GroupSelect
          label={'Wähle Gruppen:'}
          selectedGroups={[]}
          onSelectGroups={() => {}}
        />,
        {}
      );
      expect(screen.getByText('Wähle Gruppen:')).toBeVisible();
    });
  });

  describe('disabled prop', () => {
    it('should disable the input field', async () => {
      const screen = render(
        <GroupSelect disabled selectedGroups={[]} onSelectGroups={() => {}} />,
        {}
      );

      const input = screen.getByRole('combobox', {
        name: /gruppe suchen/i,
      });
      expect(input).toBeVisible();
      expect(input).toBeDisabled();
    });

    it('should disable the remove group button', async () => {
      const screen = render(
        <GroupSelect
          disabled
          selectedGroups={[schuelerGroup]}
          onSelectGroups={() => {}}
        />,
        {}
      );

      expect(screen.queryByLabelText(/Schüler löschen/)).toBeNull();
    });

    it('should disable the publicly available checkbox', async () => {
      const screen = render(
        <GroupSelect
          disabled
          selectedGroups={[schuelerGroup]}
          onSelectGroups={() => {}}
        />,
        {}
      );

      const checkbox = await screen.findByRole('checkbox');

      expect(checkbox).toBeDisabled();
    });
  });

  describe('when the user has no groups to select from', () => {
    it('should disable the input field and the checkbox', async () => {
      const screen = render(
        <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
        {},
        { userGroups: [] }
      );

      expect(screen.getByRole('combobox')).toBeDisabled();
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });

    it('should disable the input field and the checkbox even when having group selected', async () => {
      const screen = render(
        <GroupSelect
          selectedGroups={[lehrerGroup]}
          onSelectGroups={() => {}}
        />,
        {},
        { userGroups: [] }
      );

      expect(screen.getByRole('combobox')).toBeDisabled();
      expect(screen.getByRole('checkbox')).toBeDisabled();
    });
  });

  describe('publicly available checkbox', () => {
    it('should be checked when no groups are selected', async () => {
      const screen = render(
        <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
        {}
      );

      const selection = await screen.findByLabelText(/alle sichtbar/i);

      expect(selection).toBeChecked();
    });

    it('should not be checked when a group is selected', async () => {
      const screen = render(
        <GroupSelect
          selectedGroups={[lehrerGroup]}
          onSelectGroups={() => {}}
        />,
        {}
      );

      const selection = await screen.findByLabelText(/alle sichtbar/i);

      expect(selection).not.toBeChecked();
    });

    it('should add all groups when checkbox is unchecked', async () => {
      const fireEvent = userEvent.setup();
      const callback = jest.fn((newGroups) => {
        expect(newGroups.map((g: UserGroupModel) => g.name)).toEqual([
          'Administrator',
          'Lehrer',
          'Schüler',
          'Eltern',
        ]);
      });
      const screen = render(
        <GroupSelect selectedGroups={[]} onSelectGroups={callback} />,
        {}
      );

      const selection = await screen.findByLabelText(/alle sichtbar/i);

      await fireEvent.click(selection);

      await waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });
    });

    it('should remove all groups when checkbox is checked', async () => {
      const fireEvent = userEvent.setup();
      const callback = jest.fn((newGroups) => {
        expect(newGroups.map((g: UserGroupModel) => g.name)).toEqual([]);
      });
      const screen = render(
        <GroupSelect
          selectedGroups={[adminGroup, elternGroup, lehrerGroup]}
          onSelectGroups={callback}
        />,
        {}
      );

      const selection = await screen.findByLabelText(/alle sichtbar/i);

      await fireEvent.click(selection);

      await waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });
    });

    it('should not show element when hidePublicGroupSelection prop is given', () => {
      const screen = render(
        <GroupSelect
          hidePublicGroupSelection
          selectedGroups={[]}
          onSelectGroups={() => {}}
        />,
        {}
      );
      expect(screen.queryByLabelText(/alle sichtbar/i)).toBeNull();
    });

    it('should change the elements description when publicGroupSelectionLabel is given', () => {
      const screen = render(
        <GroupSelect
          publicGroupSelectionLabel={'Keine Gruppen'}
          selectedGroups={[]}
          onSelectGroups={() => {}}
        />,
        {}
      );
      expect(screen.queryByLabelText(/keine gruppen/i)).toBeInTheDocument();
    });
  });

  describe('selection display', () => {
    it('should show selected group if one is selected', async () => {
      const screen = render(
        <GroupSelect selectedGroups={[adminGroup]} onSelectGroups={() => {}} />,
        {}
      );

      const selection = await screen.findByTestId('GroupSelectSelection');

      expect(selection).toHaveTextContent(/Administrator/i);
    });

    it('should show selected groups (in order) if multiple are selected', async () => {
      const screen = render(
        <GroupSelect
          selectedGroups={[lehrerGroup, schuelerGroup, adminGroup]}
          onSelectGroups={() => {}}
        />,
        {}
      );

      const selection = await screen.findByTestId('GroupSelectSelection');

      expect(selection).toHaveTextContent(/AdministratorLehrerSchüler/i);
    });
  });

  describe('should manipulate selected groups', () => {
    it('should send deselection request when clicking on group\'s "X"', async () => {
      const fireEvent = userEvent.setup();
      const callback = jest.fn((newGroups) => {
        expect(newGroups.map((g: UserGroupModel) => g.name).sort()).toEqual([
          'Administrator',
          'Lehrer',
        ]);
      });
      const screen = render(
        <GroupSelect
          selectedGroups={[lehrerGroup, schuelerGroup, adminGroup]}
          onSelectGroups={callback}
        />,
        {}
      );

      await fireEvent.click(await screen.findByLabelText(/Schüler löschen/));

      await waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });
    });
  });

  describe('listbox options', () => {
    it('should provide all groups as options when clicking into the input field', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
        {}
      );

      await fireEvent.click(
        screen.getByRole('button', { name: /vorschläge/i })
      );

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: 'Administrator' })
        ).toBeVisible();
      });
      expect(screen.getByRole('option', { name: 'Lehrer' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'Eltern' })).toBeVisible();
      expect(screen.getByRole('option', { name: 'Schüler' })).toBeVisible();

      await screen.findByRole('listbox');
    });

    it('should reset the search filter when searchfield is blurred', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
        {}
      );

      const combobox = screen.getByRole('combobox');
      await fireEvent.type(combobox, 'Schü');

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeVisible();
      });

      await fireEvent.tab();

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toHaveValue('');
      });
      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeVisible();
      });
    });

    it('should show selected options with a checkmark', async () => {
      const fireEvent = userEvent.setup();
      const screen = render(
        <GroupSelect
          selectedGroups={[lehrerGroup]}
          onSelectGroups={() => {}}
        />,
        {}
      );

      await fireEvent.click(
        screen.getByRole('button', { name: /vorschläge/i })
      );

      const selectedOption = screen.getByRole('option', {
        name: 'Lehrer',
      });
      expect(selectedOption).not.toBeNull();
      await waitFor(() => {
        expect(selectedOption).toBeVisible();
      });
    });

    describe('selecting a group', () => {
      const secondAdminGroup: UserGroupModel = {
        id: '87',
        insertedAt: '2020-09-11 00:00',
        updatedAt: '2020-09-11 00:00',
        name: 'Administrator2',
        sortKey: 1500,
        isAdminGroup: true,
        enrollmentTokens: [],
      };

      it('should select a group after having clicked on it', async () => {
        const fireEvent = userEvent.setup();
        const callback = jest.fn((groups) => {
          expect(groups.map((g: UserGroupModel) => g.name)).toEqual([
            'Administrator',
            'Lehrer',
            'Schüler',
          ]);
        });

        const screen = render(
          <GroupSelect
            selectedGroups={[adminGroup, lehrerGroup]}
            onSelectGroups={callback}
          />,
          {},
          { userGroups: [...userGroups, secondAdminGroup] }
        );

        await fireEvent.click(
          screen.getByRole('button', { name: /vorschläge/i })
        );

        await waitFor(() => {
          expect(screen.getByRole('listbox')).toBeVisible();
        });
        const selectedOption = screen.getByRole('option', {
          name: 'Schüler',
        });

        await fireEvent.click(selectedOption);

        await waitFor(() => {
          expect(callback).toHaveBeenCalled();
        });
      });

      it('should select only all admin groups after having clicked on one', async () => {
        const fireEvent = userEvent.setup();
        const callback = jest.fn((groups) => {
          expect(groups.map((g: UserGroupModel) => g.name)).toEqual([
            'Administrator',
            'Administrator2',
          ]);
        });

        const screen = render(
          <GroupSelect
            selectedGroups={[lehrerGroup]}
            onSelectGroups={callback}
          />,
          {},
          { userGroups: [...userGroups, secondAdminGroup] }
        );

        await fireEvent.click(
          screen.getByRole('button', { name: /vorschläge/i })
        );

        await waitFor(() => {
          expect(screen.getByRole('listbox')).toBeVisible();
        });
        const selectedOption = screen.getByRole('option', {
          name: 'Administrator',
        });

        await fireEvent.click(selectedOption);

        await waitFor(() => {
          expect(callback).toHaveBeenCalled();
        });
      });

      it('should deselect a selected non-admin group after having clicked on it', async () => {
        const fireEvent = userEvent.setup();
        const callback = jest.fn((groups) => {
          expect(groups.map((g: UserGroupModel) => g.name)).toEqual([
            'Administrator',
          ]);
        });

        const screen = render(
          <GroupSelect
            selectedGroups={[adminGroup, lehrerGroup]}
            onSelectGroups={callback}
          />,
          {},
          { userGroups: [...userGroups, secondAdminGroup] }
        );

        await fireEvent.click(
          screen.getByRole('button', { name: /vorschläge/i })
        );

        await waitFor(() => {
          expect(screen.getByRole('listbox')).toBeVisible();
        });

        const selectedOption = screen.getByRole('option', {
          name: 'Lehrer',
        });

        await fireEvent.click(selectedOption);

        await waitFor(() => {
          expect(callback).toHaveBeenCalled();
        });
      });

      it('should deselect all selected groups after having clicked on a selected admin group', async () => {
        const fireEvent = userEvent.setup();
        const callback = jest.fn((groups) => {
          expect(groups.map((g: UserGroupModel) => g.name)).toEqual([]);
        });

        const screen = render(
          <GroupSelect
            selectedGroups={[adminGroup, lehrerGroup]}
            onSelectGroups={callback}
          />,
          {},
          { userGroups: [...userGroups, secondAdminGroup] }
        );

        await fireEvent.click(
          screen.getByRole('button', { name: /vorschläge/i })
        );

        await waitFor(() => {
          expect(screen.getByRole('listbox')).toBeVisible();
        });

        const selectedOption = screen.getByRole('option', {
          name: 'Administrator',
        });

        await fireEvent.click(selectedOption);

        await waitFor(() => {
          expect(callback).toHaveBeenCalled();
        });
      });

      describe('with disableGroupExclusivity enabled', () => {
        it('should select a group after having clicked on it', async () => {
          const fireEvent = userEvent.setup();
          const callback = jest.fn((groups) => {
            expect(groups.map((g: UserGroupModel) => g.name)).toEqual([
              'Administrator',
              'Lehrer',
              'Schüler',
            ]);
          });

          const screen = render(
            <GroupSelect
              disableAdminGroupsExclusivity
              selectedGroups={[adminGroup, lehrerGroup]}
              onSelectGroups={callback}
            />,
            {}
          );

          await fireEvent.click(
            screen.getByRole('button', { name: /vorschläge/i })
          );

          await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeVisible();
          });

          const selectedOption = screen.getByRole('option', {
            name: 'Schüler',
          });

          await fireEvent.click(selectedOption);

          await waitFor(() => {
            expect(callback).toHaveBeenCalled();
          });
        });

        it('should deselect a selected group after having clicked on it', async () => {
          const fireEvent = userEvent.setup();
          const callback = jest.fn((groups) => {
            expect(groups.map((g: UserGroupModel) => g.name)).toEqual([
              'Lehrer',
            ]);
          });

          const screen = render(
            <GroupSelect
              disableAdminGroupsExclusivity
              selectedGroups={[adminGroup, lehrerGroup]}
              onSelectGroups={callback}
            />,
            {}
          );

          await fireEvent.click(
            screen.getByRole('button', { name: /vorschläge/i })
          );

          await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeVisible();
          });

          const selectedOption = screen.getByRole('option', {
            name: 'Administrator',
          });

          await fireEvent.click(selectedOption);

          await waitFor(() => {
            expect(callback).toHaveBeenCalled();
          });
        });
      });
    });
  });
});
