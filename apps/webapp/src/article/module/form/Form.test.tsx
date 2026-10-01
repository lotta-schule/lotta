import * as React from 'react';
import { ContentModuleModel, ContentModuleType } from '#/model';
import { render, waitFor } from '#/test/util';
import { MockLink } from '@apollo/client/testing';
import { Form } from './Form';

import GetContentModuleResults from '#/api/query/GetContentModuleResults.graphql';

describe('shared/article/modules/form/Form', () => {
  const contentModule = {
    id: '31415',
    type: ContentModuleType.FORM,
    configuration: { elements: [] },
    files: [],
    sortKey: 0,
    insertedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as ContentModuleModel;

  const createMocks = (results: unknown[]): MockLink.MockedResponse[] => [
    {
      request: {
        query: GetContentModuleResults,
        variables: { contentModuleId: contentModule.id },
      },
      result: () => ({ data: { contentModuleResults: results } }),
    },
  ];

  it('should disable the "view submissions" button when there are no submissions', async () => {
    const screen = render(
      <Form contentModule={contentModule} userCanEditArticle />,
      {},
      { additionalMocks: createMocks([]) }
    );
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /formulareinsendungen sehen/i })
      ).toBeDisabled();
    });
  });

  it('should enable the "view submissions" button when there are submissions', async () => {
    const screen = render(
      <Form contentModule={contentModule} userCanEditArticle />,
      {},
      {
        additionalMocks: createMocks([
          {
            id: 'CMR001',
            insertedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            result: { responses: {} },
          },
        ]),
      }
    );
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /formulareinsendungen sehen/i })
      ).not.toBeDisabled();
    });
  });

  it('should not render the "view submissions" button when the user cannot edit the article', () => {
    const screen = render(
      <Form contentModule={contentModule} userCanEditArticle={false} />
    );
    expect(
      screen.queryByRole('button', { name: /formulareinsendungen sehen/i })
    ).not.toBeInTheDocument();
  });
});
