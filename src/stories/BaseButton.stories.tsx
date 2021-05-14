import * as React from 'react';
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Story, Meta } from '@storybook/react/types-6-0';

import {
    BaseButton,
    BaseButtonProps,
} from '../component/general/button/BaseButton';
import { Avatar } from '../component/general/avatar/Avatar';

export default {
    title: 'Buttons/BaseButton',
    component: BaseButton,
    argTypes: {},
} as Meta;

const Template: Story<Omit<BaseButtonProps, 'ref'>> = (args) => (
    <BaseButton {...args} />
);

export const General = Template.bind({});
General.args = {
    children: 'Der Button ist sehr allgemein gehalten',
};

export const Disabled = Template.bind({});
Disabled.args = {
    children: 'Der Button darf nichts',
    as: 'button',
    disabled: true,
} as any;

export const FillVariant = Template.bind({});
FillVariant.args = {
    variant: 'fill',
    children: "Es gibt eine 'fill' Variante",
};

export const ErrorVariant = Template.bind({});
ErrorVariant.args = {
    variant: 'error',
    children: "Es gibt eine 'error' Variante",
};

export const FullWidth = Template.bind({});
FullWidth.args = {
    fullWidth: true,
    children: 'Volle Breite',
};

export const Selected = Template.bind({});
Selected.args = {
    selected: true,
    children: 'Ausgewählt',
};

export const Complex = Template.bind({});
Complex.args = {
    children: (
        <div style={{ display: 'flex' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label>Der Vorteil am BaseButton</label>
                <strong>Er ist sehr flexibel</strong>
            </div>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    paddingLeft: '1em',
                }}
            >
                <Avatar src={''} />
            </div>
        </div>
    ),
};
