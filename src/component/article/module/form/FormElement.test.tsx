import React from 'react';
import { render, waitFor } from 'test/util';
import { FormElement } from './FormElement';
import { imageFile, logosDirectory, SomeUser } from 'test/fixtures';
import { GetDirectoriesAndFilesQuery } from 'api/query/GetDirectoriesAndFiles';
import userEvent from '@testing-library/user-event';

describe('component/article/module/form/FormElement', () => {
    describe('input element', () => {
        it('should render a text field', () => {
            const setValueFn = jest.fn();
            const screen = render(
                <FormElement
                    element={{
                        element: 'input',
                        name: 'blabla1',
                        label: 'Bla Bla 1',
                    }}
                    value={''}
                    onSetValue={setValueFn}
                />
            );
            expect(
                screen.getByRole('textbox', { name: /Bla Bla 1/i })
            ).toBeInTheDocument();
            userEvent.type(
                screen.getByRole('textbox', { name: /Bla Bla 1/i }),
                'A'
            );
            expect(setValueFn).toHaveBeenLastCalledWith('A');
        });

        it('should render an email field', () => {
            const setValueFn = jest.fn();
            const screen = render(
                <FormElement
                    element={{
                        element: 'input',
                        type: 'email',
                        name: 'blabla1',
                        label: 'Bla Bla 1',
                    }}
                    value={''}
                    onSetValue={setValueFn}
                />
            );
            expect(
                screen.getByRole('textbox', { name: /Bla Bla 1/i })
            ).toBeInTheDocument();
            expect(
                screen.getByRole('textbox', { name: /Bla Bla 1/i })
            ).toHaveProperty('type', 'email');
        });
    });

    describe('selection element', () => {
        it('should render and select checkboxes', () => {
            const setValueFn = jest.fn();
            const screen = render(
                <FormElement
                    element={{
                        element: 'selection',
                        type: 'checkbox',
                        name: 'blabla1',
                        options: [
                            { value: 'A', label: 'Erster Buchstabe' },
                            { value: 'B', label: 'Zweiter Buchstabe' },
                            { value: 'C', label: 'Dritter Buchstabe' },
                        ],
                    }}
                    value={['B']}
                    onSetValue={setValueFn}
                />
            );
            expect(screen.getAllByRole('checkbox')).toHaveLength(3);
            expect(
                screen.getByRole('checkbox', { name: /erster buchstabe/i })
            ).not.toBeChecked();
            expect(
                screen.getByRole('checkbox', { name: /zweiter buchstabe/i })
            ).toBeChecked();
            expect(
                screen.getByRole('checkbox', { name: /dritter buchstabe/i })
            ).not.toBeChecked();

            // select
            userEvent.click(
                screen.getByRole('checkbox', { name: /dritter buchstabe/i })
            );
            expect(setValueFn).toHaveBeenCalledWith(['B', 'C']);

            // de-select
            userEvent.click(
                screen.getByRole('checkbox', { name: /zweiter buchstabe/i })
            );
            expect(setValueFn).toHaveBeenCalledWith([]);
        });

        it('should render and select radioboxes', () => {
            const setValueFn = jest.fn();
            const screen = render(
                <FormElement
                    element={{
                        element: 'selection',
                        type: 'radio',
                        name: 'blabla1',
                        options: [
                            { value: 'A', label: 'Erster Buchstabe' },
                            { value: 'B', label: 'Zweiter Buchstabe' },
                            { value: 'C', label: 'Dritter Buchstabe' },
                        ],
                    }}
                    value={'B'}
                    onSetValue={setValueFn}
                />
            );
            expect(screen.getAllByRole('radio')).toHaveLength(3);
            expect(
                screen.getByRole('radio', { name: /erster buchstabe/i })
            ).not.toBeChecked();
            expect(
                screen.getByRole('radio', { name: /zweiter buchstabe/i })
            ).toBeChecked();
            expect(
                screen.getByRole('radio', { name: /dritter buchstabe/i })
            ).not.toBeChecked();

            userEvent.click(
                screen.getByRole('radio', { name: /dritter buchstabe/i })
            );
            expect(setValueFn).toHaveBeenCalledWith('C');
        });

        it('should render and select from a select field', () => {
            const setValueFn = jest.fn();
            const screen = render(
                <FormElement
                    element={{
                        element: 'selection',
                        type: 'select',
                        name: 'blabla1',
                        label: 'BlaBla1',
                        options: [
                            { value: 'A', label: 'Erster Buchstabe' },
                            { value: 'B', label: 'Zweiter Buchstabe' },
                            { value: 'C', label: 'Dritter Buchstabe' },
                        ],
                    }}
                    value={'B'}
                    onSetValue={setValueFn}
                />
            );
            expect(screen.getByRole('button')).toHaveTextContent(
                /zweiter buchstabe/i
            );
            expect(screen.getByRole('textbox', { hidden: true })).toHaveValue(
                'B'
            );

            userEvent.click(screen.getByRole('button'));
            expect(screen.getAllByRole('option')).toHaveLength(3);
            expect(
                screen.getByRole('option', { name: /erster buchstabe/i })
            ).toBeVisible();
            expect(
                screen.getByRole('option', { name: /zweiter buchstabe/i })
            ).toBeVisible();
            expect(
                screen.getByRole('option', { name: /dritter buchstabe/i })
            ).toBeVisible();
            userEvent.click(
                screen.getByRole('option', { name: /erster buchstabe/i })
            );
            expect(setValueFn).toHaveBeenCalledWith('A');
        });
    });

    describe('file element', () => {
        const user = { ...SomeUser };
        let didCallFiles = false;
        const filesMocks = [
            {
                request: {
                    query: GetDirectoriesAndFilesQuery,
                    variables: { parentDirectoryId: null },
                },
                result: () => {
                    didCallFiles = true;
                    return {
                        data: {
                            files: [
                                {
                                    ...imageFile,
                                    userId: user.id,
                                    parentDirectory: {
                                        ...logosDirectory,
                                        user,
                                        parentDirectory: null,
                                    },
                                },
                            ],
                            directories: [
                                {
                                    ...logosDirectory,
                                    user,
                                    parentDirectory: null,
                                },
                            ],
                        },
                    };
                },
            },
        ];

        beforeEach(() => {
            didCallFiles = false;
        });

        it('should render a local file input and select a file as an anonymous user', async () => {
            global.URL.createObjectURL = jest.fn(() => 'http://localhost/0');
            const setValueFn = jest.fn();
            const screen = render(
                <FormElement
                    element={{
                        element: 'file',
                        name: 'blabla1',
                    }}
                    value={''}
                    onSetValue={setValueFn}
                />
            );
            expect(screen.getAllByRole('button')).toHaveLength(1);
            expect(screen.getByRole('button')).toHaveTextContent(
                /datei hochladen/i
            );
            userEvent.upload(
                document.querySelector('input[type=file]')!,
                new File(['hello world'], 'hello.txt', { type: 'text/plain' })
            );
            await waitFor(() => {
                expect(setValueFn).toHaveBeenCalledWith(
                    'file-upload://{"filesize":11,"filename":"hello.txt","filetype":"text/plain","blob":"http://localhost/0"}'
                );
            });
        });

        it('should show a filename for a selected local file, file should be removable', () => {
            const setValueFn = jest.fn();
            const screen = render(
                <FormElement
                    element={{
                        element: 'file',
                        name: 'blabla1',
                    }}
                    value={
                        'file-upload://{"filesize":11,"filename":"hello.txt","filetype":"text/plain","blob":"http://localhost/0"}'
                    }
                    onSetValue={setValueFn}
                />
            );
            expect(
                screen.getByRole('button', { name: /datei hochladen/i })
            ).toBeVisible();
            expect(screen.getByText('hello.txt')).toBeVisible();
            userEvent.click(
                screen.getByRole('button', { name: /auswahl entfernen/i })
            );
            expect(setValueFn).toHaveBeenCalledWith('');
        });

        it('should render a userfile select button and select a file as a user', async () => {
            const setValueFn = jest.fn();
            const screen = render(
                <FormElement
                    element={{
                        element: 'file',
                        name: 'blabla1',
                        maxSize: 1024 * 1024,
                    }}
                    value={''}
                    onSetValue={setValueFn}
                />,
                {},
                {
                    useCache: true,
                    currentUser: user,
                    additionalMocks: filesMocks,
                }
            );
            expect(
                screen.getByRole('button', { name: /datei hochladen/i })
            ).toBeVisible();
            expect(
                screen.getByRole('button', { name: /meine dateien/i })
            ).toBeVisible();
            userEvent.click(
                screen.getByRole('button', { name: /meine dateien/i })
            );
            await waitFor(() =>
                expect(screen.getByRole('presentation')).toBeVisible()
            );
            await waitFor(() => expect(didCallFiles).toEqual(true));
            await waitFor(() =>
                expect(
                    screen.getByRole('row', { name: /logos/i })
                ).toBeVisible()
            );
            userEvent.click(screen.getByRole('row', { name: /logos/i }));
            await waitFor(() =>
                expect(
                    screen.getByRole('row', { name: /dateiname\.jpg/i })
                ).toBeVisible()
            );
            userEvent.click(
                screen.getByRole('row', { name: /dateiname\.jpg/i })
            );
            userEvent.click(screen.getByRole('button', { name: /auswählen/ }));
            expect(setValueFn).toHaveBeenCalledWith(
                'lotta-file-id://' +
                    '{"id":"123","insertedAt":"2001-01-01 14:15","updatedAt":"2001-01-01 14:15","filename":"Dateiname.jpg",' +
                    '"filesize":123123,"mimeType":"image/jpg","fileType":"IMAGE",' +
                    '"userId":"1","fileConversions":[],"parentDirectory":{"id":"8743"}}'
            );
        });

        it('should show a filename for a selected local file, file should be removable', () => {
            const setValueFn = jest.fn();
            const screen = render(
                <FormElement
                    element={{
                        element: 'file',
                        name: 'blabla1',
                    }}
                    value={
                        'lotta-file-id://' +
                        '{"id":"123","insertedAt":"2001-01-01 14:15","updatedAt":"2001-01-01 14:15","filename":"Dateiname.jpg",' +
                        '"filesize":123123,"mimeType":"image/jpg","fileType":"IMAGE",' +
                        '"userId":"1","fileConversions":[],"parentDirectory":{"id":"8743"}}'
                    }
                    onSetValue={setValueFn}
                />
            );
            expect(
                screen.getByRole('button', { name: /datei hochladen/i })
            ).toBeVisible();
            expect(screen.getByText('Dateiname.jpg')).toBeVisible();
            userEvent.click(
                screen.getByRole('button', { name: /auswahl entfernen/i })
            );
            expect(setValueFn).toHaveBeenCalledWith('');
        });
    });
});
