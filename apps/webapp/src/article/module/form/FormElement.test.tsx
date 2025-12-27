import * as React from 'react';
import { commands } from '@vitest/browser/context';
import { render, waitFor, userEvent } from 'test/util';
import { FormElement } from './FormElement';
import { imageFile, logosDirectory, SomeUser } from 'test/fixtures';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import GetFileDetailsQuery from 'api/query/GetFileDetailsQuery.graphql';

describe('shared/article/module/form/FormElement', () => {
  describe('input element', () => {
    it('should render a text field', async () => {
      const fireEvent = userEvent.setup();
      const setValueFn = vi.fn();
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
      await fireEvent.type(
        screen.getByRole('textbox', { name: /Bla Bla 1/i }),
        'A'
      );
      expect(setValueFn).toHaveBeenLastCalledWith('A');
    });

    it('should render an email field', () => {
      const setValueFn = vi.fn();
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
    it('should render and select checkboxes', async () => {
      const fireEvent = userEvent.setup();
      const setValueFn = vi.fn();
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
      await fireEvent.click(
        screen.getByRole('checkbox', { name: /dritter buchstabe/i })
      );
      expect(setValueFn).toHaveBeenCalledWith(['B', 'C']);

      // de-select
      await fireEvent.click(
        screen.getByRole('checkbox', { name: /zweiter buchstabe/i })
      );
      expect(setValueFn).toHaveBeenCalledWith([]);
    });

    it('should render and select radioboxes', async () => {
      const fireEvent = userEvent.setup();
      const setValueFn = vi.fn();
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

      await fireEvent.click(
        screen.getByRole('radio', { name: /dritter buchstabe/i })
      );
      expect(setValueFn).toHaveBeenCalledWith('C');
    });

    it('should render and select from a select field', async () => {
      const fireEvent = userEvent.setup();
      const setValueFn = vi.fn();
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

      expect(
        screen.getByRole('button', { name: /zweiter buchstabe/i })
      ).toBeVisible();

      await fireEvent.click(
        screen.getByRole('button', { name: /zweiter buchstabe/i })
      );
      expect(screen.getAllByRole('option')).toHaveLength(3);

      await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation to finish

      await fireEvent.click(screen.getByRole('option', { name: /erster/i }));
      expect(setValueFn).toHaveBeenCalledWith('A');
    });
  });

  describe('file element', () => {
    const user = { ...SomeUser };
    const createFilesMocks = () => [
      {
        request: {
          query: GetDirectoriesAndFilesQuery,
          variables: { parentDirectoryId: null },
        },
        result: vi.fn(() => {
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
        }),
      },
      {
        request: {
          query: GetDirectoriesAndFilesQuery,
          variables: { parentDirectoryId: '8743' },
        },
        result: () => {
          return {
            data: {
              files: [],
              directories: [],
            },
          };
        },
      },
      {
        request: {
          query: GetFileDetailsQuery,
          variables: { id: imageFile.id },
        },
        result: () => ({
          data: {
            file: {
              ...imageFile,
              user,
              parentDirectory: {
                ...logosDirectory,
                user,
                parentDirectory: null,
              },
            },
          },
        }),
      },
    ];

    it('should render a local file input and select a file as an anonymous userAvatar', async () => {
      vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce(
        'http://localhost/0'
      );

      const setValueFn = vi.fn();
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
      expect(screen.getByRole('button')).toHaveTextContent(/datei hochladen/i);
      const uploadButton = document.querySelector('input[type=file]')!;
      expect(uploadButton).toBeInTheDocument();
      await commands.setFile('input[type=file]', {
        name: 'hello.txt',
        type: 'text/plain',
        content: 'Hello World',
      });
      await waitFor(() => {
        expect(setValueFn).toHaveBeenCalledWith(
          'file-upload://{"filesize":11,"filename":"hello.txt","filetype":"text/plain","blob":"http://localhost/0"}'
        );
      });
    });

    it('should show a filename for a selected local file, file should be removable', async () => {
      const fireEvent = userEvent.setup();
      const setValueFn = vi.fn();
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
      await fireEvent.click(
        screen.getByRole('button', { name: /auswahl entfernen/i })
      );
      expect(setValueFn).toHaveBeenCalledWith('');
    });

    it('should render a userfile select button and select a file as a userAvatar', async () => {
      const fireEvent = userEvent.setup();
      const setValueFn = vi.fn();
      const additionalMocks = createFilesMocks();
      const screen = render(
        <FormElement
          element={{
            element: 'file',
            name: 'blabla1',
          }}
          value={''}
          onSetValue={setValueFn}
        />,
        {},
        {
          currentUser: user,
          additionalMocks,
        }
      );
      expect(
        screen.getByRole('button', { name: /datei hochladen/i })
      ).toBeVisible();
      expect(
        screen.getByRole('button', { name: /meine dateien/i })
      ).toBeVisible();
      await fireEvent.click(
        screen.getByRole('button', { name: /meine dateien/i })
      );
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeVisible();
      });
      await waitFor(() => {
        expect(additionalMocks[0].result).toHaveBeenCalled();
      });
      await waitFor(() =>
        expect(screen.getByRole('option', { name: /logos/i })).toBeVisible()
      );
      await fireEvent.click(screen.getByRole('option', { name: /logos/i }));
      await waitFor(() =>
        expect(
          screen.getByRole('option', { name: /dateiname\.jpg/i })
        ).toBeVisible()
      );
      await fireEvent.click(
        screen.getByRole('option', { name: /dateiname\.jpg/i })
      );
      await fireEvent.click(screen.getByRole('button', { name: /auswählen/ }));
      expect(setValueFn).toHaveBeenCalledWith(
        'lotta-file-id://' +
          '{"id":"123","insertedAt":"2001-01-01 14:15","updatedAt":"2001-01-01 14:15",' +
          '"filename":"Dateiname.jpg","filesize":123123,"mimeType":"image/jpg","fileType":"IMAGE",' +
          '"userId":"1","parentDirectory":{"id":"8743"}}'
      );
    });

    it('should show a remote file if present, which should be removable', async () => {
      const fireEvent = userEvent.setup();
      const setValueFn = vi.fn();
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
            '"userId":"1","parentDirectory":{"id":"8743"}}'
          }
          onSetValue={setValueFn}
        />
      );
      expect(
        screen.getByRole('button', { name: /datei hochladen/i })
      ).toBeVisible();
      expect(screen.getByText('Dateiname.jpg')).toBeVisible();
      await fireEvent.click(
        screen.getByRole('button', { name: /auswahl entfernen/i })
      );
      expect(setValueFn).toHaveBeenCalledWith('');
    });
  });
});
