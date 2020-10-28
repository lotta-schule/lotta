import React from 'react';
import { UserGroupModel } from 'model';
import { render, cleanup, waitFor, createEvent, fireEvent } from 'test/util';
import { adminGroup, lehrerGroup, schuelerGroup, system, elternGroup } from 'test/fixtures';
import { GroupSelect } from './GroupSelect';
import userEvent from '@testing-library/user-event';

afterEach(cleanup);

describe('component/edit/GroupSelect', () => {

    it('should render an GroupSelect without error', () => {
        render(
            <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
            {}
        );
    });

    describe('label prop', () => {
        it('should show a default label', () => {
            const screen = render(
                <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
                {}
            );
            expect(screen.getByText('Sichtbarkeit:')).toBeVisible();
        });

        it('should show a given', () => {
            const screen = render(
                <GroupSelect label={'Wähle Gruppen:'} selectedGroups={[]} onSelectGroups={() => {}} />,
                {}
            );
            expect(screen.getByText('Wähle Gruppen:')).toBeVisible();
        });
    });

    describe('disabled prop', () => {
        it('should disable the input field', async done => {
            const screen = render(
                <GroupSelect disabled selectedGroups={[]} onSelectGroups={() => {}} />,
                {}
            );

            const input = await screen.findByRole('textbox');
            expect(input).toBeVisible();
            expect(input).toBeDisabled();

            done();
        });

        it('should disable the remove group button', async done => {
            const screen = render(
                <GroupSelect disabled selectedGroups={[schuelerGroup]} onSelectGroups={() => {}} />,
                {}
            );

            const removeButton = await screen.findByLabelText('Gruppe "Schüler" entfernen')
            expect(removeButton).toBeVisible();
            expect(removeButton).toBeDisabled();

            done();
        });

        it('should disable the publicly available checkbox', async done => {
            const screen = render(
                <GroupSelect disabled selectedGroups={[schuelerGroup]} onSelectGroups={() => {}} />,
                {}
            );

            const checkbox = await screen.findByRole('checkbox');

            expect(checkbox).toBeDisabled();

            done();
        });
    });

    describe('publicly available checkbox', () => {
        it('should be checked when no groups are selected', async done => {
            const screen = render(
                <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
                {}
            );

            const selection = await screen.findByLabelText(/alle sichtbar/i);

            expect(selection).toBeChecked();

            done();
        });

        it('should not be checked when a group is selected', async done => {
            const screen = render(
                <GroupSelect selectedGroups={[lehrerGroup]} onSelectGroups={() => {}} />,
                {}
            );

            const selection = await screen.findByLabelText(/alle sichtbar/i);

            expect(selection).not.toBeChecked();

            done();
        });

        it('should add all groups when checkbox is unchecked', async done => {
            const callback = jest.fn(newGroups => {
                expect(newGroups.map((g: UserGroupModel) => g.name)).toEqual(['Administrator', 'Lehrer', 'Schüler', 'Eltern']);
            });
            const screen = render(
                <GroupSelect selectedGroups={[]} onSelectGroups={callback} />,
                {}
            );

            const selection = await screen.findByLabelText(/alle sichtbar/i);

            await userEvent.click(selection);

            await waitFor(() => {
                expect(callback).toHaveBeenCalled();
            });

            done();
        });

        it('should remove all groups when checkbox is checked', async done => {
            const callback = jest.fn(newGroups => {
                expect(newGroups.map((g: UserGroupModel) => g.name)).toEqual([]);
            });
            const screen = render(
                <GroupSelect selectedGroups={[adminGroup, elternGroup, lehrerGroup]} onSelectGroups={callback} />,
                {}
            );

            const selection = await screen.findByLabelText(/alle sichtbar/i);

            await userEvent.click(selection);

            await waitFor(() => {
                expect(callback).toHaveBeenCalled();
            });

            done();
        });

        it('should not show element when hidePublicGroupSelection prop is given', () => {
            const screen = render(
                <GroupSelect hidePublicGroupSelection selectedGroups={[]} onSelectGroups={() => {}} />,
                {}
            );
            expect(screen.queryByLabelText(/alle sichtbar/i)).toBeNull();
        });

        it('should change the elements description when publicGroupSelectionLabel is given', () => {
            const screen = render(
                <GroupSelect publicGroupSelectionLabel={'Keine Gruppen'} selectedGroups={[]} onSelectGroups={() => {}} />,
                {}
            );
            expect(screen.queryByLabelText(/keine gruppen/i)).toBeInTheDocument();
        });
    });

    describe ('selection display', () => {
        it('should show selected group if one is selected', async done => {
            const screen = render(
                <GroupSelect selectedGroups={[adminGroup]} onSelectGroups={() => {}} />,
                {}
            );

            const selection = await screen.findByTestId('GroupSelectSelection');

            expect(selection).toHaveTextContent(/Administrator/i);

            done();
        });

        it('should show selected groups (in order) if multiple are selected', async done => {
            const screen = render(
                <GroupSelect selectedGroups={[lehrerGroup, schuelerGroup, adminGroup]} onSelectGroups={() => {}} />,
                {}
            );

            const selection = await screen.findByTestId('GroupSelectSelection');

            expect(selection).toHaveTextContent(/AdministratorLehrerSchüler/i);

            done();
        });
    });

    describe('should manipulate selected groups', () => {
        it('should send deselection request when clicking on group\'s "X"', async done => {
            const callback = jest.fn(newGroups => {
                expect(newGroups.map((g: UserGroupModel) => g.name)).toEqual(['Administrator', 'Lehrer']);
            });
            const screen = render(
                <GroupSelect
                    selectedGroups={[lehrerGroup, schuelerGroup, adminGroup]}
                    onSelectGroups={callback}
                />,
                {}
            );

            await userEvent.click(await screen.findByLabelText('Gruppe "Schüler" entfernen'));

            await waitFor(() => {
                expect(callback).toHaveBeenCalled()
            });

            done();
        });
    });

    describe('listbox options', () => {
        it('should provide all groups as options when clicking into the input field', async done => {
            const screen = render(
                <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
                {}
            );

            await userEvent.click(await screen.findByPlaceholderText(/gruppe suchen/i));

            expect(screen.getByRole('option', { name: 'Administrator' })).toBeVisible();
            expect(screen.getByRole('option', { name: 'Lehrer' })).toBeVisible();
            expect(screen.getByRole('option', { name: 'Eltern' })).toBeVisible();
            expect(screen.getByRole('option', { name: 'Schüler' })).toBeVisible();

            await screen.findByRole('listbox');

            done();
        });

        it('should filter the groups when entering text into the search field', async done => {
            const screen = render(
                <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
                {}
            );

            await userEvent.type(await screen.findByRole('textbox'), 'Schü')

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeVisible();
            });

            await waitFor(() => {
                expect(screen.queryByRole('option', { name: 'Administrator' })).toBeNull();
            });

            expect(screen.queryByRole('option', { name: 'Lehrer' })).toBeNull();
            expect(screen.queryByRole('option', { name: 'Eltern' })).toBeNull();
            expect(screen.queryByRole('option', { name: 'Schüler' })).toBeVisible();

            done();

        });

        it('should reset the search filter when searchfield is blurred', async done => {
            const screen = render(
                <GroupSelect selectedGroups={[]} onSelectGroups={() => {}} />,
                {}
            );

            await userEvent.type(await screen.findByRole('textbox'), 'Schü')

            await waitFor(() => {
                expect(screen.queryByRole('listbox')).toBeVisible();
            });

            await fireEvent(screen.getByRole('textbox'), createEvent.blur(screen.getByRole('textbox')));

            await waitFor(() => {
                expect(screen.queryByRole('listbox')).toBeNull();
            });
            await waitFor(() => {
                expect(screen.getByRole('textbox')).toHaveValue('');
            });

            done();

        });

        it('should show selected options with a checkmark', async done => {
            const screen = render(
                <GroupSelect selectedGroups={[lehrerGroup]} onSelectGroups={() => {}} />,
                {}
            );

            await userEvent.click(await screen.findByPlaceholderText(/gruppe suchen/i));

            const selectedOption = screen.getByRole('option', { name: 'Lehrer', selected: true });
            expect(selectedOption).not.toBeNull();
            expect(selectedOption).toBeVisible();

            done();
        });

        it('should not show checkmark when element is not selected', async done => {
            const screen = render(
                <GroupSelect selectedGroups={[lehrerGroup]} onSelectGroups={() => {}} />,
                {}
            );

            await userEvent.click(await screen.findByPlaceholderText(/gruppe suchen/i));

            const selectedOption = screen.getByRole('option', { name: 'Schüler', selected: false });
            const icon = selectedOption.querySelector('svg');
            expect(icon).toHaveStyle({color: 'transparent'});

            done();
        });

        describe('selecting a group', () => {
            const systemWith2AdminGroups = {
                ...system,
                groups: [
                    ...system.groups,
                    {
                        id: '87',
                        insertedAt: '2020-09-11 00:00',
                        updatedAt:  '2020-09-11 00:00',
                        name: 'Administrator2',
                        sortKey: 1500,
                        isAdminGroup: true,
                        enrollmentTokens: [],
                    }
                ]
            };

            it('should select a group after having clicked on it', async done => {
                const callback = jest.fn(groups => {
                    expect(groups.map((g: UserGroupModel) => g.name)).toEqual(['Administrator', 'Lehrer', 'Schüler']);
                });

                const screen = render(
                    <GroupSelect selectedGroups={[adminGroup, lehrerGroup]} onSelectGroups={callback} />,
                    {},
                    { system: systemWith2AdminGroups }
                );

                await userEvent.click(await screen.findByRole('textbox'));

                await waitFor(() => {
                    expect(screen.getByRole('listbox')).toBeVisible();
                });
                const selectedOption = screen.getByRole('option', { name: 'Schüler', selected: false });

                await userEvent.click(selectedOption);

                await waitFor(() => {
                    expect(callback).toHaveBeenCalled();
                });

                done();
            });

            it('should select only all admin groups after having clicked on one', async done => {
                const callback = jest.fn(groups => {
                    expect(groups.map((g: UserGroupModel) => g.name)).toEqual(['Administrator', 'Administrator2']);
                });

                const screen = render(
                    <GroupSelect selectedGroups={[lehrerGroup]} onSelectGroups={callback} />,
                    {}, {
                        system: systemWith2AdminGroups
                    }
                );

                await userEvent.click(await screen.findByRole('textbox'));

                await waitFor(() => {
                    expect(screen.getByRole('listbox')).toBeVisible();
                });
                const selectedOption = screen.getByRole('option', { name: 'Administrator', selected: false });

                await userEvent.click(selectedOption);

                await waitFor(() => {
                    expect(callback).toHaveBeenCalled();
                });

                done();
            });

            it('should deselect a selected non-admin group after having clicked on it', async done => {
                const callback = jest.fn(groups => {
                    expect(groups.map((g: UserGroupModel) => g.name)).toEqual(['Administrator']);
                });

                const screen = render(
                    <GroupSelect selectedGroups={[adminGroup, lehrerGroup]} onSelectGroups={callback} />,
                    {},
                    { system: systemWith2AdminGroups }
                );

                await userEvent.click(await screen.findByRole('textbox'));

                await waitFor(() => {
                    expect(screen.getByRole('listbox')).toBeVisible();
                });

                const selectedOption = screen.getByRole('option', { name: 'Lehrer', selected: true });

                await userEvent.click(selectedOption);

                await waitFor(() => {
                    expect(callback).toHaveBeenCalled();
                });

                done();
            });

            it('should deselect all selected groups after having clicked on a selected admin group', async done => {
                const callback = jest.fn(groups => {
                    expect(groups.map((g: UserGroupModel) => g.name)).toEqual([]);
                });

                const screen = render(
                    <GroupSelect selectedGroups={[adminGroup, lehrerGroup]} onSelectGroups={callback} />,
                    {},
                    { system: systemWith2AdminGroups }
                );

                await userEvent.click(await screen.findByRole('textbox'));

                await waitFor(() => {
                    expect(screen.getByRole('listbox')).toBeVisible();
                });

                const selectedOption = screen.getByRole('option', { name: 'Administrator', selected: true });

                await userEvent.click(selectedOption);

                await waitFor(() => {
                    expect(callback).toHaveBeenCalled();
                });

                done();
            });

            describe('with disableGroupExclusivity enabled', () => {
                it('should select a group after having clicked on it', async done => {
                    const callback = jest.fn(groups => {
                        expect(groups.map((g: UserGroupModel) => g.name)).toEqual(['Administrator', 'Lehrer', 'Schüler']);
                    });

                    const screen = render(
                        <GroupSelect disableAdminGroupsExclusivity selectedGroups={[adminGroup, lehrerGroup]} onSelectGroups={callback} />,
                        {}
                    );

                    await userEvent.click(await screen.findByRole('textbox'));

                    await waitFor(() => {
                        expect(screen.getByRole('listbox')).toBeVisible();
                    });

                    const selectedOption = screen.getByRole('option', { name: 'Schüler', selected: false });

                    await userEvent.click(selectedOption);

                    await waitFor(() => {
                        expect(callback).toHaveBeenCalled();
                    });

                    done();
                });

                it('should deselect a selected group after having clicked on it', async done => {
                    const callback = jest.fn(groups => {
                        expect(groups.map((g: UserGroupModel) => g.name)).toEqual(['Lehrer']);
                    });

                    const screen = render(
                        <GroupSelect disableAdminGroupsExclusivity selectedGroups={[adminGroup, lehrerGroup]} onSelectGroups={callback} />,
                        {}
                    );

                    await userEvent.click(await screen.findByRole('textbox'));

                    await waitFor(() => {
                        expect(screen.getByRole('listbox')).toBeVisible();
                    });

                    const selectedOption = screen.getByRole('option', { name: 'Administrator', selected: true });

                    await userEvent.click(selectedOption);

                    await waitFor(() => {
                        expect(callback).toHaveBeenCalled();
                    });

                    done();
                });
            });
        });
    });
});
