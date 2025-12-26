import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { UserGroupModel } from 'model';
import { render, waitFor, within, userEvent } from 'test/util';
import {
  adminGroup,
  lehrerGroup,
  schuelerGroup,
  elternGroup,
  userGroups,
} from 'test/fixtures';
import { GroupSelect } from './GroupSelect';

describe('shared/editor/GroupSelect', () => {
  describe('label prop', () => {
    it('should show a default label', async () => {
      const screen = render(
        <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
        {}
      );

      await waitFor(() => {
        expect(screen.getByText('Gruppe suchen')).toBeVisible();
      });
    });

    it('should show a given label', async () => {
      const screen = render(
        <GroupSelect
          label={'Wähle Gruppen:'}
          selectedGroups={[]}
          onSelectGroups={() => {}}
        />,
        {}
      );
      await waitFor(() => {
        expect(screen.getByText('Wähle Gruppen:')).toBeVisible();
      });
    });
  });

  describe('disabled prop', () => {
    it('should disable the input field', async () => {
      const screen = render(
        <GroupSelect disabled selectedGroups={[]} onSelectGroups={() => {}} />,
        {}
      );

      await waitFor(() => {
        const input = screen.getByRole('combobox', {
          name: /gruppe suchen/i,
        });
        expect(input).toBeVisible();
        expect(input).toBeDisabled();
      });
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

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });
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

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

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

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

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

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

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

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

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

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

      const selection = await screen.findByLabelText(/alle sichtbar/i);

      expect(selection).not.toBeChecked();
    });

    it('should add all groups when checkbox is unchecked', async () => {
      const user = userEvent.setup();
      const callback = vi.fn((newGroups) => {
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

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

      const selection = await screen.findByLabelText(/alle sichtbar/i);

      await user.click(selection);

      await waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });
    });

    it('should remove all groups when checkbox is checked', async () => {
      const fireEvent = userEvent.setup();
      const callback = vi.fn((newGroups) => {
        expect(newGroups.map((g: UserGroupModel) => g.name)).toEqual([]);
      });
      const screen = render(
        <GroupSelect
          selectedGroups={[adminGroup, elternGroup, lehrerGroup]}
          onSelectGroups={callback}
        />,
        {}
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

      const selection = await screen.findByLabelText(/alle sichtbar/i);

      await fireEvent.click(selection);

      await waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });
    });

    it('should not show element when hidePublicGroupSelection prop is given', async () => {
      const screen = render(
        <GroupSelect
          hidePublicGroupSelection
          selectedGroups={[]}
          onSelectGroups={() => {}}
        />,
        {}
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

      expect(screen.queryByLabelText(/alle sichtbar/i)).toBeNull();
    });

    it('should change the elements description when publicGroupSelectionLabel is given', async () => {
      const screen = render(
        <GroupSelect
          publicGroupSelectionLabel={'Keine Gruppen'}
          selectedGroups={[]}
          onSelectGroups={() => {}}
        />,
        {}
      );

      await waitFor(() => {
        expect(screen.getByRole('checkbox')).toBeVisible();
      });

      expect(screen.queryByLabelText(/keine gruppen/i)).toBeInTheDocument();
    });
  });

  describe('selection display', () => {
    it('should show selected group if one is selected', async () => {
      const screen = render(
        <GroupSelect selectedGroups={[adminGroup]} onSelectGroups={() => {}} />,
        {}
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

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

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

      const selection = await screen.findByTestId('GroupSelectSelection');

      expect(selection).toHaveTextContent(/AdministratorLehrerSchüler/i);
    });

    it('should show a placeholder if no group is selected', async () => {
      const fireEvent = userEvent.setup();

      const onSelectGroups = vi.fn();

      const screen = render(
        <GroupSelect selectedGroups={[]} onSelectGroups={onSelectGroups} />,
        {}
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

      const combobox = screen.queryByRole('combobox');

      expect(combobox).toBeVisible();
      expect(combobox).toHaveValue('');

      await fireEvent.click(
        screen.getByRole('button', { name: /empfehlungen/i })
      );

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeVisible();
      });
      await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

      expect(
        await screen.findByRole('option', {
          name: 'Administrator',
        })
      ).toBeVisible();

      await fireEvent.click(
        screen.getByRole('option', {
          name: 'Administrator',
        })
      );

      expect(onSelectGroups).toHaveBeenCalled();

      screen.rerender(
        <GroupSelect
          selectedGroups={[adminGroup]}
          onSelectGroups={onSelectGroups}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('GroupSelectSelection')).toHaveTextContent(
          'Administrator'
        );
      });
    });
  });

  describe('should manipulate selected groups', () => {
    it('should send deselection request when clicking on group\'s "X"', async () => {
      const fireEvent = userEvent.setup();
      const callback = vi.fn((newGroups) => {
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

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

      await fireEvent.click(await screen.findByLabelText(/Schüler löschen/));

      await waitFor(() => {
        expect(callback).toHaveBeenCalled();
      });
    });
  });

  describe('listbox options', () => {
    it('should provide all groups as options when clicking into the input field', async () => {
      const user = userEvent.setup();
      const screen = render(
        <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
        {}
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: /empfehlungen/i }));

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

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

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
        expect(screen.queryByRole('listbox')).toBeNull();
      });
    });

    it('should show selected options with a checkmark', async () => {
      const user = userEvent.setup();
      const screen = render(
        <GroupSelect
          selectedGroups={[lehrerGroup]}
          onSelectGroups={() => {}}
        />,
        {}
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: /empfehlungen/i }));

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
        eduplacesId: null,
        insertedAt: '2020-09-11 00:00',
        updatedAt: '2020-09-11 00:00',
        name: 'Administrator2',
        sortKey: 1500,
        canReadFullName: false,
        isAdminGroup: true,
        enrollmentTokens: [],
      };

      it('should select a group after having clicked on it', async () => {
        const user = userEvent.setup();
        const callback = vi.fn((groups) => {
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

        await waitFor(() => {
          expect(screen.getByRole('checkbox')).toBeInTheDocument();
        });

        await user.click(screen.getByRole('button', { name: /empfehlungen/i }));

        await waitFor(() => {
          expect(screen.getByRole('listbox')).toBeVisible();
        });
        await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

        const selectedOption = await screen.findByRole('option', {
          name: 'Schüler',
        });

        await user.click(selectedOption);

        await waitFor(() => {
          expect(callback).toHaveBeenCalled();
        });
      });

      it('should select only all admin groups after having clicked on one', async () => {
        const fireEvent = userEvent.setup();
        const callback = vi.fn((groups) => {
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

        await waitFor(() => {
          expect(screen.getByRole('combobox')).toBeVisible();
        });

        await fireEvent.click(
          screen.getByRole('button', { name: /empfehlungen/i })
        );

        await waitFor(() => {
          expect(screen.getByRole('listbox')).toBeVisible();
        });
        await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

        const selectedOption = screen.getByRole('option', {
          name: 'Administrator',
        });

        await fireEvent.click(selectedOption);

        await waitFor(() => {
          expect(callback).toHaveBeenCalled();
        });
      });

      it('should deselect a selected non-admin group after having clicked on it', async () => {
        const user = userEvent.setup();
        const callback = vi.fn((groups) => {
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

        await waitFor(() => {
          expect(screen.getByRole('combobox')).toBeVisible();
        });

        await user.click(screen.getByRole('button', { name: /empfehlungen/i }));

        await waitFor(() => {
          expect(screen.getByRole('listbox')).toBeVisible();
        });
        await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

        const selectedOption = screen.getByRole('option', {
          name: 'Lehrer',
        });

        await user.click(selectedOption);

        await waitFor(() => {
          expect(callback).toHaveBeenCalled();
        });
      });

      it('should deselect all selected groups after having clicked on a selected admin group', async () => {
        const user = userEvent.setup();
        const callback = vi.fn((groups) => {
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

        await waitFor(() => {
          expect(screen.getByRole('combobox')).toBeVisible();
        });

        await user.click(screen.getByRole('button', { name: /empfehlungen/i }));

        await waitFor(() => {
          expect(screen.getByRole('listbox')).toBeVisible();
        });
        await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

        const selectedOption = screen.getByRole('option', {
          name: 'Administrator',
        });

        await user.click(selectedOption);

        await waitFor(() => {
          expect(callback).toHaveBeenCalled();
        });
      });

      describe('with disableGroupExclusivity enabled', () => {
        it('should select a group after having clicked on it', async () => {
          const user = userEvent.setup();
          const callback = vi.fn((groups) => {
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

          await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeVisible();
          });

          await user.click(
            screen.getByRole('button', { name: /empfehlungen/i })
          );

          await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeVisible();
          });
          await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

          const selectedOption = screen.getByRole('option', {
            name: 'Schüler',
          });

          await user.click(selectedOption);

          await waitFor(() => {
            expect(callback).toHaveBeenCalled();
          });
        });

        it('should deselect a selected group after having clicked on it', async () => {
          const user = userEvent.setup();
          const callback = vi.fn((groups) => {
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

          await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeVisible();
          });

          await user.click(
            screen.getByRole('button', { name: /empfehlungen/i })
          );

          await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeVisible();
          });
          await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

          const selectedOption = screen.getByRole('option', {
            name: 'Administrator',
          });

          await user.click(selectedOption);

          await waitFor(() => {
            expect(callback).toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('allowNoneSelection', () => {
    it('should add a "None" selection when allowNoneSelection prop is passed', async () => {
      const user = userEvent.setup();
      const onSelectGroups = vi.fn();
      const screen = render(
        <GroupSelect
          allowNoneSelection
          selectedGroups={[lehrerGroup]}
          onSelectGroups={onSelectGroups}
        />,
        {},
        { userGroups: [...userGroups] }
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: /empfehlungen/i }));

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeVisible();
      });
      await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

      expect(
        screen.getByRole('option', { name: 'Ohne zugewiesene Gruppe' })
      ).toBeVisible();

      await user.click(
        screen.getByRole('option', { name: 'Ohne zugewiesene Gruppe' })
      );

      await waitFor(() => {
        expect(onSelectGroups).toHaveBeenCalledWith([null, lehrerGroup]);
      });

      screen.rerender(
        <GroupSelect
          allowNoneSelection
          selectedGroups={[null]}
          onSelectGroups={onSelectGroups}
        />
      );

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull();
      });

      await waitFor(() => {
        expect(screen.getByTestId('GroupSelectSelection')).toHaveTextContent(
          'Ohne zugewiesene Gruppe'
        );
      });

      const tagDeleteButton = within(
        screen.getByTestId('GroupSelectSelection')
      ).getByRole('button', { name: /Tag ohne zugewiesene gruppe/i });

      await user.click(tagDeleteButton);

      await waitFor(() => {
        expect(onSelectGroups).toHaveBeenCalledWith([]);
      });
    });

    it('should toggle the "None" option on and off when clicked two times', async () => {
      const user = userEvent.setup();
      const onSelectGroups = vi.fn();
      const screen = render(
        <GroupSelect
          allowNoneSelection
          hidePublicGroupSelection
          selectedGroups={[lehrerGroup]}
          onSelectGroups={onSelectGroups}
        />,
        {},
        { userGroups: [...userGroups] }
      );

      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeVisible();
      });

      await user.click(screen.getByRole('button', { name: /empfehlungen/i }));

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeVisible();
      });
      await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

      await user.click(
        await screen.findByRole('option', { name: 'Ohne zugewiesene Gruppe' })
      );

      await waitFor(() => {
        expect(onSelectGroups).toHaveBeenCalledWith([null, lehrerGroup]);
      });

      screen.rerender(
        <GroupSelect
          allowNoneSelection
          hidePublicGroupSelection
          selectedGroups={[null, lehrerGroup]}
          onSelectGroups={onSelectGroups}
        />
      );

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).toBeNull();
      });

      await waitFor(() => {
        expect(screen.getByTestId('GroupSelectSelection')).toHaveTextContent(
          'Ohne zugewiesene Gruppe'
        );
      });

      await waitFor(() => new Promise((resolve) => setTimeout(resolve, 300))); // wait for it to settle

      await user.click(screen.getByRole('button', { name: /empfehlungen/i }));

      await waitFor(
        () => {
          expect(
            screen.getByRole('option', {
              name: 'Ohne zugewiesene Gruppe',
              hidden: true,
            })
          ).toBeVisible();
        },
        { timeout: 10000 }
      );

      await user.click(
        await screen.findByRole('option', {
          name: 'Ohne zugewiesene Gruppe',
          hidden: true,
        })
      );

      await waitFor(() => {
        expect(onSelectGroups).toHaveBeenCalledWith([null, lehrerGroup]);
      });
    }, 10_000);
  });
});
