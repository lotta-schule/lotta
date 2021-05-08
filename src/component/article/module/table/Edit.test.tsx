import React from 'react';
import { render, waitFor, fireEvent } from 'test/util';
import { LehrerListe } from 'test/fixtures';
import { Edit } from './Edit';
import { excelPasteTransfer, numbersPasteTransfer } from './mockData';
import userEvent from '@testing-library/user-event';

const tableContentModule = LehrerListe.contentModules[0];

describe('component/article/module/table/Edit', () => {
    it('should render without an error', () => {
        render(
            <Edit
                contentModule={tableContentModule}
                onUpdateModule={() => {}}
            />
        );
    });

    describe('render the table', () => {
        it('should render the table with correct content', () => {
            const screen = render(
                <Edit
                    contentModule={tableContentModule}
                    onUpdateModule={() => {}}
                />
            );
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(screen.getAllByRole('row')).toHaveLength(7);
            expect(screen.getAllByRole('cell')).toHaveLength(14);
        });
    });

    describe('edit table cells', () => {
        it('should edit a cell when entering text', async () => {
            const callback = jest.fn((cm) => {
                expect(cm.content).toEqual({
                    rows: [
                        [{ text: 'Kürzel' }, { text: 'Name' }],
                        [{ text: 'LAb' }, { text: 'Lehrer Ah' }],
                        [{ text: 'LeB' }, { text: 'Lehrer Be' }],
                        [{ text: 'LZe' }, { text: 'Lehrer C' }],
                        [{ text: 'LDy' }, { text: 'Lehrer D' }],
                        [{ text: 'LÄh' }, { text: 'Der Mr Lehrer E' }],
                        [{ text: 'LeF' }, { text: 'Lehrer F' }],
                    ],
                });
            });
            const screen = render(
                <Edit
                    contentModule={tableContentModule}
                    onUpdateModule={callback}
                />
            );
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(
                screen.getByRole('cell', { name: 'Lehrer E' })
            ).toBeInTheDocument();
            const input = screen.getByDisplayValue('Lehrer E');
            await userEvent.clear(input);
            await userEvent.type(input, 'Der Mr Lehrer E');
            await userEvent.click(screen.getByRole('table')); // blur input
            await waitFor(() => {
                expect(callback).toHaveBeenCalled();
            });
        });

        describe('navigate via enter key', () => {
            it('should jump to next column', async () => {
                const callback = jest.fn();
                const screen = render(
                    <Edit
                        contentModule={tableContentModule}
                        onUpdateModule={callback}
                    />
                );
                const input = screen.getByDisplayValue('Kürzel');
                await userEvent.click(input);
                await userEvent.type(input, '{enter}');
                await waitFor(() => {
                    expect(screen.getByDisplayValue('Name')).toHaveFocus();
                });
                expect(callback).toHaveBeenCalled();
            });

            it('should jump to next row', async () => {
                const callback = jest.fn();
                const screen = render(
                    <Edit
                        contentModule={tableContentModule}
                        onUpdateModule={callback}
                    />
                );
                const input = screen.getByDisplayValue('Name');
                userEvent.click(input);
                userEvent.type(input, '{enter}');
                await waitFor(() => {
                    expect(screen.getByDisplayValue('LAb')).toHaveFocus();
                });
                expect(callback).toHaveBeenCalled();
            });

            it('should create a new row when on last element', async () => {
                let contentModule = tableContentModule;
                let didCallCallback = false;
                const callback = jest.fn((cm) => {
                    if (!didCallCallback) {
                        // There is a second occurence AFTER test is finished because of blur
                        expect(cm.content.rows).toHaveLength(8);
                        contentModule = cm;
                        didCallCallback = true;
                    }
                });
                const screen = render(
                    <Edit
                        contentModule={contentModule}
                        onUpdateModule={callback}
                    />
                );
                const input = screen.getByDisplayValue('Lehrer F');
                userEvent.click(input);
                userEvent.type(input, '{enter}');
                await waitFor(() => {
                    expect(callback).toHaveBeenCalled();
                });
                screen.rerender(
                    <Edit
                        contentModule={contentModule}
                        onUpdateModule={callback}
                    />
                );
                expect(
                    screen.container.querySelector(
                        '[data-row="7"][data-column="0"]'
                    )
                ).toHaveFocus();
            });
        });

        describe('toolbar buttons', () => {
            it('remove column button should be disabled when there is only one column', () => {
                const contentModule = {
                    ...tableContentModule,
                    content: {
                        rows: tableContentModule.content.rows.map((row) =>
                            row.slice(0, 1)
                        ),
                    },
                };
                const screen = render(
                    <Edit
                        contentModule={contentModule}
                        onUpdateModule={() => {}}
                    />
                );
                expect(
                    screen.getByRole('button', { name: /spalte entfernen/i })
                ).toBeDisabled();
            });

            it('remove row button should be disabled when there is only one row', () => {
                const contentModule = {
                    ...tableContentModule,
                    content: {
                        rows: tableContentModule.content.rows.slice(0, 1),
                    },
                };
                const screen = render(
                    <Edit
                        contentModule={contentModule}
                        onUpdateModule={() => {}}
                    />
                );
                expect(
                    screen.getByRole('button', { name: /zeile entfernen/i })
                ).toBeDisabled();
            });

            it('should remove a column when clicking the button', async () => {
                const callback = jest.fn((cm) => {
                    expect(cm.content).toEqual({
                        rows: [
                            [{ text: 'Kürzel' }],
                            [{ text: 'LAb' }],
                            [{ text: 'LeB' }],
                            [{ text: 'LZe' }],
                            [{ text: 'LDy' }],
                            [{ text: 'LÄh' }],
                            [{ text: 'LeF' }],
                        ],
                    });
                });
                const screen = render(
                    <Edit
                        contentModule={tableContentModule}
                        onUpdateModule={callback}
                    />
                );
                const button = screen.getByRole('button', {
                    name: /spalte entfernen/i,
                });
                await userEvent.click(button);
                await waitFor(() => {
                    expect(callback).toHaveBeenCalled();
                });
            });

            it('should insert a column when clicking the button', async () => {
                let contentModule = tableContentModule;
                const callback = jest.fn((cm) => {
                    cm.content.rows[0].length === 1;
                    contentModule = cm;
                });
                const screen = render(
                    <Edit
                        contentModule={contentModule}
                        onUpdateModule={callback}
                    />
                );
                const button = screen.getByRole('button', {
                    name: /spalte hinzufügen/i,
                });
                await userEvent.click(button);
                await waitFor(() => {
                    expect(callback).toHaveBeenCalled();
                });
                screen.rerender(
                    <Edit
                        contentModule={contentModule}
                        onUpdateModule={callback}
                    />
                );
                expect(
                    screen.container.querySelector(
                        '[data-row="0"][data-column="2"]'
                    )
                ).toHaveFocus();
            });

            it('should remove a row when clicking the button', async () => {
                const callback = jest.fn((cm) => {
                    expect(cm.content).toEqual({
                        rows: [
                            [{ text: 'Kürzel' }, { text: 'Name' }],
                            [{ text: 'LAb' }, { text: 'Lehrer Ah' }],
                            [{ text: 'LeB' }, { text: 'Lehrer Be' }],
                            [{ text: 'LZe' }, { text: 'Lehrer C' }],
                            [{ text: 'LDy' }, { text: 'Lehrer D' }],
                            [{ text: 'LÄh' }, { text: 'Lehrer E' }],
                        ],
                    });
                });
                const screen = render(
                    <Edit
                        contentModule={tableContentModule}
                        onUpdateModule={callback}
                    />
                );
                const button = screen.getByRole('button', {
                    name: /zeile entfernen/i,
                });
                await userEvent.click(button);
                await waitFor(() => {
                    expect(callback).toHaveBeenCalled();
                });
            });

            it('should insert a row when clicking the button', async () => {
                let contentModule = tableContentModule;
                const callback = jest.fn((cm) => {
                    expect(cm.content.rows).toHaveLength(8);
                    contentModule = cm;
                });
                const screen = render(
                    <Edit
                        contentModule={contentModule}
                        onUpdateModule={callback}
                    />
                );
                const button = screen.getByRole('button', {
                    name: /zeile hinzufügen/i,
                });
                await userEvent.click(button);
                await waitFor(() => {
                    expect(callback).toHaveBeenCalled();
                });
                screen.rerender(
                    <Edit
                        contentModule={contentModule}
                        onUpdateModule={callback}
                    />
                );
                expect(
                    screen.container.querySelector(
                        '[data-row="7"][data-column="0"]'
                    )
                ).toHaveFocus();
            });
        });
    });

    describe('pasting from other application', () => {
        it('should paste from excel to top-most upper-left corner', async () => {
            const callback = jest.fn((cm) => {
                expect(cm.content).toEqual({
                    rows: [
                        [{ text: 'A' }, { text: 'B' }, { text: 'C' }],
                        [{ text: 'D' }, { text: 'E' }, { text: 'F' }],
                        [{ text: 'G' }, { text: 'H' }, { text: 'I' }],
                        [{ text: 'LZe' }, { text: 'Lehrer C' }, { text: '' }],
                        [{ text: 'LDy' }, { text: 'Lehrer D' }, { text: '' }],
                        [{ text: 'LÄh' }, { text: 'Lehrer E' }, { text: '' }],
                        [{ text: 'LeF' }, { text: 'Lehrer F' }, { text: '' }],
                    ],
                });
            });
            const screen = render(
                <Edit
                    contentModule={tableContentModule}
                    onUpdateModule={callback}
                />
            );
            const upperLeftInput = screen.getByDisplayValue('Kürzel');
            await userEvent.click(upperLeftInput);
            await fireEvent.paste(upperLeftInput, {
                clipboardData: excelPasteTransfer,
            });
            await waitFor(() => {
                expect(callback).toHaveBeenCalled();
            });
        });

        it('should paste from numbers to top-most upper-left corner', async () => {
            const callback = jest.fn((cm) => {
                expect(cm.content).toEqual({
                    rows: [
                        [{ text: 'A' }, { text: 'B' }, { text: 'C' }],
                        [{ text: 'D' }, { text: 'E' }, { text: 'F' }],
                        [{ text: 'G' }, { text: 'H' }, { text: 'I' }],
                        [{ text: 'LZe' }, { text: 'Lehrer C' }, { text: '' }],
                        [{ text: 'LDy' }, { text: 'Lehrer D' }, { text: '' }],
                        [{ text: 'LÄh' }, { text: 'Lehrer E' }, { text: '' }],
                        [{ text: 'LeF' }, { text: 'Lehrer F' }, { text: '' }],
                    ],
                });
            });
            const screen = render(
                <Edit
                    contentModule={tableContentModule}
                    onUpdateModule={callback}
                />
            );
            const upperLeftInput = screen.getByDisplayValue('Kürzel');
            await userEvent.click(upperLeftInput);
            await fireEvent.paste(upperLeftInput, {
                clipboardData: numbersPasteTransfer,
            });
            await waitFor(() => {
                expect(callback).toHaveBeenCalled();
            });
        });

        it('should expand the current grid if pastet to the bottom right corner', async () => {
            const callback = jest.fn((cm) => {
                expect(cm.content).toEqual({
                    rows: [
                        [
                            { text: 'Kürzel' },
                            { text: 'Name' },
                            { text: '' },
                            { text: '' },
                        ],
                        [
                            { text: 'LAb' },
                            { text: 'Lehrer Ah' },
                            { text: '' },
                            { text: '' },
                        ],
                        [
                            { text: 'LeB' },
                            { text: 'Lehrer Be' },
                            { text: '' },
                            { text: '' },
                        ],
                        [
                            { text: 'LZe' },
                            { text: 'Lehrer C' },
                            { text: '' },
                            { text: '' },
                        ],
                        [
                            { text: 'LDy' },
                            { text: 'Lehrer D' },
                            { text: '' },
                            { text: '' },
                        ],
                        [
                            { text: 'LÄh' },
                            { text: 'A' },
                            { text: 'B' },
                            { text: 'C' },
                        ],
                        [
                            { text: 'LeF' },
                            { text: 'D' },
                            { text: 'E' },
                            { text: 'F' },
                        ],
                        [
                            { text: '' },
                            { text: 'G' },
                            { text: 'H' },
                            { text: 'I' },
                        ],
                    ],
                });
            });
            const screen = render(
                <Edit
                    contentModule={tableContentModule}
                    onUpdateModule={callback}
                />
            );
            const bottomRightInput = screen.getByDisplayValue('Lehrer E');
            await userEvent.click(bottomRightInput);
            await fireEvent.paste(bottomRightInput, {
                clipboardData: numbersPasteTransfer,
            });
            await waitFor(() => {
                expect(callback).toHaveBeenCalled();
            });
        });
    });
});
