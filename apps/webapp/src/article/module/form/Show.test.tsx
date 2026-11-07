import * as React from 'react';
import { MockedProvider } from '@apollo/client/testing/react';
import { ContentModuleType } from '#/model';
import { Show } from './Show';

const contentModule = {
  id: '1',
  type: ContentModuleType.FORM,
  files: [],
  sortKey: 0,
  insertedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  content: {},
  configuration: {
    destination: 'sekretariat@schule.de',
    elements: [
      {
        element: 'input',
        type: 'text',
        name: 'name',
        label: 'Name des Kindes',
        required: true,
      },
      {
        element: 'input',
        multiline: true,
        name: 'nachricht',
        label: 'Nachricht',
        required: true,
      },
    ],
  },
} as unknown as ShowContentModule;

type ShowContentModule = React.ComponentProps<typeof Show>['contentModule'];

describe('article/module/form/Show', () => {
  it('keeps what was typed into the fields before the page was hydrated', async () => {
    const { renderToString } = await import('react-dom/server');
    const { hydrateRoot } = await import('react-dom/client');
    const { act } = await import('react');

    const element = (
      <MockedProvider mocks={[]}>
        <Show contentModule={contentModule} />
      </MockedProvider>
    );
    const container = document.createElement('div');
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);

    // the visitor fills in the form before the page is hydrated
    container.querySelector<HTMLInputElement>('input[name="name"]')!.value =
      'Elanor Gamdschie';
    container.querySelector<HTMLTextAreaElement>(
      'textarea[name="nachricht"]'
    )!.value = 'Mein Kind ist morgen krank';

    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, element);
    });

    expect(
      container.querySelector<HTMLInputElement>('input[name="name"]')!.value
    ).toEqual('Elanor Gamdschie');
    expect(
      container.querySelector<HTMLTextAreaElement>(
        'textarea[name="nachricht"]'
      )!.value
    ).toEqual('Mein Kind ist morgen krank');
    expect(
      container.querySelector<HTMLButtonElement>('button[type="submit"]')!
        .disabled
    ).toBe(false);

    await act(async () => root!.unmount());
    container.remove();
  });
});
