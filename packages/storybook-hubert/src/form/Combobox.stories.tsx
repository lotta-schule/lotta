import * as React from 'react';
import { StoryObj, Meta } from '@storybook/react';
import { expect } from '@storybook/jest';
import { userEvent, waitFor, within } from '@storybook/testing-library';
import {
  Close,
  ComboBox,
  DragHandle,
  KeyboardArrowLeft,
} from '@lotta-schule/hubert';
import { action } from '@storybook/addon-actions';

export default {
  title: 'form/ComboBox',
  component: ComboBox,
  subcomponents: {},
  args: {
    title: 'Chose an icon ... wisely',
    onSelect: action('onSelect'),
  },
  docs: {
    description: {
      component: `
            The ComboBox allows the user to get suggestions for a given input.
            The user can then either select one of the suggestions or, if adjusted, enter a new one.
            `,
    },
  },
} as Meta<typeof ComboBox>;

export const WithPredefinedItems: StoryObj<typeof ComboBox> = {
  args: {
    items: [
      {
        key: 'home',
        leftSection: <DragHandle />,
        label: 'Home',
        textValue: 'Home',
      },
      {
        key: 'alarm',
        leftSection: <Close />,
        label: 'Alarm with right X',
        textValue: 'Alarm',
        selected: true,
      },
      {
        key: 'account',
        leftSection: <KeyboardArrowLeft />,
        label: 'Balance',
        textValue: 'Balance',
      },
    ],
  },

  play: async ({ canvasElement }) => {
    const fireEvent = userEvent.setup({ delay: 100 });
    const canvas = within(canvasElement);

    await fireEvent.click(canvas.getByRole('button'));
    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeVisible();
    });

    await fireEvent.click(canvas.getByRole('option', { name: 'Balance' }));
  },
};

export const WithRequestedItems: StoryObj<typeof ComboBox> = {
  args: {
    title: 'Search for a Star Wars character or species',
    items: async (value: string) => {
      return Promise.all([
        searchSWApi('people', value),
        searchSWApi('species', value),
      ]).then((results: { results: { name: string }[] }[]) => {
        return results
          .reduce(
            (acc, result) => {
              return acc.concat(result.results);
            },
            [] as { name: string }[]
          )
          .sort((a, b) => {
            return a.name.localeCompare(b.name);
          })
          .map((result) => ({
            key: result.name,
            label: result.name,
            leftSection: <Close />,
          }));
      });
    },
  },

  name: 'fetching items while typing',

  play: async ({ canvasElement }) => {
    const fireEvent = userEvent.setup({ delay: 100 });
    const canvas = within(canvasElement);

    await fireEvent.click(canvas.getByRole('combobox'));
    await fireEvent.keyboard('yoda');

    await waitFor(
      () => {
        expect(canvas.getByRole('listbox')).toBeVisible();
      },
      { timeout: 15000 }
    );

    await fireEvent.click(canvas.queryAllByRole('option')?.[0]);
  },
};

const searchSWApi = (
  type: 'people' | 'starships' | 'vehicles' | 'species' | 'planets',
  value: string
) => {
  return fetch(
    'https://swapi.dev/api/' + type + '/?search=' + encodeURIComponent(value),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  ).then((response) => response.json());
};
