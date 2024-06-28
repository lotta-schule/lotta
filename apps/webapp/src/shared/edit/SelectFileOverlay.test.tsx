import * as React from 'react';
import { render, waitFor, within } from 'test/util';
import { SelectFileOverlay } from './SelectFileOverlay';
import { MockedResponse } from '@apollo/client/testing';
import { imageFile, logosDirectory } from 'test/fixtures';
import userEvent from '@testing-library/user-event';

import GetDirectoriesAndFiles from 'api/query/GetDirectoriesAndFiles.graphql';
import GetFileDetailsQuery from 'api/query/GetFileDetailsQuery.graphql';

describe('SelectFileOverlay Component', () => {
  const additionalMocks: MockedResponse[] = [
    {
      request: {
        query: GetDirectoriesAndFiles,
        variables: {
          parentDirectoryId: null,
        },
      },
      result: {
        data: {
          directories: [{ ...logosDirectory, user: null }],
          files: [{ ...imageFile, userId: null, parentDirectory: null }],
        },
      },
    },
    {
      request: {
        query: GetFileDetailsQuery,
        variables: {
          id: imageFile.id,
        },
      },
      result: {
        data: {
          file: {
            ...imageFile,
            user: null,
            parentDirectory: null,
          },
        },
      },
    },
  ];

  it('renders with label and description', () => {
    const label = 'Select File';
    const description = 'Please select a file.';

    const screen = render(
      <SelectFileOverlay
        label={label}
        description={description}
        onSelectFile={() => {}}
      >
        <div>Child Component</div>
      </SelectFileOverlay>,
      {},
      { additionalMocks }
    );

    expect(screen.getByText(label)).toBeInTheDocument();

    expect(screen.getByText(description)).toBeInTheDocument();

    expect(screen.getByText('Child Component')).toBeInTheDocument();
  });

  it('opens dialog and selects file', async () => {
    const user = userEvent.setup();
    const onSelectFileMock = vi.fn();

    const screen = render(
      <SelectFileOverlay label="Select File" onSelectFile={onSelectFileMock}>
        <div>Child Component</div>
      </SelectFileOverlay>,
      {},
      { additionalMocks }
    );

    const selectButton = screen.getByText('Select File');
    await user.click(selectButton);

    const dialog = await screen.findByRole('dialog');

    await waitFor(() => {
      expect(dialog).toBeVisible();
    });

    const fileItem = within(dialog).getByRole('option', {
      name: imageFile.filename,
    });
    await user.click(fileItem);

    const selectFileButton = screen.getByRole('button', {
      name: 'Datei auswählen',
    });
    await user.click(selectFileButton);

    expect(onSelectFileMock).toHaveBeenCalledWith(
      Object.assign(
        {},
        imageFile,
        { __typename: undefined, usage: undefined },
        {
          userId: null,
          parentDirectory: null,
        }
      )
    );
  });
});
