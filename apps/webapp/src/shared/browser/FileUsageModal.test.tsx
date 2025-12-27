import * as React from 'react';
import { render, waitFor, within, userEvent } from 'test/util';
import { MockLink } from '@apollo/client/testing';
import {
  ComputerExperten,
  FaecherCategory,
  SomeUser,
  imageFile,
  tenant,
} from 'test/fixtures';
import { FileUsageModal } from './FileUsageModal';

import GetFileDetailsQuery from 'api/query/GetFileDetailsQuery.graphql';

describe('FileUsageModal Component', () => {
  const usages = [
    { __typename: 'FileSystemUsageLocation', usage: 'logo', tenant },
    {
      __typename: 'FileArticleUsageLocation',
      usage: 'preview',
      article: ComputerExperten,
    },
    {
      __typename: 'FileCategoryUsageLocation',
      usage: 'banner',
      category: FaecherCategory,
    },
    { __typename: 'FileUserUsageLocation', usage: 'avatar', user: SomeUser },
  ];

  const additionalMocks: MockLink.MockedResponse[] = [
    {
      request: { query: GetFileDetailsQuery, variables: { id: imageFile.id } },
      result: {
        data: {
          file: {
            ...imageFile,
            user: null,
            parentDirectory: null,
            usage: usages,
          },
        },
      },
    },
  ];

  it('should open / close', async () => {
    const user = userEvent.setup();

    const onRequestClose = vi.fn();
    const screen = render(
      <FileUsageModal
        file={imageFile}
        isOpen={false}
        onRequestClose={onRequestClose}
      />,
      {},
      { additionalMocks }
    );
    expect(screen.queryByRole('dialog')).toBeNull();

    screen.rerender(
      <FileUsageModal file={imageFile} isOpen onRequestClose={onRequestClose} />
    );

    await waitFor(() => {
      expect(
        screen.getByRole('dialog', { name: /Nutzung.*Dateiname\.jpg/i })
      ).toBeVisible();
    });

    await user.click(screen.getByRole('button', { name: /schließen/i }));
    expect(onRequestClose).toHaveBeenCalled();

    screen.rerender(
      <FileUsageModal
        file={imageFile}
        isOpen={false}
        onRequestClose={onRequestClose}
      />
    );

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
  });

  describe('usage', () => {
    it('should show usage', async () => {
      const screen = render(
        <FileUsageModal file={imageFile} isOpen onRequestClose={() => {}} />,
        {},
        { additionalMocks }
      );

      await waitFor(() => {
        expect(screen.getByRole('list')).toBeVisible();
      });

      expect(
        within(screen.getByRole('list')).getAllByRole('listitem')
      ).toHaveLength(4);

      const systemLi = within(screen.getByRole('list')).getAllByRole(
        'listitem'
      )[0];
      expect(systemLi).toHaveTextContent(/SeitenLayout/);
      expect(systemLi).toHaveTextContent(/Logo/);

      const articleLi = within(screen.getByRole('list')).getAllByRole(
        'listitem'
      )[1];
      expect(articleLi).toHaveTextContent(/Beitrag:/);
      expect(articleLi).toHaveTextContent(/Vorschaubild/);

      const categoryLi = within(screen.getByRole('list')).getAllByRole(
        'listitem'
      )[2];
      expect(categoryLi).toHaveTextContent(/Kategorie:/);
      expect(categoryLi).toHaveTextContent(/Banner/);

      const userLi = within(screen.getByRole('list')).getAllByRole(
        'listitem'
      )[3];
      expect(userLi).toHaveTextContent(/Nutzer:/);
      expect(userLi).toHaveTextContent(/Profilbild/);
    });
  });
});
