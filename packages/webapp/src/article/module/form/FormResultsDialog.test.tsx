/* eslint-disable import/first */
jest.mock('file-saver');
import * as React from 'react';
import { ContentModuleModel, ContentModuleType } from 'model';
import { render, waitFor } from 'test/util';
import { MockedResponse } from '@apollo/client/testing';
import { FormResultsDialog } from './FormResultsDialog';
import { saveAs } from 'file-saver';
import userEvent from '@testing-library/user-event';

import GetContentModuleResults from 'api/query/GetContentModuleResults.graphql';

describe('src/shared/article/module/form/FormResultsDialog', () => {
  const contentModule = {
    id: '31415',
    type: ContentModuleType.FORM,
    files: [],
    sortKey: 0,
    insertedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as ContentModuleModel;

  let didFetchResults = false;
  const mocks: MockedResponse[] = [
    {
      request: {
        query: GetContentModuleResults,
        variables: { contentModuleId: contentModule.id },
      },
      result: () => {
        didFetchResults = true;
        return {
          data: {
            contentModuleResults: [
              {
                id: 'CMR001',
                insertedAt: '2020-12-21T07:24:51.241',
                updatedAt: '2020-12-21T07:24:51.241',
                result: {
                  responses: {
                    blub: 'Hallo',
                    bla: ['S', 'XL'],
                    mail: 'ab@c.de',
                  },
                },
              },
              {
                id: 'CMR002',
                insertedAt: '2020-12-21T07:24:51.241',
                updatedAt: '2020-12-21T07:24:51.241',
                result: {
                  responses: {
                    blub: 'Test',
                    bla: [],
                    mail: 'de@z.xy',
                  },
                },
              },
              {
                id: 'CMR003',
                insertedAt: '2020-12-21T07:24:51.241',
                updatedAt: '2020-12-21T07:24:51.241',
                result: {
                  responses: {
                    blub: 'Tschu tschu',
                    bla: ['XL'],
                    mail: 'de@z.xy',
                  },
                },
              },
            ],
          },
        };
      },
    },
  ];
  beforeEach(() => {
    didFetchResults = false;
  });

  it('should not show dialog when isOpen is not set', () => {
    const screen = render(
      <FormResultsDialog
        isOpen={false}
        onRequestClose={() => {}}
        contentModule={contentModule as any}
      />,
      {},
      { additionalMocks: [...mocks] }
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should show dialog when isOpen is set', async () => {
    const screen = render(
      <FormResultsDialog
        isOpen
        onRequestClose={() => {}}
        contentModule={contentModule as any}
      />,
      {},
      { additionalMocks: [...mocks] }
    );
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeVisible();
    });
    expect(
      screen.queryByRole('heading', { name: /formulardaten/i })
    ).toBeVisible();
  });

  it('should generate and download a csv when the button is clicked', async () => {
    const fireEvent = userEvent.setup();
    global.URL.createObjectURL = jest.fn(() => 'http://localhost/0');

    const screen = render(
      <FormResultsDialog
        isOpen
        onRequestClose={() => {}}
        contentModule={contentModule as any}
      />,
      {},
      { additionalMocks: mocks }
    );
    await waitFor(() => {
      expect(didFetchResults).toEqual(true);
    });
    expect(screen.getByText('3 gespeicherte Einsendungen')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /csv herunterladen/i })
    ).toBeInTheDocument();

    let data: Blob, filename: string;
    (saveAs as any).mockImplementation((_data: Blob, _filename: string) => {
      data = _data;
      filename = _filename;
    });
    await fireEvent.click(
      screen.getByRole('button', { name: /csv herunterladen/i })
    );
    expect(saveAs).toHaveBeenCalled();
    return waitFor(() => {
      expect(data).not.toBeNull();
    }).then(async () => {
      expect(filename).toEqual('formulardaten.csv');
      expect(data.type).toMatch(/text\/csv/);
      expect(await new Response(data).text()).toEqual(
        '"Datum","blub","bla","mail"\r\n' +
          '"21.12.2020 07:24","Hallo","S,XL","ab@c.de"\r\n' +
          '"21.12.2020 07:24","Test","","de@z.xy"\r\n' +
          '"21.12.2020 07:24","Tschu tschu","XL","de@z.xy"'
      );
    });
  });
});
