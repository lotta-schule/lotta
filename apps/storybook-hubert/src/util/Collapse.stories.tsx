import * as React from 'react';
import { StoryFn, Meta } from '@storybook/react-vite';
import { Collapse, CollapseProps } from '@lotta-schule/hubert';

export default {
  title: 'util/Collapse',
  component: Collapse,
  argTypes: {
    axis: {
      control: {
        type: 'select',
        options: ['x', 'y'],
      },
    },
  },
  args: {
    visible: true,
    axis: 'x',
  },
} as Meta;

const Template: StoryFn<CollapseProps> = (args) => (
  <Collapse {...args}>
    <div>
      <p>
        Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy
        eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam
        voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
        clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit
        amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam
        nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat,
        sed diam voluptua. At vero eos et accusam et justo duo dolores et ea
        rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem
        ipsum dolor sit amet.
      </p>
      <ul>
        <li>Vera; or, The Nihilists (1880) (text)</li>
        <li>The Duchess of Padua (1883) (text)</li>
        <li>Lady Windermere's Fan (1892) (text)</li>
        <li>A Woman of No Importance (1893) (text)</li>
        <li>An Ideal Husband (1895) (text)</li>
        <li>The Importance of Being Earnest (1895) (text)</li>
        <li>Salomé (1896) Translated from French by Lord Alfred Douglas</li>
        <li>La Sainte Courtisane (Incomplete) (text)</li>
        <li>A Florentine Tragedy (Incomplete) (text)</li>
      </ul>
    </div>
  </Collapse>
);

export const Default = {
  render: Template,
};
