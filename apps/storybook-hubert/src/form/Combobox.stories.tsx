import * as React from 'react';
import { StoryObj, Meta } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import {
  Close,
  ComboBox,
  DragHandle,
  KeyboardArrowLeft,
} from '@lotta-schule/hubert';

export default {
  title: 'form/ComboBox',
  component: ComboBox,
  subcomponents: {},
  args: {
    title: 'Chose an icon ... wisely',
    onSelect: fn(),
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

    await new Promise((resolve) => setTimeout(resolve, 500)); // wait for animation to finish

    await fireEvent.click(canvas.getByRole('option', { name: 'Balance' }));
  },
};

export const WithRequestedItems: StoryObj<typeof ComboBox> = {
  args: {
    title: 'Search for a Star Wars character or species',
    items: async (value: string) => {
      return getResults(value).then((results) => {
        return results.sort().map((result) => ({
          key: result,
          label: result,
          leftSection: <Close />,
        }));
      });
    },
  },

  name: 'fetching items while typing',

  play: async ({ canvasElement, args }) => {
    const fireEvent = userEvent.setup({ delay: 50 });
    const canvas = within(canvasElement);

    await fireEvent.click(canvas.getByRole('combobox'));
    await fireEvent.keyboard('yoda');

    await waitFor(() => {
      expect(canvas.getByRole('listbox')).toBeVisible();
    });

    await new Promise((resolve) => setTimeout(resolve, 400)); // wait for animation to finish

    await waitFor(() => {
      expect(canvas.getAllByRole('option')).toHaveLength(1);
    });

    await fireEvent.click(canvas.getByRole('option', { name: 'Yoda' }));

    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).toBeNull();
    });
    expect(args.onSelect).toHaveBeenCalledWith('Yoda');
  },

  parameters: {
    chromatic: { delay: 500 },
  },
};

const getResults = (value: string) => {
  const people = [
    'Luke Skywalker',
    'C-3PO',
    'R2-D2',
    'Darth Vader',
    'Leia Organa',
    'Owen Lars',
    'Beru Whitesun lars',
    'R5-D4',
    'Biggs Darklighter',
    'Obi-Wan Kenobi',
    'Anakin Skywalker',
    'Wilhuff Tarkin',
    'Chewbacca',
    'Han Solo',
    'Greedo',
    'Jabba Desilijic Tiure',
    'Wedge Antilles',
    'Jek Tono Porkins',
    'Yoda',
    'Palpatine',
    'Boba Fett',
    'IG-88',
    'Bossk',
    'Lando Calrissian',
    'Lobot',
    'Ackbar',
    'Mon Mothma',
    'Arvel Crynyd',
    'Wicket Systri Warrick',
    'Nien Nunb',
    'Qui-Gon Jinn',
    'Nute Gunray',
    'Finis Valorum',
    'Padmé Amidala',
    'Jar Jar Binks',
    'Roos Tarpals',
    'Rugor Nass',
    'Ric Olié',
    'Watto',
    'Sebulba',
    'Quarsh Panaka',
    'Shmi Skywalker',
    'Darth Maul',
    'Bib Fortuna',
    'Ayla Secura',
    'Ratts Tyerel',
    'Dud Bolt',
    'Gasgano',
    'Ben Quadinaros',
    'Mace Windu',
    'Ki-Adi-Mundi',
    'Kit Fisto',
    'Eeth Koth',
    'Adi Gallia',
    'Saesee Tiin',
    'Yarael Poof',
    'Plo Koon',
    'Mas Amedda',
    'Gregar Typho',
    'Cordé',
    'Cliegg Lars',
    'Poggle the Lesser',
    'Luminara Unduli',
    'Barriss Offee',
    'Dormé',
    'Dooku',
    'Bail Prestor Organa',
    'Jango Fett',
    'Zam Wesell',
    'Dexter Jettster',
    'Lama Su',
    'Taun We',
    'Jocasta Nu',
    'R4-P17',
    'Wat Tambor',
    'San Hill',
    'Shaak Ti',
    'Grievous',
    'Tarfful',
    'Raymus Antilles',
    'Sly Moore',
    'Tion Medon',
  ];
  return new Promise<string[]>((resolve) => {
    setTimeout(() => {
      resolve(
        people.filter((p) => p.toLowerCase().includes(value.toLowerCase()))
      );
    }, 250);
  });
};
